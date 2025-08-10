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

import { RequestOptions, SingleRequestOptions } from "../../types";
import {
  GoogleGenerativeAIAbortError,
  GoogleGenerativeAIError,
  GoogleGenerativeAIFetchError,
  GoogleGenerativeAIRequestInputError,
} from "../errors";

export const DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com";

export const DEFAULT_API_VERSION = "v1beta";

/**
 * We can't `require` package.json if this runs on web. We will use rollup to
 * swap in the version number here at build time.
 */
const PACKAGE_VERSION = "__PACKAGE_VERSION__";
const PACKAGE_LOG_HEADER = "genai-js";

export enum Task {
  GENERATE_CONTENT = "generateContent",
  STREAM_GENERATE_CONTENT = "streamGenerateContent",
  COUNT_TOKENS = "countTokens",
  EMBED_CONTENT = "embedContent",
  BATCH_EMBED_CONTENTS = "batchEmbedContents",
}

export class RequestUrl {
  constructor(
    public model: string,
    public task: Task,
    public apiKey: string,
    public stream: boolean,
    public requestOptions: RequestOptions,
  ) {}
  toString(): string {
    const apiVersion = this.requestOptions?.apiVersion || DEFAULT_API_VERSION;
    const baseUrl = this.requestOptions?.baseUrl || DEFAULT_BASE_URL;
    let url = `${baseUrl}/${apiVersion}/${this.model}:${this.task}`;
    if (this.stream) {
      url += "?alt=sse";
    }
    return url;
  }
}

/**
 * Simple, but may become more complex if we add more versions to log.
 */
export function getClientHeaders(requestOptions: RequestOptions): string {
  const clientHeaders = [];
  if (requestOptions?.apiClient) {
    clientHeaders.push(requestOptions.apiClient);
  }
  clientHeaders.push(`${PACKAGE_LOG_HEADER}/${PACKAGE_VERSION}`);
  return clientHeaders.join(" ");
}

export async function getHeaders(url: RequestUrl): Promise<Headers> {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("x-goog-api-client", getClientHeaders(url.requestOptions));
  headers.append("x-goog-api-key", url.apiKey);

  let customHeaders = url.requestOptions?.customHeaders;
  if (customHeaders) {
    if (!(customHeaders instanceof Headers)) {
      try {
        customHeaders = new Headers(customHeaders);
      } catch (e) {
        throw new GoogleGenerativeAIRequestInputError(
          `unable to convert customHeaders value ${JSON.stringify(
            customHeaders,
          )} to Headers: ${e.message}`,
        );
      }
    }

    for (const [headerName, headerValue] of customHeaders.entries()) {
      if (headerName === "x-goog-api-key") {
        throw new GoogleGenerativeAIRequestInputError(
          `Cannot set reserved header name ${headerName}`,
        );
      } else if (headerName === "x-goog-api-client") {
        throw new GoogleGenerativeAIRequestInputError(
          `Header name ${headerName} can only be set using the apiClient field`,
        );
      }

      headers.append(headerName, headerValue);
    }
  }

  return headers;
}

/**
 * Generates the request options to be passed to the fetch API.
 * @param requestOptions - The user-defined request options.
 * @returns The generated request options.
 */
function buildFetchOptions(requestOptions?: SingleRequestOptions): RequestInit {
  const fetchOptions = {} as RequestInit;
  if (requestOptions?.signal !== undefined || requestOptions?.timeout >= 0) {
    const controller = new AbortController();
    if (requestOptions?.timeout >= 0) {
      setTimeout(() => controller.abort(), requestOptions.timeout);
    }
    if (requestOptions?.signal) {
      requestOptions.signal.addEventListener("abort", () => {
        controller.abort();
      });
    }
    fetchOptions.signal = controller.signal;
  }
  return fetchOptions;
}

export async function constructModelRequest(
  model: string,
  task: Task,
  apiKey: string,
  stream: boolean,
  body: string,
  requestOptions: SingleRequestOptions,
): Promise<{ url: string; fetchOptions: RequestInit }> {
  const url = new RequestUrl(model, task, apiKey, stream, requestOptions);
  return {
    url: url.toString(),
    fetchOptions: {
      ...buildFetchOptions(requestOptions),
      method: "POST",
      headers: await getHeaders(url),
      body,
    },
  };
}

export async function makeModelRequest(
  model: string,
  task: Task,
  apiKey: string,
  stream: boolean,
  body: string,
  requestOptions: SingleRequestOptions = {},
  // Allows this to be stubbed for tests
  fetchFn = fetch,
): Promise<Response> {
  const { url, fetchOptions } = await constructModelRequest(
    model,
    task,
    apiKey,
    stream,
    body,
    requestOptions,
  );
  return makeRequest(url, fetchOptions, fetchFn);
}

export async function makeRequest(
  url: string,
  fetchOptions: RequestInit,
  fetchFn = fetch,
): Promise<Response> {
  let response;
  try {
    response = await fetchFn(url, fetchOptions);
  } catch (e) {
    handleResponseError(e, url);
  }

  if (!response.ok) {
    await handleResponseNotOk(response, url);
  }

  return response;
}

function handleResponseError(e: Error, url: string): void {
  let err = e;
  if (err.name === "AbortError") {
    err = new GoogleGenerativeAIAbortError(
      `Request aborted when fetching ${url.toString()}: ${e.message}`,
    );
    err.stack = e.stack;
  } else if (
    !(
      e instanceof GoogleGenerativeAIFetchError ||
      e instanceof GoogleGenerativeAIRequestInputError
    )
  ) {
    err = new GoogleGenerativeAIError(
      `Error fetching from ${url.toString()}: ${e.message}`,
    );
    err.stack = e.stack;
  }
  throw err;
}

async function handleResponseNotOk(
  response: Response,
  url: string,
): Promise<void> {
  let originalMessage = "";
  let errorDetails;
  let isUnsupportedModelError = false;
  const newSdkUrl = "https://github.com/googleapis/js-genai";
  // Patterns for newer models likely requiring the new SDK
  const unsupportedModelPatterns = [/gemini-2/, /gemini-pro-2.0/, /gemini-ultra-2.0/, /gemini-flash-2.5/, /gemini-pro-2.5/, /gemini-2.5-pro/, /gemini-2.5-pro-exp/, /gemini-2.0-flash/];

  // Extract model name from the URL
  let requestedModel = "unknown";
  // Match /v.../models/model-name: or /v.../tunedModels/model-name:
  const modelNameMatch = url.match(/\/(v\d+(?:beta)?\d*)\/(?:models|tunedModels)\/([^:]+):/);
  if (modelNameMatch && modelNameMatch[2]) {
      requestedModel = modelNameMatch[2];
  }

  try {
    const json = await response.json();
    originalMessage = json.error?.message || ""; // Safely access message
    errorDetails = json.error?.details; // Safely access details

    // Check 1: Explicit model name check
    if (unsupportedModelPatterns.some(pattern => pattern.test(requestedModel))) {
        // If the requested model *is* one of the new ones, assume this error is due to SDK incompatibility.
        isUnsupportedModelError = true;
    }

    // Append original details to message if they exist and aren't already in the message
    if (errorDetails && !originalMessage.includes(JSON.stringify(errorDetails))) {
      originalMessage += ` ${JSON.stringify(errorDetails)}`;
    }

  } catch (e) {
    // Error parsing JSON is ignored, proceed with original status/text
  }

  let finalMessage = `Error fetching from ${url.toString()}: [${response.status} ${response.statusText}] ${originalMessage || 'Server responded with an error.'}`; // Provide default if message is empty

  if (isUnsupportedModelError) {
      // Prepend the specific message for known unsupported models
      finalMessage = `It looks like you're trying to use a newer Gemini model (${requestedModel}) with an older SDK. This model requires the latest SDK. Please upgrade to the latest SDK available at ${newSdkUrl}. Original error: ${finalMessage}`;
  } else if ((response.status === 400 || response.status === 404) && (originalMessage.includes("Invalid model") || originalMessage.includes("not found") || originalMessage.includes("API key not valid"))) {
      // Add a more general hint for other model-related or key errors that might be due to trying new models/regions
      finalMessage += `\nHint: If you are trying to use a newer Gemini model (e.g., Gemini 2.0, 2.5 Pro) or a specific region, ensure your API key is valid for that model/region and consider upgrading to the latest SDK: ${newSdkUrl}`;
  }

  throw new GoogleGenerativeAIFetchError(
    finalMessage,
    response.status,
    response.statusText,
  );
}
