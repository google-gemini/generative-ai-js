# Google AI JavaScript SDK

The Google AI JavaScript SDK enables developers to use Google's state-of-the-art generative AI models (like Gemini) to build AI-powered features and applications. This SDK supports use cases like:
- Generate text from text-only input
- Generate text from text-and-images input (multimodal)
- Build multi-turn conversations (chat)
- _(for Node.js)_ Embedding

You can use this JavaScript SDK for applications built with Node.js or for web apps.

For example, with just a few lines of code, you can access Gemini's multimodal capabilities to generate text from text-and-image input.

For Node.js:
```
const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

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

For web:
```
const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

const prompt = "Does this look store-bought or homemade?";
const image = {
  inlineData: {
    data: base64EncodedImage /* see JavaScript quickstart for details */,
    mimeType: "image/png",
  },
};

const result = await model.generateContent([prompt, image]);
console.log(result.response.text());
```

## Try out a sample app

This repository contains sample Node and web apps demonstrating how the SDK can access and utilize the Gemini model for various use cases.

**To try out the sample Node app, follow these steps:**

1.  Check out this repository.\
`git clone https://github.com/google/generative-ai-js`

1.  [Obtain an API key](https://makersuite.google.com/app/apikey) to use with the Google AI SDKs.

1.  cd into the `samples/node` folder and run `npm install`.

1.  Assign your API key to an environment variable: `export API_KEY=MY_API_KEY`.

1.  Run the sample file you're interested in. Example: `node simple-text.js`.

**To try out the sample web app, follow these steps:**

1.  Check out this repository.\
`git clone https://github.com/google/generative-ai-js`

1.  [Obtain an API key](https://makersuite.google.com/app/apikey) to use with the Google AI SDKs.

1.  cd into the `samples/web` folder and run `npm install`.

1.  Assign your API key to an environment variable: `export API_KEY=MY_API_KEY`.

1.  Serve your web app by running: `npm run http-server`. Open the displayed URL in a browser.

## Installation and usage

- For Node.js (or web projects using NPM), run `npm install @google/generative-ai`.
- For web, add `import  { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai"`.

For detailed instructions, you can find quickstarts for the Google AI JavaScript SDK in the Google documentation:


- [Quickstart for Node.js](https://ai.google.dev/tutorials/node_quickstart)
- [Quickstart for web apps](https://ai.google.dev/tutorials/web_quickstart)

These quickstarts describe how to add your API key and the SDK to your app, initialize the model, and then call the API to access the model. It also describes some additional use cases and features, like streaming, counting tokens, and controlling responses. For Node.js, embedding is also available.

## Documentation

Find complete documentation for the Google AI SDKs and the Gemini model in the Google documentation:\
https://ai.google.dev/docs

Find reference docs for this SDK [here in the repo](/docs/reference/generative-ai.md).

## Contributing

See [Contributing](/docs/contributing.md) for more information on contributing to the Google AI JavaScript SDK.

## License

The contents of this repository are licensed under the [Apache License, version 2.0](http://www.apache.org/licenses/LICENSE-2.0).
