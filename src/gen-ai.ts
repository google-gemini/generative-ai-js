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

import {
  GoogleGenerativeAIError,
  GoogleGenerativeAIRequestInputError,
} from "./errors";
import { CachedContent, ModelParams, RequestOptions } from "../types";
import { GenerativeModel } from "./models/generative-model";

import {
  CheckTuningStatusResponse,
  CreateTunedModelResponse,
  DeleteTunedModelResponse,
  ListTunedModelsResponse,
  checkTuningStatus,
  createTunedModel,
  deleteTunedModel,
  listTunedModels,
} from "./methods/fine-tuning";

export { ChatSession } from "./methods/chat-session";
export { GenerativeModel };

/**
 * Top-level class for this SDK
 * @public
 */
export class GoogleGenerativeAI {
  constructor(public apiKey: string) { }

  /**
   * Gets a {@link GenerativeModel} instance for the provided model name.
   */
  getGenerativeModel(
    modelParams: ModelParams,
    requestOptions?: RequestOptions,
  ): GenerativeModel {
    if (!modelParams.model) {
      throw new GoogleGenerativeAIError(
        `Must provide a model name. ` +
        `Example: genai.getGenerativeModel({ model: 'my-model-name' })`,
      );
    }
    return new GenerativeModel(this.apiKey, modelParams, requestOptions);
  }

  /**
   * Creates a {@link GenerativeModel} instance from provided content cache.
   */
  getGenerativeModelFromCachedContent(
    cachedContent: CachedContent,
    modelParams?: Partial<ModelParams>,
    requestOptions?: RequestOptions,
  ): GenerativeModel {
    if (!cachedContent.name) {
      throw new GoogleGenerativeAIRequestInputError(
        "Cached content must contain a `name` field.",
      );
    }
    if (!cachedContent.model) {
      throw new GoogleGenerativeAIRequestInputError(
        "Cached content must contain a `model` field.",
      );
    }

    /**
     * Not checking tools and toolConfig for now as it would require a deep
     * equality comparison and isn't likely to be a common case.
     */
    const disallowedDuplicates: Array<keyof ModelParams & keyof CachedContent> =
      ["model", "systemInstruction"];

    for (const key of disallowedDuplicates) {
      if (
        modelParams?.[key] &&
        cachedContent[key] &&
        modelParams?.[key] !== cachedContent[key]
      ) {
        if (key === "model") {
          const modelParamsComp = modelParams.model.startsWith("models/")
            ? modelParams.model.replace("models/", "")
            : modelParams.model;
          const cachedContentComp = cachedContent.model.startsWith("models/")
            ? cachedContent.model.replace("models/", "")
            : cachedContent.model;
          if (modelParamsComp === cachedContentComp) {
            continue;
          }
        }
        throw new GoogleGenerativeAIRequestInputError(
          `Different value for "${key}" specified in modelParams` +
          ` (${modelParams[key]}) and cachedContent (${cachedContent[key]})`,
        );
      }
    }

    const modelParamsFromCache: ModelParams = {
      ...modelParams,
      model: cachedContent.model,
      tools: cachedContent.tools,
      toolConfig: cachedContent.toolConfig,
      systemInstruction: cachedContent.systemInstruction,
      cachedContent,
    };
    return new GenerativeModel(
      this.apiKey,
      modelParamsFromCache,
      requestOptions,
    );
  }

  /**
   * Lists tuned models.
   * @param pageSize - Optional number of models to list. Default is 5.
   * @returns A promise that resolves to a {@link ListTunedModelsResponse}.
   */
  async listTunedModels(pageSize = 5): Promise<ListTunedModelsResponse> {
    return listTunedModels(this.apiKey, pageSize);
  }

  /**
   * Creates a tuned model with the specified display name and training data.
   * @param displayName - The name to display for the tuned model.
   * @param trainingData - The training dataset.
   * @returns A promise that resolves to a {@link CreateTunedModelResponse}.
   */
  async createTunedModel(
    displayName: string,
    trainingData: unknown
  ): Promise<CreateTunedModelResponse> {
    return createTunedModel(this.apiKey, displayName, trainingData);
  }

  /**
   * Checks the tuning status of a fine-tuning operation.
   * @param operationName - The operation ID to check.
   * @returns A promise that resolves to a {@link CheckTuningStatusResponse}.
   */
  async checkTuningStatus(
    operationName: string
  ): Promise<CheckTuningStatusResponse> {
    return checkTuningStatus(this.apiKey, operationName);
  }

  /**
   * Deletes a tuned model by name.
   * @param modelName - The name of the tuned model to delete.
   * @returns A promise that resolves to a {@link DeleteTunedModelResponse}.
   */
  async deleteTunedModel(
    modelName: string
  ): Promise<DeleteTunedModelResponse> {
    return deleteTunedModel(this.apiKey, modelName);
  }

}
