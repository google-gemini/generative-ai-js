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
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mediaPath = __dirname + "/media";

async function textGenTextOnlyPrompt() {
  // [START text_gen_text_only_prompt]
  // Make sure to include these imports:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = "Write a story about a magic backpack.";

  const result = await model.generateContent(prompt);
  console.log(result.response.text());
  // [END text_gen_text_only_prompt]
}

async function textGenTextOnlyPromptStreaming() {
  // [START text_gen_text_only_prompt_streaming]
  // Make sure to include these imports:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = "Write a story about a magic backpack.";

  const result = await model.generateContentStream(prompt);

  // Print text as it comes in.
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    process.stdout.write(chunkText);
  }
  // [END text_gen_text_only_prompt_streaming]
}

async function textGenMultimodalOneImagePrompt() {
  // [START text_gen_multimodal_one_image_prompt]
  // Make sure to include these imports:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  function fileToGenerativePart(path, mimeType) {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(path)).toString("base64"),
        mimeType,
      },
    };
  }

  const prompt = "Describe how this product might be manufactured.";
  // Note: The only accepted mime types are some image types, image/*.
  const imagePart = fileToGenerativePart(
    `${mediaPath}/jetpack.jpg`,
    "image/jpeg",
  );

  const result = await model.generateContent([prompt, imagePart]);
  console.log(result.response.text());
  // [END text_gen_multimodal_one_image_prompt]
}

async function textGenMultimodalOneImagePromptStreaming() {
  // [START text_gen_multimodal_one_image_prompt_streaming]
  // Make sure to include these imports:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  function fileToGenerativePart(path, mimeType) {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(path)).toString("base64"),
        mimeType,
      },
    };
  }

  const prompt = "Describe how this product might be manufactured.";
  // Note: The only accepted mime types are some image types, image/*.
  const imagePart = fileToGenerativePart(
    `${mediaPath}/jetpack.jpg`,
    "image/jpeg",
  );

  const result = await model.generateContentStream([prompt, imagePart]);

  // Print text as it comes in.
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    process.stdout.write(chunkText);
  }
  // [END text_gen_multimodal_one_image_prompt_streaming]
}

async function textGenMultimodalMultiImagePrompt() {
  // [START text_gen_multimodal_multi_image_prompt]
  // Make sure to include these imports:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  function fileToGenerativePart(path, mimeType) {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(path)).toString("base64"),
        mimeType,
      },
    };
  }

  const prompt =
    "Write an advertising jingle showing how the product in the" +
    " first image could solve the problems shown in the second two images.";

  // Note: The only accepted mime types are some image types, image/*.
  const imageParts = [
    fileToGenerativePart(`${mediaPath}/jetpack.jpg`, "image/jpeg"),
    fileToGenerativePart(`${mediaPath}/piranha.jpg`, "image/jpeg"),
    fileToGenerativePart(`${mediaPath}/firefighter.jpg`, "image/jpeg"),
  ];

  const result = await model.generateContent([prompt, ...imageParts]);
  console.log(result.response.text());
  // [END text_gen_multimodal_multi_image_prompt]
}

async function textGenMultimodalMultiImagePromptStreaming() {
  // [START text_gen_multimodal_multi_image_prompt_streaming]
  // Make sure to include these imports:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  function fileToGenerativePart(path, mimeType) {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(path)).toString("base64"),
        mimeType,
      },
    };
  }

  const prompt =
    "Write an advertising jingle showing how the product in the" +
    " first image could solve the problems shown in the second two images.";

  // Note: The only accepted mime types are some image types, image/*.
  const imageParts = [
    fileToGenerativePart(`${mediaPath}/jetpack.jpg`, "image/jpeg"),
    fileToGenerativePart(`${mediaPath}/piranha.jpg`, "image/jpeg"),
    fileToGenerativePart(`${mediaPath}/firefighter.jpg`, "image/jpeg"),
  ];

  const result = await model.generateContentStream([prompt, ...imageParts]);

  // Print text as it comes in.
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    process.stdout.write(chunkText);
  }
  // [END text_gen_multimodal_multi_image_prompt_streaming]
}

async function textGenMultimodalAudio() {
  // [START text_gen_multimodal_audio]
  // Make sure to include these imports:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  function fileToGenerativePart(path, mimeType) {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(path)).toString("base64"),
        mimeType,
      },
    };
  }

  const prompt = "Give me a summary of this audio file.";
  // Note: The only accepted mime types are some image types, image/*.
  const audioPart = fileToGenerativePart(
    `${mediaPath}/samplesmall.mp3`,
    "audio/mp3",
  );

  const result = await model.generateContent([prompt, audioPart]);
  console.log(result.response.text());
  // [END text_gen_multimodal_audio]
}

async function textGenMultimodalVideoPrompt() {
  // [START text_gen_multimodal_video_prompt]
  // Make sure to include these imports:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  // import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const fileManager = new GoogleAIFileManager(process.env.API_KEY);

  const uploadResult = await fileManager.uploadFile(
    `${mediaPath}/Big_Buck_Bunny.mp4`,
    { mimeType: "video/mp4" },
  );

  let file = await fileManager.getFile(uploadResult.file.name);
  while (file.state === FileState.PROCESSING) {
    process.stdout.write(".");
    // Sleep for 10 seconds
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    // Fetch the file from the API again
    file = await fileManager.getFile(uploadResult.file.name);
  }

  if (file.state === FileState.FAILED) {
    throw new Error("Video processing failed.");
  }

  const prompt = "Describe this video clip";
  const videoPart = {
    fileData: {
      fileUri: uploadResult.file.uri,
      mimeType: uploadResult.file.mimeType,
    },
  };

  const result = await model.generateContent([prompt, videoPart]);
  console.log(result.response.text());
  // [END text_gen_multimodal_video_prompt]
  await fileManager.deleteFile(uploadResult.file.name);
}

async function textGenMultimodalVideoPromptStreaming() {
  // [START text_gen_multimodal_video_prompt_streaming]
  // Make sure to include these imports:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  // import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const fileManager = new GoogleAIFileManager(process.env.API_KEY);

  const uploadResult = await fileManager.uploadFile(
    `${mediaPath}/Big_Buck_Bunny.mp4`,
    { mimeType: "video/mp4" },
  );

  let file = await fileManager.getFile(uploadResult.file.name);
  while (file.state === FileState.PROCESSING) {
    process.stdout.write(".");
    // Sleep for 10 seconds
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    // Fetch the file from the API again
    file = await fileManager.getFile(uploadResult.file.name);
  }

  if (file.state === FileState.FAILED) {
    throw new Error("Video processing failed.");
  }

  const prompt = "Describe this video clip";
  const videoPart = {
    fileData: {
      fileUri: uploadResult.file.uri,
      mimeType: uploadResult.file.mimeType,
    },
  };

  const result = await model.generateContentStream([prompt, videoPart]);
  // Print text as it comes in.
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    process.stdout.write(chunkText);
  }
  // [END text_gen_multimodal_video_prompt_streaming]
  await fileManager.deleteFile(uploadResult.file.name);
}

async function runAll() {
  // Comment out or delete any sample cases you don't want to run.
  await textGenTextOnlyPrompt();
  await textGenTextOnlyPromptStreaming();
  await textGenMultimodalOneImagePrompt();
  await textGenMultimodalOneImagePromptStreaming();
  await textGenMultimodalMultiImagePrompt();
  await textGenMultimodalMultiImagePromptStreaming();
  await textGenMultimodalAudio();
  await textGenMultimodalVideoPrompt();
  await textGenMultimodalVideoPromptStreaming();
}

runAll();
