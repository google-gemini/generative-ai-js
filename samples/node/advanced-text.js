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

import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { genAI, displayTokenCount, streamToStdout } from "./utils/common.js";

async function run() {
  // For text-only inputs, use the gemini-pro model
  const model = genAI.getGenerativeModel({
    model: "gemini-pro",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
  });

  const prompt = 'Please describe in detail the movie "Eyes wide shut"';

  displayTokenCount(model, prompt);

  const result = await model.generateContentStream(prompt);
  await streamToStdout(result.stream);

  // Display the aggregated response
  const response = await result.response;
  console.log(JSON.stringify(response, null, 2));
}

run();
