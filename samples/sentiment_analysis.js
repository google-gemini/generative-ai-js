/**
 * @license
 * Copyright 2025 Google LLC
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
    GoogleGenerativeAI 
} from "@google/generative-ai";

async function runSentimentAnalysis(text) {
    // [START runSentimentAnalysis]
    // Make sure to include these imports:
    // import { GoogleGenerativeAI } from "@google/generative-ai";
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" },  {apiVersion: "v1alpha"},);

  try {
    // Define the prompt for sentiment analysis
    const prompt = `Analyze the sentiment of the following text and classify it as "positive", "negative", or "neutral". Provide a brief explanation.

Text: "${text}"`;

    // Generate content using the model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const sentimentAnalysis = await response.text();

    // Output the result
    console.log("Sentiment Analysis Result:");
    console.log(sentimentAnalysis);
  } catch (error) {
    console.error("Error performing sentiment analysis:", error);
  }
  // [runSentimentAnalysis]
}

// Example usage
const sampleText = "I absolutely love this product! It's amazing and works perfectly.";
runSentimentAnalysis(sampleText);