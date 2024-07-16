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

async function functionCalling() {
  // [START function_calling]
  // Make sure to include these imports:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  async function setLightValues(brightness, colorTemperature) {
    // This mock API returns the requested lighting values
    return {
      brightness,
      colorTemperature,
    };
  }

  const controlLightFunctionDeclaration = {
    name: "controlLight",
    parameters: {
      type: "OBJECT",
      description: "Set the brightness and color temperature of a room light.",
      properties: {
        brightness: {
          type: "NUMBER",
          description:
            "Light level from 0 to 100. Zero is off and 100 is full brightness.",
        },
        colorTemperature: {
          type: "STRING",
          description:
            "Color temperature of the light fixture which can be `daylight`, `cool` or `warm`.",
        },
      },
      required: ["brightness", "colorTemperature"],
    },
  };

  // Executable function code. Put it in a map keyed by the function name
  // so that you can call it once you get the name string from the model.
  const functions = {
    controlLight: ({ brightness, colorTemperature }) => {
      return setLightValues(brightness, colorTemperature);
    },
  };

  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    tools: { functionDeclarations: [controlLightFunctionDeclaration] },
  });
  const chat = model.startChat();
  const prompt = "Dim the lights so the room feels cozy and warm.";

  // Send the message to the model.
  const result = await chat.sendMessage(prompt);

  // For simplicity, this uses the first function call found.
  const call = result.response.functionCalls()[0];

  if (call) {
    // Call the executable function named in the function call
    // with the arguments specified in the function call and
    // let it call the hypothetical API.
    const apiResponse = await functions[call.name](call.args);

    // Send the API response back to the model so it can generate
    // a text response that can be displayed to the user.
    const result2 = await chat.sendMessage([
      {
        functionResponse: {
          name: "controlLight",
          response: apiResponse,
        },
      },
    ]);

    // Log the text response.
    console.log(result2.response.text());
  }
  // [END function_calling]
}

functionCalling();
