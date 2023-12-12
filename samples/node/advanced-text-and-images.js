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

import {
  genAI,
  fileToGenerativePart,
  displayTokenCount,
  streamToStdout,
} from "./utils/common.js";

async function run() {
  // For text-and-images inputs (multimodal), use the gemini-pro-vision model
  const model = genAI.getGenerativeModel({
    model: "gemini-pro-vision",
    generationConfig: {
      temperature: 0.9,
    },
  });

  const prompt = " Give me the recipe for these, keto-friendly.";

  // Note: The only accepted mime types are some image types, image/*.
  const imageParts = [fileToGenerativePart("./utils/scones.jpg", "image/jpeg")];

  displayTokenCount(model, [...imageParts, prompt]);

  const result = await model.generateContentStream([...imageParts, prompt]);

  // Stream the first candidate text
  await streamToStdout(result.stream);

  // Display the aggregated response
  const response = await result.response;
  console.log(JSON.stringify(response, null, 2));
}

run();
