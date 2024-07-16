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

async function codeExecutionBasic() {
  // [START code_execution_basic]
  // Make sure to include these imports:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    tools: [{ codeExecution: {} }],
  });

  const result = await model.generateContent(
    "What is the sum of the first 50 prime numbers? " +
      "Generate and run code for the calculation, and make sure you get " +
      "all 50.",
  );

  console.log(result.response.text());
  // [END code_execution_basic]
}

async function codeExecutionRequestOverride() {
  // [START code_execution_request_override]
  // Make sure to include these imports:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              "What is the sum of the first 50 prime numbers? " +
              "Generate and run code for the calculation, and make sure you " +
              "get all 50.",
          },
        ],
      },
    ],
    tools: [{ codeExecution: {} }],
  });

  console.log(result.response.text());
  // [END code_execution_request_override]
}

async function codeExecutionChat() {
  // [START code_execution_chat]
  // Make sure to include these imports:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    tools: [{ codeExecution: {} }],
  });
  const chat = model.startChat();

  const result = await chat.sendMessage(
    "What is the sum of the first 50 prime numbers? " +
      "Generate and run code for the calculation, and make sure you get " +
      "all 50.",
  );

  console.log(result.response.text());
  // [END code_execution_chat]
}

async function runAll() {
  // Comment out or delete any sample cases you don't want to run.
  await codeExecutionBasic();
  await codeExecutionRequestOverride();
  await codeExecutionChat();
}

runAll();
