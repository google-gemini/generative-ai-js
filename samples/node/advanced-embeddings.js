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

import { TaskType } from "@google/generative-ai";
import { genAI } from "./utils/common.js";

const model = genAI.getGenerativeModel({ model: "embedding-001" });

async function embedRetrivalQuery(queryText) {
  const result = await model.embedContent({
    content: { parts: [{ text: queryText }] },
    taskType: TaskType.RETRIEVAL_QUERY,
  });
  const embedding = result.embedding;
  return embedding.values;
}

async function embedRetrivalDocuments(docTexts) {
  const result = await model.batchEmbedContents({
    requests: docTexts.map((t) => ({
      content: { parts: [{ text: t }] },
      taskType: TaskType.RETRIEVAL_DOCUMENT,
    })),
  });
  const embeddings = result.embeddings;
  return embeddings.map((e, i) => ({ text: docTexts[i], values: e.values }));
}

// Returns Euclidean Distance between 2 vectors
function euclideanDistance(a, b) {
  let sum = 0;
  for (let n = 0; n < a.length; n++) {
    sum += Math.pow(a[n] - b[n], 2);
  }
  return Math.sqrt(sum);
}

// Performs a relevance search for queryText in relation to a known list of embeddings
async function performQuery(queryText, docs) {
  const queryValues = await embedRetrivalQuery(queryText);
  console.log(queryText);
  for (const doc of docs) {
    console.log(
      "  ",
      euclideanDistance(doc.values, queryValues),
      doc.text.substr(0, 40),
    );
  }
}

async function run() {
  // Precompute embeddings for our documents
  const docs = await embedRetrivalDocuments([
    "The quick brown fox jumps over the lazy dog.",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "Organize the world's information and make it universally accessible and useful.",
  ]);

  // Use retrieval query embeddings to find most relevant documents
  await performQuery("Google", docs);
  await performQuery("Placeholder text", docs);
  await performQuery("lorem ipsum", docs);
  await performQuery("Agile living being", docs);
}

run();
