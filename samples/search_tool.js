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

import {
  GoogleGenerativeAI,
} from "@google/generative-ai";

async function searchGrounding() {
  // [USE google_search as a tool in Gemini 2.0]
  // Make sure to include these imports:
  // import {
  //  GoogleGenerativeAI,
  // } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel(
    {
      model: "gemini-2.0-flash-exp",
      tools: [
        {
          googleSearch: {},
        },
      ],
    },
  );

  const prompt = "What is the price of Google stock today?";
  const result = await model.generateContent(prompt);
  console.log(result.response.candidates[0].groundingMetadata);
  // [END search_grounding]
}
async function runAll() {
  // Comment out or delete any sample cases you don't want to run.
  await searchGrounding();
}

runAll();
