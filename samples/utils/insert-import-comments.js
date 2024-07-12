/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { findFunctions, samplesDir } from "./common.js";
import fs from "fs";
import ts from "typescript";
import { dirname, join } from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

function getTopLevelSymbols(filePath) {
  const typings = fs.readFileSync(filePath, "utf-8");

  const sourceFile = ts.createSourceFile(
    filePath,
    typings,
    ts.ScriptTarget.ES2015,
  );
  let symbols = [];
  ts.forEachChild(sourceFile, (node) => {
    if (node.name) {
      symbols.push(node.name.text);
    }
  });
  return symbols;
}

export function getAvailableSymbols() {
  let packagePath = require.resolve('@google/generative-ai/package.json');
  const pkg = require(packagePath);
  const coreSymbols = getTopLevelSymbols(join(dirname(packagePath), pkg.exports["."].types));
  const serverSymbolsRaw = getTopLevelSymbols(join(dirname(packagePath), pkg.exports["./server"].types));
  const serverSymbols = serverSymbolsRaw.filter(
    (serverSymbol) => !coreSymbols.includes(serverSymbol),
  );
  return [
    {
      importPath: "@google/generative-ai",
      symbols: coreSymbols,
    },
    {
      importPath: "@google/generative-ai/server",
      symbols: serverSymbols,
    },
  ];
}

const requiredImports = getAvailableSymbols();

function listRequiredImports(line) {
  const results = [];
  for (const requiredImport of requiredImports) {
    for (const symbol of requiredImport.symbols) {
      if (line.match(new RegExp(`[^a-zA-Z0-9]${symbol}[^a-zA-Z0-9]`))) {
        if (!results[requiredImport.importPath]) {
          results[requiredImport.importPath] = [];
        }
        results[requiredImport.importPath].push(symbol);
        results.push({ symbol, importPath: requiredImport.importPath });
      }
    }
  }
  return results;
}

/**
 * Inserts comments describing the required imports for making the code
 * sample work, since we cannot add actual import statements inside
 * the samples.
 */
async function insertImportComments() {
  const files = fs.readdirSync(samplesDir);
  for (const filename of files) {
    if (filename.match(/.+\.js$/) && !filename.includes("-")) {
      const file = fs.readFileSync(join(samplesDir, filename), "utf-8");
      const functions = findFunctions(file);
      for (const fnName in functions) {
        const sampleFn = functions[fnName];
        let results = [];
        for (const line of sampleFn.body) {
          results = results.concat(listRequiredImports(line));
        }
        if (results.length > 0) {
          functions[fnName].requiredImports = {};
          for (const result of results) {
            if (!functions[fnName].requiredImports[result.importPath]) {
              functions[fnName].requiredImports[result.importPath] = new Set();
            }
            functions[fnName].requiredImports[result.importPath].add(
              result.symbol,
            );
          }
        }
      }
      const fileLines = file.split("\n");
      const newFileLines = [];
      for (const fileLine of fileLines) {
        const importHead = fileLine.match(/\/\/ Make sure to include/);
        const importComment = fileLine.match(/\/\/ import /);
        if (!importHead && !importComment) {
          newFileLines.push(fileLine);
        }
        const tagStartParts = fileLine.match(/\/\/ \[START (.+)\]/);
        if (tagStartParts) {
          const fnName = underscoreToCamelCase(tagStartParts[1]);
          if (functions[fnName].requiredImports) {
            newFileLines.push(`  // Make sure to include these imports:`);
            for (const importPath in functions[fnName].requiredImports) {
              const symbols = Array.from(
                functions[fnName].requiredImports[importPath],
              );
              newFileLines.push(
                `  // import { ${symbols.join(", ")} } from "${importPath}";`,
              );
            }
          }
        }
      }
      fs.writeFileSync(join(samplesDir, filename), newFileLines.join("\n"));
    }
  }
}

function underscoreToCamelCase(underscoreName) {
  return underscoreName
    .split("_")
    .map((part, i) =>
      i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join("");
}

insertImportComments();
