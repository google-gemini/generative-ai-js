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
import { join } from "path";

/**
 * Checks samples to make sure they have region tags and the tags match the
 * function name.
 */
async function checkSamples() {
  const files = fs.readdirSync(samplesDir);
  for (const filename of files) {
    if (filename.match(/.+\.js$/) && !filename.includes("-")) {
      const file = fs.readFileSync(join(samplesDir, filename), "utf-8");
      const functions = findFunctions(file);
      for (const sampleFn in functions) {
        if (sampleFn === "runAll" || sampleFn === "run") {
          continue;
        }
        if (!functions[sampleFn].startTag || !functions[sampleFn].endTag) {
          console.error(
            `[${filename}]: Start and end tag not found or not correct in function ${sampleFn}`,
          );
        }
        if (
          camelCaseToUnderscore(sampleFn) !== functions[sampleFn].startTag.tag
        ) {
          console.error(
            `[${filename}]: Region start tag ${functions[sampleFn].startTag.tag} doesn't match function name ${sampleFn}`,
          );
        }
        if (
          functions[sampleFn].startTag.tag !== functions[sampleFn].endTag.tag ||
          functions[sampleFn].endTag.line <= functions[sampleFn].startTag.line
        ) {
          console.error(
            `[${filename}]: Region end tag ${functions[sampleFn].endTag.tag} doesn't match start tag ${functions[sampleFn].startTag.tag}`,
          );
        }
      }
    }
  }
}

function camelCaseToUnderscore(camelCaseName) {
  return camelCaseName
    .split(/\.?(?=[A-Z])/)
    .join("_")
    .toLowerCase();
}

checkSamples();
