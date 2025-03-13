// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function expected(): Promise<void> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI);
    const MODEL = "gemini-2.0-flash-001";
    const { response: output } = await genAI.getGenerativeModel({
        model: MODEL,
        systemInstruction: "you are a helpful assistant.",
        generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0,
        }
    }).generateContent("what is the capital of france?");
    console.log(output.candidates[0].content.parts[0].text); // Expected: "The capital of France is Paris."
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function actual(): Promise<void> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI);
    const MODEL = "gemini-2.0-flash-001";
    const { response: output } = await genAI.getGenerativeModel({
        model: MODEL,
        systemInstruction: "you are a helpful assistant.",
        generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0,
        }
    }).generateContent("what is the capital of france?");

    // Robust check for valid response
    if (output?.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.log(output.candidates[0].content.parts[0].text); // Log the answer if valid
    } else {
        console.error("Unexpected empty response", JSON.stringify(output, null, 2)); // Log error if response is empty or malformed
    }
}

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

import { GoogleGenerativeAI } from "@google/generative-ai"; // Added import
import {
  GenerateContentRequest,
  GenerateContentResponse,
  GenerateContentResult,
  GenerateContentStreamResult,
  SingleRequestOptions,
} from "../../types";
import { Task, makeModelRequest } from "../requests/request";
import { addHelpers } from "../requests/response-helpers";
import { processStream } from "../requests/stream-reader";

// Generate Content Stream
export async function generateContentStream(
  apiKey: string,
  model: string,
  params: GenerateContentRequest,
  requestOptions: SingleRequestOptions,
): Promise<GenerateContentStreamResult> {
  const response = await makeModelRequest(
    model,
    Task.STREAM_GENERATE_CONTENT,
    apiKey,
    /* stream */ true,
    JSON.stringify(params),
    requestOptions,
  );
  return processStream(response);
}

// Generate Content
export async function generateContent(
  apiKey: string,
  model: string,
  params: GenerateContentRequest,
  requestOptions?: SingleRequestOptions,
): Promise<GenerateContentResult> {
  const response = await makeModelRequest(
    model,
    Task.GENERATE_CONTENT,
    apiKey,
    /* stream */ false,
    JSON.stringify(params),
    requestOptions,
  );
  const responseJson: GenerateContentResponse = await response.json();
  const enhancedResponse = addHelpers(responseJson);
  return {
    response: enhancedResponse,
  };
}

// Main Function to Resolve the Bug
async function getCapitalOfFranceWithRetry(retries = 3): Promise<void> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI);
  const MODEL = "gemini-2.0-flash-001";

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { response: output } = await genAI.getGenerativeModel({
        model: MODEL,
        systemInstruction: "you are a helpful assistant.",
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0,
        },
      }).generateContent("what is the capital of france?");

      // Robust check for valid response
      const answer = output?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (answer) {
        console.log(answer); // Expected: "The capital of France is Paris."
        return; // Exit on success
      } else {
        console.warn(`Attempt ${attempt} failed: Empty or malformed response`);
      }
    } catch (error) {
      console.error(`Attempt ${attempt} failed with error:`, error);
    }
  }

  console.error("All attempts failed. Could not retrieve a valid response.");
}

// Run the function and handle the promise
getCapitalOfFranceWithRetry().catch((error) => {
  console.error("An error occurred:", error);
});