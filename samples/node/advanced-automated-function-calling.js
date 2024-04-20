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

import { FunctionDeclarationSchemaType } from "@google/generative-ai";
import {
  genAI,
  displayChatTokenCount,
  streamToStdout,
} from "./utils/common.js";

async function run() {
  const functions = {
    convertCtoF: ({ value }) => {
      const num = typeof value === "string" ? parseFloat(value) : value;
      if (!Number.isFinite(num)) {
        throw new Error("Value should finite number");
      }
      return (num * 9) / 5 + 32;
    },
    convertFtoC: ({ value }) => {
      const num = typeof value === "string" ? parseFloat(value) : value;
      if (!Number.isFinite(num)) {
        throw new Error("Value should finite number");
      }
      return (num - 32) * 5 / 9;
    },
  };
  
  const tools = [
    {
      functionDeclarations: [
        {
          name: "convertCtoF",
          description: "Convert temperature from Celsius to Fahrenheit",
          parameters: {
            type: FunctionDeclarationSchemaType.OBJECT,
            properties: {
              value: { type: FunctionDeclarationSchemaType.NUMBER },
            },
            required: ["value"],
          },
        },
        {
          name: "convertFtoC",
          description: "Convert temperature from Fahrenheit to Celsius",
          parameters: {
            type: FunctionDeclarationSchemaType.OBJECT,
            properties: {
              value: { type: FunctionDeclarationSchemaType.NUMBER },
            },
            required: ["value"],
          },
        },
      ],
    },
  ];

  // For text-only inputs, use the gemini-pro model
  const model = genAI.getGenerativeModel(
    { model: "gemini-pro", tools },
    { apiVersion: "v1beta" },
  );

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{text: "Hello!."}],
      },
      {
        role: "model",
        parts: [{text: "Great to meet you. What would you like to know?"}],
      },
    ],
    generationConfig: {
      maxOutputTokens: 100,
    },
  });

  const msg1 = "First, Convert 15 Celsius to Fahrenheit. Then convert 32 Fahrenheit to Celsius";
  displayChatTokenCount(model, chat, msg1);
  const result = await chat.sendMessageStream(msg1);
  await streamToStdout(result.stream);

  // Display history
  console.log(JSON.stringify(await chat.getHistory(), null, 2));

  // Display the last aggregated response
  const response = await result.response;
  //console.log(JSON.stringify(response, null, 2));
  //console.dir(response, { depth: null });

  if (response.candidates.length === 0) {
    throw new Error("No candidates");
  }

  const content = response.candidates[0].content;
  if (content.parts.length === 0) {
    throw new Error("No parts");
  }

  const fc = content.parts[0].functionCall;
  const text = content.parts.map(({ text }) => text).join("");

  console.dir(fc, { depth: null });
  console.dir(text, { depth: null });

  if (fc) {
    const { name, args } = fc;
    const fn = functions[name];
    if (!fn) {
      throw new Error(`Unknown function "${name}"`);
    }
    const fr = {
      functionResponse: {
        name,
        response: {
          name,
          content: functions[name](args),
        },
      },
    };

    const result2 = await chat.sendMessageStream([fr]);
    const response2 = await result2.response;
    console.log(response2.text());
  } else if (text) {
    console.log(text);
  }
}

run();
