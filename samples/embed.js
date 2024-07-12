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

async function embedContent() {
  // [START embed_content]
  // Make sure to include these imports:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });

  const result = await model.embedContent("Hello world!");

  console.log(result.embedding);
  // [END embed_content]
}

async function batchEmbedContents() {
  // [START batch_embed_contents]
  // Make sure to include these imports:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });

  function textToRequest(text) {
    return { content: { role: "user", parts: [{ text }] } };
  }

  const result = await model.batchEmbedContents({
    requests: [
      textToRequest("What is the meaning of life?"),
      textToRequest("How much wood would a woodchuck chuck?"),
      textToRequest("How does the brain work?"),
    ],
  });

  console.log(result.embeddings);
  // [END batch_embed_contents]
}

async function runAll() {
  // Comment out or delete any sample cases you don't want to run.
  await embedContent();
  await batchEmbedContents();
}

runAll();
