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
  DynamicRetrievalMode,
  GoogleGenerativeAI,
} from "@google/generative-ai";

// `google_search_retrieval` is available in Gemini 1.5
async function searchGrounding() {
  // [START search_grounding]
  // Make sure to include these imports:
  // import {
  //  DynamicRetrievalMode,
  //  GoogleGenerativeAI,
  // } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel(
    {
      model: "gemini-1.5-flash",
      tools: [
        {
          googleSearchRetrieval: {
            dynamicRetrievalConfig: {
              mode: DynamicRetrievalMode.MODE_DYNAMIC,
              dynamicThreshold: 0.7,
            },
          },
        },
      ],
    },
  );

  const prompt = "What is the price of Google stock today?";
  const result = await model.generateContent(prompt);
  console.log(result.response.candidates[0].groundingMetadata);
  // [END search_grounding]
}

// `google_search` is available in Gemini 2.0
async function googleSearch() {
  // [START google_search]
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
  // [END google_search]
}

async function runAll() {
  // Comment out or delete any sample cases you don't want to run.
  await searchGrounding();
  await googleSearch();
}

runAll();
