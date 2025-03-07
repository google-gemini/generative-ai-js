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

export enum List {
    MODELS = "models",
}

export class RequestUrl {
    constructor(
        public list: List,
        public apiKey: string,
        public requestOptions: RequestOptions,
    ) { }
    toString(): string {
        const apiVersion = this.requestOptions?.apiVersion || DEFAULT_API_VERSION;
        const baseUrl = this.requestOptions?.baseUrl || DEFAULT_BASE_URL;
        return `${baseUrl}/${apiVersion}/${this.list}`;
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

export async function getListRequest(
    list: List,
    apiKey: string,
    requestOptions: SingleRequestOptions,
): Promise<{ url: string; fetchOptions: RequestInit }> {
    const url = new RequestUrl(list, apiKey, requestOptions);
    return {
        url: url.toString(),
        fetchOptions: {
            ...buildFetchOptions(requestOptions),
            method: "GET",
            headers: await getHeaders(url),
        },
    };
}

export async function makeListRequest(
    list: List,
    apiKey: string,
    params?: {},
    requestOptions: SingleRequestOptions = {},
    // Allows this to be stubbed for tests
    fetchFn = fetch,
): Promise<Response> {
    const { url, fetchOptions } = await getListRequest(
        list,
        apiKey,
        requestOptions,
    );

    let finalUrl = url;

    if (params && Object.keys(params).length > 0) {
        const queryString = new URLSearchParams(params).toString();
        finalUrl += `?${queryString}`;
    }

    return makeRequest(finalUrl, fetchOptions, fetchFn);
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
    let message = "";
    let errorDetails;
    try {
        const json = await response.json();
        message = json.error.message;
        if (json.error.details) {
            message += ` ${JSON.stringify(json.error.details)}`;
            errorDetails = json.error.details;
        }
    } catch (e) {
        // ignored
    }
    throw new GoogleGenerativeAIFetchError(
        `Error fetching from ${url.toString()}: [${response.status} ${response.statusText
        }] ${message}`,
        response.status,
        response.statusText,
        errorDetails,
    );
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
