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

async function embedContentWithDimensions() {
 
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });

 
  const result = await model.embedContent({
    content: { role: "user", parts: [{ text: "Hello world!" }] },
    dimensions: 128
  });

  console.log("Embedding size:", result.embedding.values.length);
  console.log("First 5 dimensions:", result.embedding.values.slice(0, 5));
}

async function compareEmbeddingSizes() {
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });

  const text = "The quick brown fox jumps over the lazy dog";
  
  
  const dimensions = [128, 256, 384, 512, 768];
  
  console.log(`Comparing embedding sizes for text: "${text}"`);
  
  for (const dim of dimensions) {
    const result = await model.embedContent({
      content: { role: "user", parts: [{ text }] },
      dimensions: dim
    });
    
    console.log(`Dimensions: ${dim}, Actual size: ${result.embedding.values.length}`);
  }
}

async function batchEmbedContentsWithDimensions() {
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });

  function textToRequest(text, dimensions) {
    return { 
      content: { role: "user", parts: [{ text }] },
      dimensions
    };
  }

  const result = await model.batchEmbedContents({
    requests: [
      textToRequest("What is the meaning of life?", 128),
      textToRequest("How much wood would a woodchuck chuck?", 256),
      textToRequest("How does the brain work?", 384),
    ],
  });

  for (let i = 0; i < result.embeddings.length; i++) {
    console.log(`Embedding ${i+1} size: ${result.embeddings[i].values.length}`);
  }
}

async function runAll() {
  try {
    console.log("=== Embedding with dimensions ===");
    await embedContentWithDimensions();
    
    console.log("\n=== Comparing embedding sizes ===");
    await compareEmbeddingSizes();
    
    console.log("\n=== Batch embeddings with dimensions ===");
    await batchEmbedContentsWithDimensions();
  } catch (error) {
    console.error("Error:", error);
  }
}

runAll(); 