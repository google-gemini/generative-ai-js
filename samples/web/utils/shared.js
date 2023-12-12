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

import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";
import { marked } from "https://esm.run/marked";

/**
 * Returns a model instance.
 *
 * @param {GoogleGenerativeAI.ModelParams} params
 * @returns {GoogleGenerativeAI.GenerativeModel}
 */
export async function getGenerativeModel(params) {
  // Fetch API key from server
  // If you need a new API key, get it from https://makersuite.google.com/app/apikey
  const API_KEY = await (await fetch("API_KEY")).text();

  const genAI = new GoogleGenerativeAI(API_KEY);

  // For text-only inputs, use the gemini-pro model
  return genAI.getGenerativeModel(params);
}

/**
 * Converts a File object to a GoogleGenerativeAI.Part object.
 *
 * @param {Blob} file
 * @returns {GoogleGenerativeAI.Part}
 */
export async function fileToGenerativePart(file) {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

/**
 * Scrolls the document all the way to the bottom.
 */
export function scrollToDocumentBottom() {
  const scrollingElement = document.scrollingElement || document.body;
  scrollingElement.scrollTop = scrollingElement.scrollHeight;
}

/**
 * Updates the `resultEl` with parsed markdown text returned by a `getResult()` call.
 *
 * @param {HTMLElement}} resultEl
 * @param {() => Promise<GoogleGenerativeAI.GenerateContentResponse>} getResult
 * @param {boolean} streaming
 */
export async function updateUI(resultEl, getResult, streaming) {
  resultEl.className = "loading";
  let text = "";
  try {
    const result = await getResult();

    if (streaming) {
      resultEl.innerText = "";
      for await (const chunk of result.stream) {
        // Get first candidate's current text chunk
        const chunkText = chunk.text();
        text += chunkText;
        resultEl.innerHTML = marked.parse(text);
        scrollToDocumentBottom();
      }
    } else {
      const response = await result.response;
      text = response.text();
    }

    resultEl.className = ""; // Remove .loading class
  } catch (err) {
    text += "\n\n> " + err;
    resultEl.className = "error";
  }
  resultEl.innerHTML = marked.parse(text);
  scrollToDocumentBottom();
}
