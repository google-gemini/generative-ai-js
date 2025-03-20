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
 * This sample demonstrates how to use the Google AI SDK with Application Default Credentials (ADC).
 * 
 * Before running this sample:
 * 1. Install the google-auth-library: npm install google-auth-library
 * 2. Set up ADC credentials: https://cloud.google.com/docs/authentication/application-default-credentials
 *    - For local development: gcloud auth application-default login
 *    - For GKE/GCE: Use service account credentials
 * 3. Enable the Gemini API for your project
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

async function runWithAdc() {
  console.log("Initializing GoogleGenerativeAI with ADC...");
  
  const genAI = new GoogleGenerativeAI(undefined, { useAdc: true });
  
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = "Write a short poem about cloud computing.";
  console.log(`Generating content with prompt: "${prompt}"`);
  
  try {
    const result = await model.generateContent(prompt);
    console.log("Generated content:");
    console.log(result.response.text());
  } catch (error) {
    console.error("Error generating content:", error);
    
    if (error.message.includes("Failed to get ADC token")) {
      console.error("\nTIP: Make sure you have set up ADC credentials correctly:");
      console.error("  - For local development: run 'gcloud auth application-default login'");
      console.error("  - For GKE/GCE: Make sure your service account has appropriate permissions");
      console.error("  - Learn more: https://cloud.google.com/docs/authentication/application-default-credentials");
    }
  }
}

runWithAdc(); 