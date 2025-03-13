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

const { GoogleGenerativeAI } = require("@google/generative-ai");

// This sample demonstrates how to use streamCallbacks for receiving
// streaming responses without manually handling Node.js streams.

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// For text-only input, use the gemini-pro model
async function runWithCallbacks() {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  console.log("Generating response with callbacks...");
  
  await model.generateContentStream("Tell me a joke", {}, {
    onData: (chunk) => process.stdout.write(chunk),
    onDone: (fullText) => console.log("\n\nFull response:\n", fullText),
  });
}

// Alternative usage with only onDone callback
async function runWithOnlyDoneCallback() {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  console.log("\nGenerating response with only onDone callback...");
  
  await model.generateContentStream("Tell me another joke", {}, {
    onDone: (fullText) => console.log("Full response:\n", fullText),
  });
}

// Run the demos
async function main() {
  try {
    await runWithCallbacks();
    await runWithOnlyDoneCallback();
  } catch (error) {
    console.error("Error:", error);
  }
}

main(); 