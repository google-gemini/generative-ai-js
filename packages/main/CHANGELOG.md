# @google/generative-ai

## 0.13.0

### Minor Changes

- 83ec4ac: Expand the model's `countTokens` method to alternatively accept a `GenerateContentRequest`.
- 5df61d1: Added `GoogleAICacheManager` utility to allow caching large content to be used in inference. This class is exported from the `@google/generative-ai/server` subpath. Breaking change: The `GoogleAIFileManager` class has been moved to be exported from this subpath as well instead of the `/files` subpath.

### Patch Changes

- 1440a05: Removed the `model` field from the internally formatted payload of `countToken` requests as it was unnecessary.
- 03eb57b: Fix missing usageMetadata in streamed aggregated response (#174)

## 0.12.0

### Minor Changes

- 85ff2c4: Added `responseSchema` to `GenerationConfig` to allow user to provide a JSON schema when `responseMimeType` is set to JSON.

## 0.11.5

### Patch Changes

- 42ba6ca: Fix paths to @google/generative-ai/files.

## 0.11.4

### Patch Changes

- ee02ff0: Add additional properties `videoMetadata` and `error` to `FileMetadataResponse` type.

## 0.11.3

### Patch Changes

- c7c0b50: Fixed `FileState` enum values to be strings.

## 0.11.2

### Patch Changes

- cefa8f2: Lifted a restriction in chat sessions that required a specific order of content roles.

## 0.11.1

### Patch Changes

- 819501f: Fix a bug that caused file uploads to be named "undefined" if no file name is provided.

## 0.11.0

### Minor Changes

- 58ab777: Added responseMimeType to GenerationConfig to allow for JSON formatted responses.

### Patch Changes

- c39015c: Fixed a bug where `text()` did not handle multiple `TextPart`s in a single candidate. Added `state` field to `FileMetadataResponse`.

## 0.10.0

### Minor Changes

- 657799a: Added UsageMetadata to GenerateContentResponses.
- 4562366: Add a request option for custom headers

## 0.9.0

### Minor Changes

- ca62400: Allow text-only systemInstruction as well as Part and Content.
- 111e970: Export error classes and add more properties to fetch errors.

## 0.8.0

### Minor Changes

- a89d427: Add GoogleAIFileManager for file uploads.

## 0.7.1

### Patch Changes

- 6ef8cee: Fixed bugs where `RequestOptions`, `generationConfig`, and `safetySettings` were not passed from the model down to some methods.

## 0.7.0

### Minor Changes

- 79b7651: Set default API version to "v1beta" to match Go and Python.

## 0.6.0

### Minor Changes

- 2a1f97c: Add `systemInstruction` feature and forced function calling feature (using `toolConfig`).

### Patch Changes

- 0931d2c: Refactor makeRequest to make fetch mockable.

## 0.5.0

### Minor Changes

- 658a0da: Add `apiClient` configuration option to `RequestOptions`.

## 0.4.0

### Minor Changes

- 790a943: Deprecate functionCall() and add functionCalls().
- e636823: Loosen role field typing on Content.
- 7a45f01: Add option in RequestOptions to change baseUrl.

### Patch Changes

- 3f95168: Fix requestOptions not being passed through countTokens, embedContent, and batchEmbedContents

## 0.3.1

### Patch Changes

- ccd9951: validateChatHistory is now checking that 'parts' property is an array

## 0.3.0

### Minor Changes

- 932e1be: Add `apiVersion` property to `RequestOptions` to allow user to choose API endpoint version.
- 9887465: Added support for function calling

## 0.2.1

### Patch Changes

- 2b0c955: Handle different model prefixes (such as tunedModels/).

## 0.2.0

### Minor Changes

- c64fca1: add request timeout configuration

## 0.1.3

### Patch Changes

- 54839f2: Send API key in header instead of query param.
- 6a4c9c2: Fixed stream hanging

## 0.1.2

### Patch Changes

- 73c2ff9: Fixed UTF-8 handling and chunking for stream output
- fb52d34: Obscure API key in error messages
- 5b5fc7d: Catch unhandled rejections in `sendMessageStream`.

## 0.1.1

### Patch Changes

- Update README to released version and bump to publish new README to npm.
