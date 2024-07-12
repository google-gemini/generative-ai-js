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

import {
  FunctionDeclarationSchemaType,
  GoogleGenerativeAI,
} from "@google/generative-ai";

async function jsonControlledGeneration() {
  // [START json_controlled_generation]
  // Make sure to include these imports:
  // import { GoogleGenerativeAI, FunctionDeclarationSchemaType } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);

  const schema = {
    description: "List of recipes",
    type: FunctionDeclarationSchemaType.ARRAY,
    items: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        recipeName: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "Name of the recipe",
          nullable: false,
        },
      },
      required: ["recipeName"],
    },
  };

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const result = await model.generateContent(
    "List a few popular cookie recipes.",
  );
  console.log(result.response.text());
  // [END json_controlled_generation]
}

async function jsonNoSchema() {
  // [START json_no_schema]
  // Make sure to include these imports:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const prompt = `List a few popular cookie recipes using this JSON schema:

  Recipe = {'recipeName': string}
  Return: Array<Recipe>`;

  const result = await model.generateContent(prompt);
  console.log(result.response.text());
  // [END json_no_schema]
}

async function runAll() {
  // Comment out or delete any sample cases you don't want to run.
  await jsonControlledGeneration();
  await jsonNoSchema();
}

runAll();
