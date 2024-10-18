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

import {GoogleGenerativeAI} from "@google/generative-ai";

async function enableLogProb() {
    // [START log_prob]
    // Make sure to include these imports:
    // import {GoogleGenerativeAI} from "@google/generative-ai";
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel(
        {
            // Only 002 models + flash 1.5 8b models are enabled with log probs 
            // option.
            model: "gemini-1.5-flash-002",
            generationConfig: {
                responseLogprobs: true
            },
        },
    );
    const prompt = "Hello!";
    const result = await model.generateContent(prompt);
    console.log(result.response.candidates[0].logprobsResult);
    // [END log_prob]
}
async function runAll() {
    // Comment out or delete any sample cases you don't want to run.
    await enableLogProb();
}

runAll();
