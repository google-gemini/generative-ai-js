# Google AI SDK for JavaScript

The Google AI JavaScript SDK is the easiest way for JavaScript developers to build with the Gemini API. The Gemini API provides access to Gemini [models](https://ai.google.dev/models/gemini) created by [Google DeepMind](https://deepmind.google/technologies/gemini/#introduction). These models are designed to be multimodal, allowing seamless reasoning across text, images, and code.

> **⚠ CAUTION:** Using the Google AI SDK for JavaScript directly from a client-side app is recommended **for prototyping only**. If you plan to enable billing, we strongly recommend calling the Google AI Gemini API **only on the server-side** to protect your API key from exposure to malicious actors.

## Get Started with the Gemini API

To begin using the Gemini API, follow these steps:

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Log in with your Google account.
3. [Create an API key](https://aistudio.google.com/app/apikey). *(Note: In Europe, the free tier is unavailable.)*
4. Try the [Node.js quickstart](https://ai.google.dev/tutorials/node_quickstart).

## Installation and Usage

### Install the SDK

To install the SDK, run:

```sh
npm install @google/generative-ai
```

### Initialize the Model

```js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
```

### Run a Prompt

```js
const prompt = "Does this look store-bought or homemade?";
const image = {
  inlineData: {
    data: Buffer.from(fs.readFileSync("cookie.png")).toString("base64"),
    mimeType: "image/png",
  },
};

const result = await model.generateContent([prompt, image]);
console.log(result.response.text());
```

## Try a Sample App

This repository contains sample Node.js and web apps demonstrating how the SDK can interact with the Gemini model for various use cases.

### Running the Sample Node App

1. Clone this repository:
   ```sh
   git clone https://github.com/google/generative-ai-js
   ```
2. [Obtain an API key](https://makersuite.google.com/app/apikey) to use with the Google AI SDKs.
3. Navigate to the `samples` folder and install dependencies:
   ```sh
   cd samples
   npm install
   ```
4. Assign your API key to an environment variable:
   ```sh
   export API_KEY=MY_API_KEY
   ```
5. Open the sample file you want to run (e.g., `text_generation.js`).
   - Inside the `runAll()` function, comment out any samples you don't want to execute.
6. Run the sample file:
   ```sh
   node text_generation.js
   ```

## Documentation

For complete documentation, see:

- [Gemini API Cookbook](https://github.com/google-gemini/gemini-api-cookbook/)
- [Google AI Developer Portal](https://ai.google.dev)

## Contributing

We welcome contributions! See our [Contributing Guide](/docs/contributing.md) for details on how to contribute to the Google AI JavaScript SDK.

## License

This repository is licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).

