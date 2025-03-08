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
  CreateTunedModelParams,
  CreateTunedModelResponse,
  ListTunedModelsParams,
  ListTunedModelsResponse,
  TunedModelResponse,
  TuningOperationResponse,
} from "../../types/tune-model";
import { GoogleGenerativeAIError } from "../errors";
import { RpcTask } from "./constants";
import {
  OperationsUrl,
  TunedModelsUrl,
  getHeaders,
  makeServerRequest,
} from "./request";

/**
 * Parse a tuned model name, handling both prefixed and non-prefixed versions
 */
function parseTunedModelName(name: string): string {
  if (!name) {
    throw new GoogleGenerativeAIError(
      `Invalid tuned model name ${name}. ` +
        `Must be in the format "tunedModels/modelname" or "modelname"`,
    );
  }

  if (name.startsWith("tunedModels/")) {
    return name;
  }

  return `tunedModels/${name}`;
}

/**
 * Parse an operation name, handling both prefixed and non-prefixed versions
 * as well as operations that are part of tunedModels paths
 */
function parseOperationName(name: string): string {
  if (!name) {
    throw new GoogleGenerativeAIError(
      `Invalid operation name ${name}. ` +
        `Must be in the format "operations/operationid" or a full model operation path`,
    );
  }

  // If it's already a full path like tunedModels/x/operations/y, return as is
  if (name.includes("tunedModels") && name.includes("operations")) {
    return name;
  }

  // If it's just operations/x, return as is
  if (name.startsWith("operations/")) {
    return name;
  }

  // For bare operation IDs
  return `operations/${name}`;
}

/**
 * Class for managing GoogleAI tuned models.
 * @public
 */
export class GoogleAITunedModelManager {
  constructor(
    public apiKey: string,
    private _requestOptions: RequestOptions = {},
  ) {}

  /**
   * List all tuned models.
   *
   * Any fields set in the optional {@link SingleRequestOptions} parameter will take
   * precedence over the {@link RequestOptions} values provided at the time of the
   * {@link GoogleAITunedModelManager} initialization.
   */
  async listTunedModels(
    listParams?: ListTunedModelsParams,
    requestOptions: SingleRequestOptions = {},
  ): Promise<ListTunedModelsResponse> {
    const tunedModelRequestOptions: SingleRequestOptions = {
      ...this._requestOptions,
      ...requestOptions,
    };

    const url = new TunedModelsUrl(
      RpcTask.LIST_TUNED_MODELS,
      this.apiKey,
      tunedModelRequestOptions,
    );

    if (listParams?.pageSize) {
      url.appendParam("pageSize", listParams.pageSize.toString());
    }

    if (listParams?.pageToken) {
      url.appendParam("pageToken", listParams.pageToken);
    }

    if (listParams?.filter) {
      url.appendParam("filter", listParams.filter);
    }

    const headers = getHeaders(url);
    const response = await makeServerRequest(url, headers);
    return response.json();
  }

  /**
   * Get a tuned model by name.
   *
   * Any fields set in the optional {@link SingleRequestOptions} parameter will take
   * precedence over the {@link RequestOptions} values provided at the time of the
   * {@link GoogleAITunedModelManager} initialization.
   *
   * @param modelName - The name of the tuned model to retrieve. Can be a short name or full path.
   *                    E.g., "my-model-id" or "tunedModels/my-model-id"
   * @param requestOptions - Optional request options
   * @returns A promise that resolves to the tuned model information
   */
  async getTunedModel(
    modelName: string,
    requestOptions: SingleRequestOptions = {},
  ): Promise<TunedModelResponse> {
    const tunedModelRequestOptions: SingleRequestOptions = {
      ...this._requestOptions,
      ...requestOptions,
    };

    const url = new TunedModelsUrl(
      RpcTask.GET_TUNED_MODEL,
      this.apiKey,
      tunedModelRequestOptions,
    );

    // Parse the model name to ensure it's in the correct format
    const parsedName = parseTunedModelName(modelName);

    // The appendPath method expects just the ID without the prefix
    // Extract just the model ID if the name includes the prefix
    const modelId = parsedName.replace("tunedModels/", "");
    url.appendPath(modelId);

    const headers = getHeaders(url);
    const response = await makeServerRequest(url, headers);

    if (!response.ok) {
      const errorText = await response.text();
      throw new GoogleGenerativeAIError(
        `Error fetching tuned model: ${response.status} ${response.statusText}. ${errorText}`,
      );
    }

    return response.json();
  }

  /**
   * Create a new tuned model.
   *
   * This operation is asynchronous and returns an operation that can be polled
   * using getOperation().
   *
   * Any fields set in the optional {@link SingleRequestOptions} parameter will take
   * precedence over the {@link RequestOptions} values provided at the time of the
   * {@link GoogleAITunedModelManager} initialization.
   */
  async createTunedModel(
    params: CreateTunedModelParams,
    requestOptions: SingleRequestOptions = {},
  ): Promise<CreateTunedModelResponse> {
    const tunedModelRequestOptions: SingleRequestOptions = {
      ...this._requestOptions,
      ...requestOptions,
    };

    const url = new TunedModelsUrl(
      RpcTask.CREATE_TUNED_MODEL,
      this.apiKey,
      tunedModelRequestOptions,
    );

    const headers = getHeaders(url);

    // Deep clone the params to avoid modifying the input
    const payload = JSON.parse(JSON.stringify(params));

    // No need to restructure the training data - the API expects the format
    // provided in the types/tune-model.ts interface

    const payloadStr = JSON.stringify(payload);
    const response = await makeServerRequest(url, headers, payloadStr);
    return response.json();
  }

  /**
   * Delete a tuned model by name.
   *
   * Any fields set in the optional {@link SingleRequestOptions} parameter will take
   * precedence over the {@link RequestOptions} values provided at the time of the
   * {@link GoogleAITunedModelManager} initialization.
   */
  async deleteTunedModel(
    modelName: string,
    requestOptions: SingleRequestOptions = {},
  ): Promise<void> {
    const tunedModelRequestOptions: SingleRequestOptions = {
      ...this._requestOptions,
      ...requestOptions,
    };

    const url = new TunedModelsUrl(
      RpcTask.DELETE_TUNED_MODEL,
      this.apiKey,
      tunedModelRequestOptions,
    );

    // Parse the model name to ensure it's in the correct format
    const parsedName = parseTunedModelName(modelName);

    // The appendPath method expects just the ID without the prefix
    // Extract just the model ID if the name includes the prefix
    const modelId = parsedName.replace("tunedModels/", "");
    url.appendPath(modelId);

    const headers = getHeaders(url);
    await makeServerRequest(url, headers);
  }

  /**
   * Get the status of a tuning operation.
   *
   * Any fields set in the optional {@link SingleRequestOptions} parameter will take
   * precedence over the {@link RequestOptions} values provided at the time of the
   * {@link GoogleAITunedModelManager} initialization.
   *
   * @param operationName - The operation name to check. Can be a full path like
   *                       "tunedModels/model-id/operations/op-id" or just "operations/op-id"
   * @param requestOptions - Optional request options
   * @returns A promise that resolves to the operation status
   */
  async getOperation(
    operationName: string,
    requestOptions: SingleRequestOptions = {},
  ): Promise<TuningOperationResponse> {
    const tunedModelRequestOptions: SingleRequestOptions = {
      ...this._requestOptions,
      ...requestOptions,
    };

    // For operations that are part of a tunedModel path (tunedModels/{model-id}/operations/{operation-id})
    if (
      operationName.includes("tunedModels") &&
      operationName.includes("operations")
    ) {
      // Use apiVersion v1 for operations URLs
      const v1RequestOptions = {
        ...tunedModelRequestOptions,
        apiVersion: "v1",
      };

      // Use the OperationsUrl class for consistent URL construction
      const url = new OperationsUrl(
        RpcTask.GET_TUNING_OPERATION,
        this.apiKey,
        v1RequestOptions,
      );

      // The operation path needs to be the full path without the version prefix
      url.appendPath(operationName);

      // Use standard headers and request method
      const headers = getHeaders(url);
      const response = await makeServerRequest(url, headers);

      if (!response.ok) {
        const errorText = await response.text();
        throw new GoogleGenerativeAIError(
          `Error fetching operation: ${response.status} ${response.statusText}. ${errorText}`,
        );
      }

      return response.json();
    }

    // For standard operations not tied to tunedModels
    const url = new OperationsUrl(
      RpcTask.GET_TUNING_OPERATION,
      this.apiKey,
      tunedModelRequestOptions,
    );

    const parsedName = parseOperationName(operationName);
    url.appendPath(parsedName);

    const headers = getHeaders(url);
    const response = await makeServerRequest(url, headers);

    if (!response.ok) {
      const errorText = await response.text();
      throw new GoogleGenerativeAIError(
        `Error fetching operation: ${response.status} ${response.statusText}. ${errorText}`,
      );
    }

    return response.json();
  }
}
