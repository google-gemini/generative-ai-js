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
 * Example of uploading a content cache and referencing it in a call to
 * generateContent().
 *
 * NOTE: Creating and modifying content caches is a feature only available for
 * use in Node.
 */

import { GoogleAICacheManager } from "@google/generative-ai/server";
import { genAI } from "./utils/common.js";

async function run() {
  const cacheManager = new GoogleAICacheManager(process.env.API_KEY);

  // Generate a very long string
  let longContentString = "";
  for (let i = 0; i < 32001; i++) {
    longContentString += "Purple cats drink gatorade.";
    longContentString += i % 8 === 7 ? "\n" : " ";
  }

  const cacheResult = await cacheManager.create({
    ttlSeconds: 600,
    model: "models/gemini-1.5-pro-001",
    contents: [
      {
        role: "user",
        parts: [{ text: longContentString }],
      },
    ],
  });

  const cache = await cacheManager.get(cacheResult.name);

  const model = genAI.getGenerativeModelFromCachedContent(cache);

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: "What do purple cats drink?" }],
      },
    ],
  });

  const response = result.response;
  const text = response.text();
  console.log(text);
}

run();
