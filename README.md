# Google AI SDK for JavaScript

> [!NOTE] A new Javascript/Typescript SDK, `@google/genai`
> ([github](https://github.com/googleapis/js-genai/tree/main)), is currently
> available in a *preview launch* - designed to work with Gemini 2.0 features
> and support both the Gemini API and the Vertex API.

The Google AI JavaScript SDK is the easiest way for JavaScript developers to
build with the Gemini API. The Gemini API gives you access to Gemini
[models](https://ai.google.dev/models/gemini) created by
[Google DeepMind](https://deepmind.google/technologies/gemini/#introduction).
Gemini models are built from the ground up to be multimodal, so you can reason
seamlessly across text, images, and code.

> [!CAUTION] **Using the Google AI SDK for JavaScript directly from a
> client-side app is recommended for prototyping only.** If you plan to enable
> billing, we strongly recommend that you call the Google AI Gemini API only
> server-side to keep your API key safe. You risk potentially exposing your API
> key to malicious actors if you embed your API key directly in your JavaScript
> app or fetch it remotely at runtime.

## Get started with the Gemini API

1.  Go to [Google AI Studio](https://aistudio.google.com/).
2.  Login with your Google account.
3.  [Create an API key](https://aistudio.google.com/app/apikey). Note that in
    Europe the free tier is not available.
4.  Try the
    [Node.js quickstart](https://ai.google.dev/tutorials/node_quickstart)

## Usage example

See the [Node.js quickstart](https://ai.google.dev/tutorials/node_quickstart)
for complete code.

1.  Install the SDK package

```js
npm install @google/generative-ai
```

2.  Initialize the model

```js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
```

3.  Run a prompt

```js
import * as fs from 'fs';
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

## Elastic Embedding Sizes

The SDK supports elastic embedding sizes for text embedding models. You can specify the dimension size when creating embeddings:

```js
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

// Get an embedding with 128 dimensions instead of the default 768
const result = await model.embedContent({
  content: { role: "user", parts: [{ text: "Hello world!" }] },
  dimensions: 128
});

console.log("Embedding size:", result.embedding.values.length); // 128
```

Supported dimension sizes are: 128, 256, 384, 512, and 768 (default).

## Try out a sample app

This repository contains sample Node and web apps demonstrating how the SDK can
access and utilize the Gemini model for various use cases.

**To try out the sample Node app, follow these steps:**

1.  Check out this repository. \
    `git clone https://github.com/google/generative-ai-js`

2.  [Obtain an API key](https://makersuite.google.com/app/apikey) to use with
    the Google AI SDKs.

3.  cd into the `samples` folder and run `npm install`.

4.  Assign your API key to an environment variable: `export API_KEY=MY_API_KEY`.

5.  Open the sample file you're interested in. Example: `text_generation.js`.
    In the `runAll()` function, comment out any samples you don't want to run.

6.  Run the sample file. Example: `node text_generation.js`.

## Documentation

See the
[Gemini API Cookbook](https://github.com/google-gemini/gemini-api-cookbook/) or
[ai.google.dev](https://ai.google.dev) for complete documentation. For the API reference docs, please refer to [JavaScript SDK Reference](https://github.com/google-gemini/generative-ai-js/blob/main/docs/reference/main/index.md).

## Contributing

See [Contributing](/docs/contributing.md) for more information on contributing
to the Google AI JavaScript SDK.

## License

The contents of this repository are licensed under the
[Apache License, version 2.0](http://www.apache.org/licenses/LICENSE-2.0).
