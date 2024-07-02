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

import { GoogleGenerativeAI } from "@google/generative-ai";

async function textGenTextOnlyPrompt() {
  // [START text_gen_text_only_prompt]
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = "Write a story about a magic backpack.";

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  console.log(text);
  // [END text_gen_text_only_prompt]
}

async function textGenTextOnlyPromptStreaming() {
  // [START text_gen_text_only_prompt_streaming]
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = "Write a story about a magic backpack.";

  const result = await model.generateContentStream(prompt);

  // print text as it comes in
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    console.log(chunkText);
  }
  // [END text_gen_text_only_prompt_streaming]
}

async function textGenMultimodalOneImagePrompt() {
  // [START text_gen_multimodal_one_image_prompt]
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

  const prompt = "Describe how this product might be manufactured";
  // Note: The only accepted mime types are some image types, image/*.
  const imagePart = fileToGenerativePart("./utils/jetpack.jpg", "image/jpeg");

  const result = await model.generateContent([prompt, imagePart]);
  const response = result.response;
  const text = response.text();
  console.log(text);
  // [END text_gen_multimodal_one_image_prompt]
}

async function textGenMultimodalOneImagePromptStreaming() {
  // [START text_gen_multimodal_one_image_prompt_streaming]
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

  const prompt = "Describe how this product might be manufactured";
  // Note: The only accepted mime types are some image types, image/*.
  const imagePart = fileToGenerativePart("./utils/jetpack.jpg", "image/jpeg");

  const result = await model.generateContentStream([prompt, imagePart]);

  // print text as it comes in
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    console.log(chunkText);
  }
  // [END text_gen_multimodal_one_image_prompt_streaming]
}

async function textGenMultimodalMultiImagePrompt() {
  // [START text_gen_multimodal_multi_image_prompt]
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
    fileToGenerativePart("./utils/jetpack.jpg", "image/jpeg"),
    fileToGenerativePart("./utils/piranha.jpg", "image/jpeg"),
    fileToGenerativePart("./utils/firefighter.jpg", "image/jpeg"),
  ];

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = result.response;
  const text = response.text();
  console.log(text);
  // [END text_gen_multimodal_multi_image_prompt]
}

async function textGenMultimodalMultiImagePromptStreaming() {
  // [START text_gen_multimodal_multi_image_prompt_streaming]
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
    fileToGenerativePart("./utils/jetpack.jpg", "image/jpeg"),
    fileToGenerativePart("./utils/piranha.jpg", "image/jpeg"),
    fileToGenerativePart("./utils/firefighter.jpg", "image/jpeg"),
  ];

  const result = await model.generateContentStream([prompt, ...imageParts]);

  // print text as it comes in
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    console.log(chunkText);
  }
  // [END text_gen_multimodal_multi_image_prompt_streaming]
}

async function textGenMultimodalAudio() {
  // [START text_gen_multimodal_audio]
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
  const audioPart = fileToGenerativePart("./utils/sample.mp3", "audio/mp3");

  const result = await model.generateContent([prompt, audioPart]);
  const response = result.response;
  const text = response.text();
  console.log(text);
  // [END text_gen_multimodal_audio]
}

async function textGenMultimodalVideoPrompt() {
  // [START text_gen_multimodal_video_prompt]
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

  const prompt = "Describe this video clip";
  // Note: The only accepted mime types are some image types, image/*.
  const audioPart = fileToGenerativePart("./utils/Big_Buck_Bunny.mp4", "video/mp4");

  const result = await model.generateContent([prompt, audioPart]);
  const response = result.response;
  const text = response.text();
  console.log(text);
  // [END text_gen_multimodal_video_prompt]
}

async function textGenMultimodalVideoPromptStreaming() {
  // [START text_gen_multimodal_video_prompt_streaming]
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

  const prompt = "Describe this video clip";
  // Note: The only accepted mime types are some image types, image/*.
  const audioPart = fileToGenerativePart("./utils/Big_Buck_Bunny.mp4", "video/mp4");

  const result = await model.generateContent([prompt, audioPart]);
  const response = result.response;
  const text = response.text();
  console.log(text);
  // [END text_gen_multimodal_video_prompt_streaming]
}

async function runAll() {
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