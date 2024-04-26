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

import { GoogleGenerativeAIError } from "../errors";
import {
  DEFAULT_API_VERSION,
  DEFAULT_BASE_URL,
  getClientHeaders,
} from "../requests/request";
import { RequestOptions } from "../../types";
import { FilesTask } from "./constants";

const taskToMethod = {
  [FilesTask.UPLOAD]: "POST",
  [FilesTask.LIST]: "GET",
  [FilesTask.GET]: "GET",
  [FilesTask.DELETE]: "DELETE",
};

export class FilesRequestUrl {
  private _url: URL;

  constructor(
    public task: FilesTask,
    public apiKey: string,
    public requestOptions?: RequestOptions,
  ) {
    const apiVersion = this.requestOptions?.apiVersion || DEFAULT_API_VERSION;
    const baseUrl = this.requestOptions?.baseUrl || DEFAULT_BASE_URL;
    let initialUrl = baseUrl;
    if (this.task === FilesTask.UPLOAD) {
      initialUrl += `/upload`;
    }
    initialUrl += `/${apiVersion}/files`;
    this._url = new URL(initialUrl);
  }

  appendPath(path: string): void {
    this._url.pathname = this._url.pathname + `/${path}`;
  }

  appendParam(key: string, value: string): void {
    this._url.searchParams.append(key, value);
  }

  toString(): string {
    return this._url.toString();
  }
}

export function getHeaders(url: FilesRequestUrl): Headers {
  const headers = new Headers();
  headers.append("x-goog-api-client", getClientHeaders(url.requestOptions));
  headers.append("x-goog-api-key", url.apiKey);
  return headers;
}

export async function makeFilesRequest(
  url: FilesRequestUrl,
  headers: Headers,
  body?: Blob,
  fetchFn: typeof fetch = fetch,
): Promise<Response> {
  const requestInit: RequestInit = {
    method: taskToMethod[url.task],
    headers,
  };

  if (body) {
    requestInit.body = body;
  }

  const signal = getSignal(url.requestOptions);
  if (signal) {
    requestInit.signal = signal;
  }

  try {
    const response = await fetchFn(url.toString(), requestInit);
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
    } else {
      return response;
    }
  } catch (e) {
    const err = new GoogleGenerativeAIError(
      `Error on task type: ${url.task} fetching from ${url.toString()}: ${
        e.message
      }`,
    );
    err.stack = e.stack;
    throw err;
  }
}

/**
 * Get AbortSignal if timeout is specified
 */
function getSignal(requestOptions?: RequestOptions): AbortSignal | null {
  if (requestOptions?.timeout >= 0) {
    const abortController = new AbortController();
    const signal = abortController.signal;
    setTimeout(() => abortController.abort(), requestOptions.timeout);
    return signal;
  }
}
