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

import { RequestOptions } from "../../types";
import { GoogleGenerativeAIError } from "../errors";

export const DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com";

export const DEFAULT_API_VERSION = "v1";

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
  return headers;
}

export async function constructRequest(
  model: string,
  task: Task,
  apiKey: string,
  stream: boolean,
  body: string,
  requestOptions?: RequestOptions,
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

/**
 * Wrapper for _makeRequestInternal that automatically uses native fetch,
 * allowing _makeRequestInternal to be tested with a mocked fetch function.
 */
export async function makeRequest(
  model: string,
  task: Task,
  apiKey: string,
  stream: boolean,
  body: string,
  requestOptions?: RequestOptions,
): Promise<Response> {
  return _makeRequestInternal(
    model,
    task,
    apiKey,
    stream,
    body,
    requestOptions,
    fetch,
  );
}

export async function _makeRequestInternal(
  model: string,
  task: Task,
  apiKey: string,
  stream: boolean,
  body: string,
  requestOptions?: RequestOptions,
  // Allows this to be stubbed for tests
  fetchFn = fetch,
): Promise<Response> {
  const url = new RequestUrl(model, task, apiKey, stream, requestOptions);
  let response;
  try {
    const request = await constructRequest(
      model,
      task,
      apiKey,
      stream,
      body,
      requestOptions,
    );
    response = await fetchFn(request.url, request.fetchOptions);
    if (!response.ok) {
      let message = "";
      try {
        const json = await response.json();
        message = json.error.message;
        if (json.error.details) {
          message += ` ${JSON.stringify(json.error.details)}`;
        }
      } catch (e) {
        // ignored
      }
      throw new Error(`[${response.status} ${response.statusText}] ${message}`);
    }
  } catch (e) {
    const err = new GoogleGenerativeAIError(
      `Error fetching from ${url.toString()}: ${e.message}`,
    );
    err.stack = e.stack;
    throw err;
  }
  return response;
}

/**
 * Generates the request options to be passed to the fetch API.
 * @param requestOptions - The user-defined request options.
 * @returns The generated request options.
 */
function buildFetchOptions(requestOptions?: RequestOptions): RequestInit {
  const fetchOptions = {} as RequestInit;
  if (requestOptions?.timeout >= 0) {
    const abortController = new AbortController();
    const signal = abortController.signal;
    setTimeout(() => abortController.abort(), requestOptions.timeout);
    fetchOptions.signal = signal;
  }
  return fetchOptions;
}
