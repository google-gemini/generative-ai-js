/**
 * @license
 * Copyright 2023 Google LLC
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

const BASE_URL = "https://generativelanguage.googleapis.com";

const API_VERSION = "v1";

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
  ) {}
  toString(): string {
    let url = `${BASE_URL}/${API_VERSION}/models/${this.model}:${this.task}`;
    if (this.stream) {
      url += "?alt=sse";
    }
    return url;
  }
}

/**
 * Simple, but may become more complex if we add more versions to log.
 */
function getClientHeaders(): string {
  return `${PACKAGE_LOG_HEADER}/${PACKAGE_VERSION}`;
}

export async function makeRequest(
  url: RequestUrl,
  body: string,
  requestOptions?: RequestOptions,
): Promise<Response> {
  let response;
  try {
    response = await fetch(url.toString(), {
      ...buildFetchOptions(requestOptions),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-client": getClientHeaders(),
        "x-goog-api-key": url.apiKey,
      },
      body,
    });
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
