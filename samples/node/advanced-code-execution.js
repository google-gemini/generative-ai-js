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

import { genAI } from "./utils/common.js";

async function run() {
  const tools = [
    {
      codeExecution: {},
    },
  ];

  const model = genAI.getGenerativeModel(
    { model: "gemini-1.5-flash-latest", tools }
  );

  const result = await model.generateContent(
    "What are the last 4 digits of the sum of the first 70 prime numbers?",
  );
  const response = result.response;
  console.log(response.text());
}

run();
