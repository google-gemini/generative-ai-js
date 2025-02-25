# Google Generative AI Samples for JavaScript

These samples demonstrate how to use state-of-the-art
generative AI models (like Gemini) to build AI-powered features and applications.

To try out these samples, you'll need Node.js v18+.

For some samples of how to adapt this to web, see the `web/` subdirectory.

## Requirements

Follow the instructions on Google AI Studio [setup page](https://makersuite.google.com/app/apikey) to obtain an API key.

It’s strongly recommended that you do not check an API key into your version control system. Instead, you should use a secrets store for your API key.

This sample assumes that you're providing an `API_KEY` environment variable.

## Instructions

Each of these sample files can be run in Node.js from the command line, for
example:

```
node function_calling.js
```

Some of these files run multiple example cases sequentially, and you may want
to comment out cases you do not want to run.

## Documentation

- [Quickstart: Get started with the Gemini API in Node.js applications](https://ai.google.dev/tutorials/node_quickstart)

## Contents

| File                                                     | Description |
|----------------------------------------------------------| ----------- |
| [cache.js](./cache.js)                                   | Context caching |
| [chat.js](./chat.js)                                     | Multi-turn chat conversations |
| [code_execution.js](./code_execution.js)                 | Executing code |
| [model_configuration.js](./model_configuration.js) | Setting model parameters |
| [controlled_generation.js](./controlled_generation.js)   | Generating content with output constraints (e.g. JSON mode) |
| [count_tokens.js](./count_tokens.js)                     | Counting input and output tokens |
| [embed.js](./embed.js)                                   | Generating embeddings |
| [files.js](./files.js)                                   | Managing files with the File API |
| [function_calling.js](./function_calling.js)             | Using function calling |
| [safety_settings.js](./safety_settings.js)               | Setting and using safety controls |
| [system_instruction.js](./system_instruction.js)         | Setting system instructions |
| [search_grounding.js](./search_grounding.js)             | Generate with google search grounding |
| [log_prob.js](./log_prob.js)                             | Generate with log probability for each token |
| [text_generation.js](./text_generation.js)               | Generating text |
| [api_version.js](./api_version.js)                       | Setting api version|
