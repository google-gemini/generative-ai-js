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
import {
  GoogleAICacheManager,
  GoogleAIFileManager,
} from "@google/generative-ai/server";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mediaPath = __dirname + "/media";

async function cacheCreate() {
  // [START cache_create]
  // Make sure to include these imports:
  // import { GoogleAICacheManager, GoogleAIFileManager } from "@google/generative-ai/server";
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  const cacheManager = new GoogleAICacheManager(process.env.API_KEY);
  const fileManager = new GoogleAIFileManager(process.env.API_KEY);

  const uploadResult = await fileManager.uploadFile(`${mediaPath}/a11.txt`, {
    mimeType: "text/plain",
  });

  const cacheResult = await cacheManager.create({
    model: "models/gemini-1.5-flash-001",
    contents: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              fileUri: uploadResult.file.uri,
              mimeType: uploadResult.file.mimeType,
            },
          },
        ],
      },
    ],
  });

  console.log(cacheResult);

  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModelFromCachedContent(cacheResult);
  const result = await model.generateContent(
    "Please summarize this transcript.",
  );
  console.log(result.response.text());
  // [END cache_create]
  await cacheManager.delete(cacheResult.name);
}

async function cacheCreateFromName() {
  // [START cache_create_from_name]
  // Make sure to include these imports:
  // import { GoogleAICacheManager, GoogleAIFileManager } from "@google/generative-ai/server";
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  const cacheManager = new GoogleAICacheManager(process.env.API_KEY);
  const fileManager = new GoogleAIFileManager(process.env.API_KEY);

  const uploadResult = await fileManager.uploadFile(`${mediaPath}/a11.txt`, {
    mimeType: "text/plain",
  });

  const cacheResult = await cacheManager.create({
    model: "models/gemini-1.5-flash-001",
    contents: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              fileUri: uploadResult.file.uri,
              mimeType: uploadResult.file.mimeType,
            },
          },
        ],
      },
    ],
  });
  const cacheName = cacheResult.name; // Save the name for later.

  // Later
  const getCacheResult = await cacheManager.get(cacheName);
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModelFromCachedContent(getCacheResult);
  model.generateContent("Please summarize this transcript.");
  // [END cache_create_from_name]
  await cacheManager.delete(cacheResult.name);
}

async function cacheCreateFromChat() {
  // [START cache_create_from_chat]
  // Make sure to include these imports:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  // import { GoogleAICacheManager, GoogleAIFileManager } from "@google/generative-ai/server";
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const cacheManager = new GoogleAICacheManager(process.env.API_KEY);
  const fileManager = new GoogleAIFileManager(process.env.API_KEY);

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
  const chat = model.startChat();

  const uploadResult = await fileManager.uploadFile(`${mediaPath}/a11.txt`, {
    mimeType: "text/plain",
  });

  let result = await chat.sendMessage([
    "Hi, could you summarize this transcript?",
    {
      fileData: {
        fileUri: uploadResult.file.uri,
        mimeType: uploadResult.file.mimeType,
      },
    },
  ]);
  console.log(`\n\nmodel: ${result.response.text()}`);
  result = await chat.sendMessage(
    "Okay, could you tell me more about the trans-lunar injection",
  );
  console.log(`\n\nmodel: ${result.response.text()}`);

  const cacheResult = await cacheManager.create({
    model: "models/gemini-1.5-flash-001",
    contents: await chat.getHistory(),
  });

  const newModel = genAI.getGenerativeModelFromCachedContent(cacheResult);

  const newChat = newModel.startChat();
  result = await newChat.sendMessage(
    "I didn't understand that last part, could you explain it in simpler language?",
  );
  console.log(`\n\nmodel: ${result.response.text()}`);
  // [END cache_create_from_chat]

  await cacheManager.delete(cacheResult.name);
}

async function cacheDelete() {
  // [START cache_delete]
  // Make sure to include these imports:
  // import { GoogleAICacheManager, GoogleAIFileManager } from "@google/generative-ai/server";
  const cacheManager = new GoogleAICacheManager(process.env.API_KEY);
  const fileManager = new GoogleAIFileManager(process.env.API_KEY);

  const uploadResult = await fileManager.uploadFile(`${mediaPath}/a11.txt`, {
    mimeType: "text/plain",
  });

  const cacheResult = await cacheManager.create({
    model: "models/gemini-1.5-flash-001",
    contents: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              fileUri: uploadResult.file.uri,
              mimeType: uploadResult.file.mimeType,
            },
          },
        ],
      },
    ],
  });
  await cacheManager.delete(cacheResult.name);
  // [END cache_delete]
}

async function cacheGet() {
  // [START cache_get]
  // Make sure to include these imports:
  // import { GoogleAICacheManager, GoogleAIFileManager } from "@google/generative-ai/server";
  const cacheManager = new GoogleAICacheManager(process.env.API_KEY);
  const fileManager = new GoogleAIFileManager(process.env.API_KEY);

  const uploadResult = await fileManager.uploadFile(`${mediaPath}/a11.txt`, {
    mimeType: "text/plain",
  });

  const cacheResult = await cacheManager.create({
    model: "models/gemini-1.5-flash-001",
    contents: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              fileUri: uploadResult.file.uri,
              mimeType: uploadResult.file.mimeType,
            },
          },
        ],
      },
    ],
  });
  const cacheGetResult = await cacheManager.get(cacheResult.name);
  console.log(cacheGetResult);
  // [END cache_get]
  await cacheManager.delete(cacheResult.name);
}

async function cacheList() {
  // [START cache_list]
  // Make sure to include these imports:
  // import { GoogleAICacheManager, GoogleAIFileManager } from "@google/generative-ai/server";
  const cacheManager = new GoogleAICacheManager(process.env.API_KEY);
  const fileManager = new GoogleAIFileManager(process.env.API_KEY);

  const uploadResult = await fileManager.uploadFile(`${mediaPath}/a11.txt`, {
    mimeType: "text/plain",
  });

  const cacheResult = await cacheManager.create({
    model: "models/gemini-1.5-flash-001",
    contents: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              fileUri: uploadResult.file.uri,
              mimeType: uploadResult.file.mimeType,
            },
          },
        ],
      },
    ],
  });
  console.log("My caches:");
  const cacheListResult = await cacheManager.list();
  for (const item of cacheListResult.cachedContents) {
    console.log(item);
  }
  // [END cache_list]
  await cacheManager.delete(cacheResult.name);
}

async function cacheUpdate() {
  // [START cache_update]
  // Make sure to include these imports:
  // import { GoogleAICacheManager, GoogleAIFileManager } from "@google/generative-ai/server";
  const cacheManager = new GoogleAICacheManager(process.env.API_KEY);
  const fileManager = new GoogleAIFileManager(process.env.API_KEY);

  const uploadResult = await fileManager.uploadFile(`${mediaPath}/a11.txt`, {
    mimeType: "text/plain",
  });

  const cacheResult = await cacheManager.create({
    model: "models/gemini-1.5-flash-001",
    contents: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              fileUri: uploadResult.file.uri,
              mimeType: uploadResult.file.mimeType,
            },
          },
        ],
      },
    ],
  });
  console.log("initial cache data:", cacheResult);
  const cacheUpdateResult = await cacheManager.update(cacheResult.name, {
    cachedContent: {
      // 2 hours
      ttlSeconds: 60 * 60 * 2,
    },
  });
  console.log("updated cache data:", cacheUpdateResult);
  // [END cache_update]
  await cacheManager.delete(cacheResult.name);
}

async function runAll() {
  // Comment out or delete any sample cases you don't want to run.
  await cacheCreate();
  await cacheCreateFromName();
  await cacheCreateFromChat();
  await cacheDelete();
  await cacheGet();
  await cacheList();
  await cacheUpdate();
}

runAll();
