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

import { SingleRequestOptions } from "../../types";
import {
  CreateTunedModelParams,
  CreateTunedModelResponse,
  ListTunedModelsParams,
  ListTunedModelsResponse,
  TunedModelResponse,
  TuningOperationResponse,
} from "../../types/tune-model";
import { GoogleAITunedModelManager } from "../server/tuned-model-manager";

/**
 * List all tuned models.
 *
 * @param apiKey - API key for Google Generative AI
 * @param listParams - Parameters for filtering and pagination
 * @param requestOptions - Optional request configuration
 * @returns A promise that resolves to the list of tuned models
 */
export async function listTunedModels(
  apiKey: string,
  listParams?: ListTunedModelsParams,
  requestOptions: SingleRequestOptions = {},
): Promise<ListTunedModelsResponse> {
  const tunedModelManager = new GoogleAITunedModelManager(
    apiKey,
    requestOptions,
  );
  return tunedModelManager.listTunedModels(listParams, requestOptions);
}

/**
 * Get a specific tuned model by name.
 *
 * @param apiKey - API key for Google Generative AI
 * @param modelName - Name of the tuned model to retrieve (with or without the tunedModels/ prefix)
 * @param requestOptions - Optional request configuration
 * @returns A promise that resolves to the tuned model details
 */
export async function getTunedModel(
  apiKey: string,
  modelName: string,
  requestOptions: SingleRequestOptions = {},
): Promise<TunedModelResponse> {
  const tunedModelManager = new GoogleAITunedModelManager(
    apiKey,
    requestOptions,
  );
  return tunedModelManager.getTunedModel(modelName, requestOptions);
}

/**
 * Create a new tuned model.
 *
 * @param apiKey - API key for Google Generative AI
 * @param params - Parameters for the tuned model creation
 * @param requestOptions - Optional request configuration
 * @returns A promise that resolves to the tuned model creation operation
 */
export async function createTunedModel(
  apiKey: string,
  params: CreateTunedModelParams,
  requestOptions: SingleRequestOptions = {},
): Promise<CreateTunedModelResponse> {
  const tunedModelManager = new GoogleAITunedModelManager(
    apiKey,
    requestOptions,
  );
  return tunedModelManager.createTunedModel(params, requestOptions);
}

/**
 * Delete a tuned model by name.
 *
 * @param apiKey - API key for Google Generative AI
 * @param modelName - Name of the tuned model to delete (with or without the tunedModels/ prefix)
 * @param requestOptions - Optional request configuration
 * @returns A promise that resolves when the deletion is complete
 */
export async function deleteTunedModel(
  apiKey: string,
  modelName: string,
  requestOptions: SingleRequestOptions = {},
): Promise<void> {
  const tunedModelManager = new GoogleAITunedModelManager(
    apiKey,
    requestOptions,
  );
  return tunedModelManager.deleteTunedModel(modelName, requestOptions);
}

/**
 * Get the status of a tuning operation.
 *
 * @param apiKey - API key for Google Generative AI
 * @param operationName - Name of the operation to check
 * @param requestOptions - Optional request configuration
 * @returns A promise that resolves to the operation status
 */
export async function getTuningOperation(
  apiKey: string,
  operationName: string,
  requestOptions: SingleRequestOptions = {},
): Promise<TuningOperationResponse> {
  const tunedModelManager = new GoogleAITunedModelManager(
    apiKey,
    requestOptions,
  );
  return tunedModelManager.getOperation(operationName, requestOptions);
}
