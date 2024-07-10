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

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAICacheManager, GoogleAIFileManager } from "@google/generative-ai/server";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mediaPath = __dirname + "/media";

async function cacheCreate() {
  // [START cache_create]
  const cacheManager = new GoogleAICacheManager(process.env.API_KEY);
  const fileManager = new GoogleAIFileManager(process.env.API_KEY);

  const uploadResult = await fileManager.uploadFile(`${mediaPath}/a11.txt`, { mimeType: 'text/plain' });

  const cacheResult = await cacheManager.create({
    model: "models/gemini-1.5-flash-001",
    contents: [
      {
        role: "user",
        parts: [{ fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType
        } }],
      },
    ],
  });

  console.log(cacheResult);

  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModelFromCachedContent(cacheResult);
  const result = await model.generateContent("Please summarize this transcript.");
  console.log(result.response.text());
  await cacheManager.delete(cacheResult.name);
  // [END cache_create]
}

async function cacheCreateFromName() {
  // [START cache_create_from_name]
  const cacheManager = new GoogleAICacheManager(process.env.API_KEY);
  const fileManager = new GoogleAIFileManager(process.env.API_KEY);

  const uploadResult = await fileManager.uploadFile(`${mediaPath}/a11.txt`, { mimeType: 'text/plain' });

  const cacheResult = await cacheManager.create({
    model: "models/gemini-1.5-flash-001",
    contents: [
      {
        role: "user",
        parts: [{ fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType
        } }],
      },
    ],
  });
  const cacheName = cacheResult.name; // Save the name for later.

  // Later
  const getCacheResult = await cacheManager.get(cacheName);
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModelFromCachedContent(getCacheResult);
  model.generateContent("Please summarize this transcript.");
  await cacheManager.delete(cacheResult.name);
  // [END cache_create_from_name]
}

async function runAll() {
  // Comment out or delete any sample cases you don't want to run.
  await cacheCreate();
  await cacheCreateFromName
}

runAll();
