# Google Generative AI Sample for Node.js (Javascript)

This sample demonstrates how to use state-of-the-art
generative AI models (like Gemini) to build AI-powered features and applications.

To try out this sample, you'll need Node.js v18+.

## Requirements

Follow the instructions on Google AI Studio [setup page](https://makersuite.google.com/app/apikey) to obtain an API key.

It’s strongly recommended that you do not check an API key into your version control system. Instead, you should use a secrets store for your API key.

This sample assumes that you're providing an `API_KEY` environment variable.

## Features

### Simple examples

- `simple-text.js` - Text-only input, using the `gemini-pro` model
- `simple-text-and-images.js` - Text-and-images input (multimodal), using the `gemini-pro-vision` model
- `simple-chat.js` - Dialog language tasks, using `ChatSession` class
- `simple-config.js` - Configuring model parameters
- `simple-embedding.js` - Embeddings, using the `embedding-001` model

### More examples

- `advanced-text.js` - Using `countTokens`, `safetySettings` and streaming with a text-only input
- `advanced-text-and-images.js` - Using `countTokens`, `generationConfig` and streaming with multimodal input
- `advanced-chat.js` - Using `countTokens`, `generationConfig` and streaming with multi-turn conversations
- `advanced-embeddings.js` - Using `batchEmbedContents`

## Documentation

- [Quickstart: Get started with the Gemini API in Node.js applications](https://ai.google.dev/tutorials/node_quickstart)
