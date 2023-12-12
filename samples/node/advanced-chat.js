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

import {
  genAI,
  displayChatTokenCount,
  streamToStdout,
} from "./utils/common.js";

async function run() {
  // For dialog language tasks (like chat), use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: "Hello, I have 2 dogs in my house.",
      },
      {
        role: "model",
        parts: "Great to meet you. What would you like to know?",
      },
    ],
    generationConfig: {
      maxOutputTokens: 100,
    },
  });

  const msg1 = "How many paws are in my house?";
  displayChatTokenCount(model, chat, msg1);
  const result1 = await chat.sendMessageStream(msg1);
  await streamToStdout(result1.stream);

  const msg2 = "How many noses (including mine)?";
  displayChatTokenCount(model, chat, msg2);
  const result2 = await chat.sendMessageStream(msg2);
  await streamToStdout(result2.stream);

  // Display history
  console.log(JSON.stringify(await chat.getHistory(), null, 2));

  // Display the last aggregated response
  const response = await result2.response;
  console.log(JSON.stringify(response, null, 2));
}

run();
