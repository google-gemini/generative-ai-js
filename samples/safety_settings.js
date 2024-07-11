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
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";

async function safetySettings() {
  // [START safety_settings]
  // Make sure to include these imports:
  // import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
    ],
  });

  const unsafePrompt =
    "I support Martians Soccer Club and I think " +
    "Jupiterians Football Club sucks! Write an ironic phrase telling " +
    "them how I feel about them.";

  const result = await model.generateContent(unsafePrompt);

  try {
    result.response.text();
  } catch (e) {
    console.error(e);
    console.log(result.response.candidates[0].safetyRatings);
  }
  // [END safety_settings]
}

async function safetySettingsMulti() {
  // [START safety_settings_multi]
  // Make sure to include these imports:
  // import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
    ],
  });

  const unsafePrompt =
    "I support Martians Soccer Club and I think " +
    "Jupiterians Football Club sucks! Write an ironic phrase telling " +
    "them how I feel about them.";

  const result = await model.generateContent(unsafePrompt);

  try {
    result.response.text();
  } catch (e) {
    console.error(e);
    console.log(result.response.candidates[0].safetyRatings);
  }
  // [END safety_settings_multi]
}

async function runAll() {
  // Comment out or delete any sample cases you don't want to run.
  await safetySettings();
  await safetySettingsMulti();
}

runAll();
