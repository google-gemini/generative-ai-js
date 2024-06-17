import { GoogleGenerativeAI  } from "@google/generative-ai";
import { GoogleAICacheManager, GoogleAIFileManager } from "@google/generative-ai/server";

const endpointConfiguration = {
  apiVersion: 'v1beta',
  baseUrl: 'https://autopush-generativelanguage.sandbox.googleapis.com'
};

async function uploadFile() {
  // Construct a FileManager to upload a file which can be used
  // in a Cached Context.
  const fileManager = new GoogleAIFileManager(process.env.API_KEY, endpointConfiguration);

  try {
   fileManager.deleteFile("files/browncat");
  } catch (error) { 

  }

  // Upload a picture of a brown cat.
  const fileResult = await fileManager.uploadFile("./utils/cat.jpg", {
    mimeType: "image/jpeg",
      name: "files/browncat",
      displayName: "brownCat",
  });

  return fileResult;
}

// Get your API key from https://makersuite.google.com/app/apikey  
// Access your API key as an environment variable.
const genAI = new GoogleGenerativeAI(process.env.API_KEY, endpointConfiguration);

// Construct a GoogleAICacheManager using your API key.
const cacheManager = new GoogleAICacheManager(process.env.API_KEY, endpointConfiguration);

// For brevity we create our own text to cache.
let text = "";
for (let i = 0; i < 6554; i++) {
  text += "Purple cats drink chicken soup.";
  text += i % 8 === 7 ? "\n" : " ";
}

const fileResult = await uploadFile();

// Create a cache which lasts 1 minute.
const cache = await cacheManager.create({
  ttlSeconds: 60,
  model: "models/gemini-1.5-pro-001", // Replace with the correct model at launch.
  contents: [
    {
      role: "user",
      parts: [
        { text },
        { 
          fileData: {
            mimeType: fileResult.file.mimeType,
            fileUri: fileResult.file.uri
          }
        }
      ],
    },
  ],
});

// Construct a GenerativeModel which uses the created cache.
const model = genAI.getGenerativeModelFromCachedContent(cache, endpointConfiguration);

// Query the service.
const result = await model.generateContent({
  contents: [
    {
      role: "user",
      parts: [{ text: "What do purple cats drink, and what is this a picture of?" }],
    },
  ],
});

// The response should note that purple cats drink chicken soup, and comment on
// the picture of the cat as well.
console.log(result.response.text());

