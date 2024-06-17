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
import { GoogleAICacheManager, GoogleAIFileManager } from "@google/generative-ai/server";

async function uploadFile() {
  // Construct a FileManager to upload a file which can be used
  // in a Cached Context.
  const fileManager = new GoogleAIFileManager(process.env.API_KEY);
 
  // OMIT: Remove the file, in case we execute this more than once.
  try {
    fileManager.deleteFile("files/browncat");
  } catch (error) {}

  // Upload a picture of a brown cat.
  const fileResult = await fileManager.uploadFile("./utils/cat.jpg", {
    mimeType: "image/jpeg",
    name: "files/browncat",
    displayName: "brownCat",
  });

  return fileResult;
}

// Get your API key from https://aistudio.google.com/app/apikey
// Access your API key as an environment variable.
const genAI = new GoogleGenerativeAI(
  process.env.API_KEY
);

// Construct a GoogleAICacheManager using your API key.
const cacheManager = new GoogleAICacheManager(
  process.env.API_KEY
);

// Create our own text to cache.
let text = "";
for (let i = 0; i < 6554; i++) {
  text += "Purple cats drink chicken soup.";
  text += i % 8 === 7 ? "\n" : " ";
}

const fileResult = await uploadFile();

// Create a cache which lasts 20 seconds.
const displayName = "Example cat cache";
const model = "models/gemini-1.5-flash-001";
let ttlSeconds = 20;
const createCacheResult = await cacheManager.create({
  ttlSeconds,
  model,
  displayName,
  contents: [
    {
      role: "user",
      parts: [
        { text },
        {
          fileData: {
            mimeType: fileResult.file.mimeType,
            fileUri: fileResult.file.uri,
          },
        },
      ],
    },
  ],
});

const cacheServiceName = createCacheResult.name;
const expireTime = createCacheResult.expireTime;
const totalTokenCount = createCacheResult.usageMetadata.totalTokenCount;
// Output should be simliar to:
// `created cache:  cachedContents/cgc35ajq07jc  expires: 2024-06-17T23:23:08.169689178Z  total tokens:  40403`
console.log(
  "created cache: ",
  cacheServiceName,
  " expires: ",
  expireTime,
  " total tokens: ",
  totalTokenCount,
);

// List the caches.
const listResult = await cacheManager.list();

// Example to search to see the create cache exists.
listResult.cachedContents.forEach((cacheElement) => {
  // search by display name defined at construction.
  if (cacheElement.displayName === displayName) {
    // Located cache in the list result via display name.
  }
  // or, alternatively, by the cache name assigned by the service.
  if (cacheElement.name === cacheServiceName) {
    // Located cache in the list result via name.
  }
});

// Update the expiration time to 50 seconds from now.
const newExpireTime = new Date(new Date().getTime() + 50 * 1000);
const updateExpirationParams = {
  cachedContent: { expireTime: newExpireTime.toISOString() },
};
const updateExpirteTimeResult = await cacheManager.update(
  cacheServiceName,
  updateExpirationParams,
);
// Output should look similar to: `New expiration time:  2024-06-17T23:23:38.686Z`
console.log("New expiration time: ", updateExpirteTimeResult.expireTime);

// Or, alternatively, extend the time to live (TTL) by 30 seconds from the
// original 20 seconds.
ttlSeconds += 30;
const updateParams = { cachedContent: { ttlSeconds } };
const updateTtlResult = await cacheManager.update(
  cacheServiceName,
  updateParams,
);
// Output should look similar to: `New expiration time:  2024-06-17T23:23:38.686Z`
console.log("New expiration time: ", updateTtlResult.expireTime);

// Query a cache object by the service name. This will return an object
// similar to the one that was returned from call to create(), or
// the objects in the array returned by list().
const queriedCache = await cacheManager.get(cacheServiceName);

// Construct a `GenerativeModel` which uses the cache object.
const genModel = genAI.getGenerativeModelFromCachedContent(queriedCache);

// Run inference on the service.
const result = await genModel.generateContent({
  contents: [
    {
      role: "user",
      parts: [
        { text: "What do purple cats drink, and what is this a picture of?" },
      ],
    },
  ],
});

// The response should note that purple cats drink chicken soup, and comment on
// the picture of the cat as well.
console.log(result.response.text());
