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

/**
 * Example of uploading a file and referencing it in a call to
 * generateContent().
 * 
 * NOTE: The Files API is only available for use in Node.
 * Importing GoogleAIFileManager will crash in the
 * browser.
 */

import { GoogleAIFileManager } from "@google/generative-ai/server";
import { genAI } from "./utils/common.js";

async function run() {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
  });
  const fileManager = new GoogleAIFileManager(process.env.API_KEY);

  const fileResult = await fileManager.uploadFile("./utils/cat.jpg", {
    mimeType: "image/jpeg",
    // It will also add the necessary "files/" prefix if not provided
    name: "files/catname",
    displayName: "mrcat",
  });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: "What is this?" },
          {
            fileData: {
              mimeType: fileResult.file.mimeType,
              fileUri: fileResult.file.uri
            }
          },
        ],
      },
    ],
  });

  const response = result.response;
  const text = response.text();
  console.log(text);
}

run();
