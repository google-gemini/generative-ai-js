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
  GoogleAIFileManager,
  FileState,
  GoogleAICacheManager,
} from "@google/generative-ai/server";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mediaPath = __dirname + "/media";

async function tokensTextOnly() {
  // [START tokens_text_only]
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  // Count tokens in a prompt without calling text generation.
  const countResult = await model.countTokens(
    "The quick brown fox jumps over the lazy dog.",
  );

  console.log(countResult.totalTokens); // 11
  console.log(countResult.contentTokens[0]);
  // { partTokens: [ 10 ], roleTokens: 1 }
  

  // Retrieve token count data (including a count of tokens in response) after
  // text generation.
  const generateResult = await model.generateContent(
    "The quick brown fox jumps over the lazy dog.",
  );
  console.log(generateResult.response.usageMetadata);
  // { promptTokenCount: 11, candidatesTokenCount: 131, totalTokenCount: 142 }
  // [END tokens_text_only]
}

async function tokensChat() {
  // [START tokens_chat]
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  const chat = model.startChat();
  const result = await chat.sendMessage("Hi, my name is Bob.");
  console.log(result.response.usageMetadata);
  // { promptTokenCount: 8, candidatesTokenCount: 20, totalTokenCount: 28 }
  // [END tokens_chat]
}

async function tokensMultimodalImageInline() {
  // [START tokens_multimodal_image_inline]
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  function fileToGenerativePart(path, mimeType) {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(path)).toString("base64"),
        mimeType,
      },
    };
  }

  const imagePart = fileToGenerativePart(
    `${mediaPath}/jetpack.jpg`,
    "image/jpeg",
  );

  const result = await model.countTokens([
    "Tell me about this image.",
    imagePart,
  ]);
  console.log(result.totalTokens);
  // [END tokens_multimodal_image_inline]
}

async function tokensMultimodalImageFileApi() {
  // [START tokens_multimodal_image_file_api]
  const fileManager = new GoogleAIFileManager(process.env.API_KEY);

  const uploadResult = await fileManager.uploadFile(
    `${mediaPath}/jetpack.jpg`,
    { mimeType: "image/jpeg" },
  );

  const imagePart = {
    fileData: {
      fileUri: uploadResult.file.uri,
      mimeType: uploadResult.file.mimeType,
    },
  };

  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const result = await model.countTokens([
    "Tell me about this image.",
    imagePart,
  ]);

  console.log(result.totalTokens);
  // [END tokens_multimodal_image_file_api]
}

async function tokensMultimodalVideoAudioFileApi() {
  // [START tokens_multimodal_video_audio_file_api]
  const fileManager = new GoogleAIFileManager(process.env.API_KEY);

  function waitForProcessing(fileName) {
    return new Promise(async (resolve, reject) => {
      let file = await fileManager.getFile(fileName);
      while (file.state === FileState.PROCESSING) {
        process.stdout.write(".");
        // Sleep for 10 seconds
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        // Fetch the file from the API again
        file = await fileManager.getFile(fileName);
      }

      if (file.state === FileState.FAILED) {
        reject(new Error("Video processing failed."));
      }
      resolve();
    });
  }

  const uploadAudioResult = await fileManager.uploadFile(
    `${mediaPath}/samplesmall.mp3`,
    { mimeType: "audio/mp3" },
  );

  const uploadVideoResult = await fileManager.uploadFile(
    `${mediaPath}/Big_Buck_Bunny.mp4`,
    { mimeType: "video/mp4" },
  );

  await Promise.all([
    waitForProcessing(uploadAudioResult.file.name),
    waitForProcessing(uploadVideoResult.file.name),
  ]);

  const audioPart = {
    fileData: {
      fileUri: uploadAudioResult.file.uri,
      mimeType: uploadAudioResult.file.mimeType,
    },
  };

  const videoPart = {
    fileData: {
      fileUri: uploadVideoResult.file.uri,
      mimeType: uploadVideoResult.file.mimeType,
    },
  };

  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const result = await model.countTokens([
    "Tell me about this audio and video.",
    audioPart,
    videoPart,
  ]);

  console.log(result.totalTokens);
  // [END tokens_multimodal_video_audio_file_api]
}

async function tokensCachedContent() {
  // [START tokens_cached_content]
  // Generate a very long string
  let longContentString = "";
  for (let i = 0; i < 32001; i++) {
    longContentString += "Purple cats drink lemonade.";
    longContentString += i % 8 === 7 ? "\n" : " ";
  }

  const cacheManager = new GoogleAICacheManager(process.env.API_KEY);
  const cacheResult = await cacheManager.create({
    ttlSeconds: 600,
    model: "models/gemini-1.5-pro-001",
    contents: [
      {
        role: "user",
        parts: [{ text: longContentString }],
      },
    ],
  });

  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({
    model: "models/gemini-1.5-pro-001",
  });

  const result = await model.countTokens({
    generateContentRequest: {
      contents: [
        { role: "user", parts: [{ text: "What do purple cats drink?" }] },
      ],
      cachedContent: cacheResult.name,
    },
  });

  console.log(result.totalTokens);
  await cacheManager.delete(cacheResult.name);
  // [END tokens_cached_content]
}

async function tokensSystemInstruction() {
  // [START tokens_system_instruction]
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({
    model: "models/gemini-1.5-flash",
  });

  const result = await model.countTokens({
    generateContentRequest: {
      contents: [
        {
          role: "user",
          parts: [{ text: "The quick brown fox jumps over the lazy dog." }],
        },
      ],
      systemInstruction: {
        role: "system",
        parts: [{ text: "Talk like a pirate!" }],
      },
    },
  });

  console.log(result);
  // {
  //   totalTokens: 17,
  //   systemInstructionsTokens: { partTokens: [ 5 ], roleTokens: 1 },
  //   contentTokens: [ { partTokens: [Array], roleTokens: 1 } ]
  // }
  // [END tokens_system_instruction]
}

async function tokensTools() {
  // [START tokens_tools]
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({
    model: "models/gemini-1.5-flash",
  });

  const functionDeclarations = [
    { name: "add" },
    { name: "subtract" },
    { name: "multiply" },
    { name: "divide" },
  ];

  const result = await model.countTokens({
    generateContentRequest: {
      contents: [
        {
          role: "user",
          parts: [{ text: "The quick brown fox jumps over the lazy dog." }],
        },
      ],
      tools: [{ functionDeclarations }],
    },
  });

  console.log(result);
  // {
  //   totalTokens: 87,
  //   systemInstructionsTokens: {},
  //   contentTokens: [ { partTokens: [Array], roleTokens: 1 } ],
  //   toolTokens: [ { functionDeclarationTokens: [Array] } ]
  // }
  // [END tokens_tools]
}

async function run() {
  // Comment out or delete any sample cases you don't want to run.
  await tokensTextOnly();
  await tokensChat();
  await tokensMultimodalImageInline();
  await tokensMultimodalImageFileApi();
  await tokensMultimodalVideoAudioFileApi();
  await tokensCachedContent();
  await tokensSystemInstruction();
  await tokensTools();
}

run();
