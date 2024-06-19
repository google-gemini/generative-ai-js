# Google AI SDK for JavaScript

> [!CAUTION]
> **Using the Google AI SDK for JavaScript directly from a client-side app is
> recommended for prototyping only.** If you plan to enable billing, we strongly
> recommend that you call the Google AI Gemini API only server-side to keep your
> API key safe. You risk potentially exposing your API key to malicious actors
> if you embed your API key directly in your JavaScript app or fetch it remotely
> at runtime.

The Google AI JavaScript SDK is the easiest way for JavaScript developers to build with the Gemini API. The Gemini API gives you access to Gemini models created by Google DeepMind. Gemini models are built from the ground up to be multimodal, so you can reason seamlessly across text, images, and code.

You can use this JavaScript SDK for applications built with Node.js or for web apps (but be careful to secure your API key).

## Get started with the Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Login with your Google account.
3. [Create](https://aistudio.google.com/app/apikey) an API key. Note that in Europe the free tier is not available.
4. Try one of the Javascript SDK quickstarts:
- [Quickstart for Node.js](https://ai.google.dev/tutorials/node_quickstart)
- [Quickstart for web apps](https://ai.google.dev/tutorials/web_quickstart)


## Usage example
See the [Node.js](https://ai.google.dev/tutorials/node_quickstart) or [Javascript](https://ai.google.dev/tutorials/web_quickstart) quickstarts for complete code.
 
### For Node.js
1. Install the SDK package

```js
npm install @google/generative-ai
```

2. Initialize the model
```js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
```

3. Run a prompt
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

### Web
1. Import the SDK
```html
<script type="importmap">
  {
    "imports": {
      "@google/generative-ai": "https://esm.run/@google/generative-ai"
    }
  }
</script>
<script type="module">
  import { GoogleGenerativeAI } from "@google/generative-ai";
</script>
```

2. Initialize the model

```js
import { GoogleGenerativeAI } from "@google/generative-ai";
const API_KEY = "..."; // Reminder: This should only be for local testing
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
```

3. Run a prompt
```js
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

See the [Gemini API Cookbook](https://github.com/google-gemini/gemini-api-cookbook/) or [ai.google.dev](https://ai.google.dev) for complete documentation.

## Contributing

See [Contributing](/docs/contributing.md) for more information on contributing to the Google AI JavaScript SDK.

## License

The contents of this repository are licensed under the [Apache License, version 2.0](http://www.apache.org/licenses/LICENSE-2.0).
