# @google/generative-ai

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
