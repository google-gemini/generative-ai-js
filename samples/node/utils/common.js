/**
 * @license
 * Copyright 2023 Google LLC
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

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const samplesDir = join(__dirname, "../");

export function findFunctions(fileText) {
  const lines = fileText.split("\n");
  const functions = {};
  let currentFunctionName = "";
  for (const [index, line] of lines.entries()) {
    const functionStartParts = line.match(/^(async function|function) (.+)\(/);
    if (functionStartParts) {
      currentFunctionName = functionStartParts[2];
      functions[currentFunctionName] = { body: [] };
    } else if (line.match(/^}$/)) {
      currentFunctionName = "";
    } else if (currentFunctionName) {
      const tagStartParts = line.match(/\/\/ \[START (.+)\]/);
      const tagEndParts = line.match(/\/\/ \[END (.+)\]/);
      const importHead = line.match(/\/\/ Make sure to include/);
      const importComment = line.match(/\/\/ import /);
      if (tagStartParts) {
        functions[currentFunctionName].startTag = {
          line: index,
          tag: tagStartParts[1],
        };
      } else if (tagEndParts) {
        functions[currentFunctionName].endTag = {
          line: index,
          tag: tagEndParts[1],
        };
      } else if (importHead || importComment) {
        if (!functions[currentFunctionName].importComments) {
          functions[currentFunctionName].importComments = [];
        }
        functions[currentFunctionName].importComments.push(line);
      } else {
        functions[currentFunctionName].body.push(line);
      }
    }
  }
  return functions;
}

// Get your API key from https://makersuite.google.com/app/apikey
// Access your API key as an environment variable
export const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Converts local file information to a GoogleGenerativeAI.Part object
export function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

// Prints chunks of generated text to the console as they become available
export async function streamToStdout(stream) {
  console.log("Streaming...\n");
  for await (const chunk of stream) {
    // Get first candidate's current text chunk
    const chunkText = chunk.text();
    // Print to console without adding line breaks
    process.stdout.write(chunkText);
  }
  // Print blank line
  console.log("\n");
}

export async function displayTokenCount(model, request) {
  const { totalTokens } = await model.countTokens(request);
  console.log("Token count: ", totalTokens);
}

export async function displayChatTokenCount(model, chat, msg) {
  const history = await chat.getHistory();
  const msgContent = { role: "user", parts: [{ text: msg }] };
  await displayTokenCount(model, { contents: [...history, msgContent] });
}
