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

import { ErrorDetails } from "../types";

/**
 * Basic error type for this SDK.
 * @public
 */
export class GoogleGenerativeAIError extends Error {
  constructor(message: string) {
    super(`[GoogleGenerativeAI Error]: ${message}`);
  }
}

/**
 * Errors in the contents of a response from the model. This includes parsing
 * errors, or responses including a safety block reason.
 * @public
 */
export class GoogleGenerativeAIResponseError<
  T,
> extends GoogleGenerativeAIError {
  constructor(
    message: string,
    public response?: T,
  ) {
    super(message);
  }
}

/**
 * Error class covering HTTP errors when calling the server. Includes HTTP
 * status, statusText, and optional details, if provided in the server response.
 * @public
 */
export class GoogleGenerativeAIFetchError extends GoogleGenerativeAIError {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string,
    public errorDetails?: ErrorDetails[],
  ) {
    super(message);
  }
}

/**
 * Errors in the contents of a request originating from user input.
 * @public
 */
export class GoogleGenerativeAIRequestInputError extends GoogleGenerativeAIError {}
