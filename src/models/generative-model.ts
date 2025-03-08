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
  generateContent,
  generateContentStream,
} from "../methods/generate-content";
import {
  BatchEmbedContentsRequest,
  BatchEmbedContentsResponse,
  CachedContent,
  Content,
  CountTokensRequest,
  CountTokensResponse,
  EmbedContentRequest,
  EmbedContentResponse,
  GenerateContentRequest,
  GenerateContentResult,
  GenerateContentStreamResult,
  GenerationConfig,
  ModelParams,
  Part,
  RequestOptions,
  SafetySetting,
  SingleRequestOptions,
  StartChatParams,
  Tool,
  ToolConfig,
} from "../../types";

// Import fine-tuning related types directly from tune-model
import {
  CreateTunedModelParams,
  CreateTunedModelResponse,
  ListTunedModelsParams,
  ListTunedModelsResponse,
  TunedModelResponse,
  TuningOperationResponse,
} from "../../types/tune-model";

import { ChatSession } from "../methods/chat-session";
import { countTokens } from "../methods/count-tokens";
import { batchEmbedContents, embedContent } from "../methods/embed-content";
import {
  createTunedModel,
  deleteTunedModel,
  getTunedModel,
  getTuningOperation,
  listTunedModels,
} from "../methods/finetune";
import {
  formatCountTokensInput,
  formatEmbedContentInput,
  formatGenerateContentInput,
  formatSystemInstruction,
} from "../requests/request-helpers";

/**
 * Class for generative model APIs.
 * @public
 */
export class GenerativeModel {
  model: string;
  generationConfig: GenerationConfig;
  safetySettings: SafetySetting[];
  tools?: Tool[];
  toolConfig?: ToolConfig;
  systemInstruction?: Content;
  cachedContent: CachedContent;

  constructor(
    public apiKey: string,
    modelParams: ModelParams,
    private _requestOptions: RequestOptions = {},
  ) {
    if (modelParams.model.includes("/")) {
      // Models may be named "models/model-name" or "tunedModels/model-name"
      this.model = modelParams.model;
    } else {
      // If path is not included, assume it's a non-tuned model.
      this.model = `models/${modelParams.model}`;
    }
    this.generationConfig = modelParams.generationConfig || {};
    this.safetySettings = modelParams.safetySettings || [];
    this.tools = modelParams.tools;
    this.toolConfig = modelParams.toolConfig;
    this.systemInstruction = formatSystemInstruction(
      modelParams.systemInstruction,
    );
    this.cachedContent = modelParams.cachedContent;
  }

  /**
   * Makes a single non-streaming call to the model
   * and returns an object containing a single {@link GenerateContentResponse}.
   *
   * Fields set in the optional {@link SingleRequestOptions} parameter will
   * take precedence over the {@link RequestOptions} values provided to
   * {@link GoogleGenerativeAI.getGenerativeModel }.
   */
  async generateContent(
    request: GenerateContentRequest | string | Array<string | Part>,
    requestOptions: SingleRequestOptions = {},
  ): Promise<GenerateContentResult> {
    const formattedParams = formatGenerateContentInput(request);
    const generativeModelRequestOptions: SingleRequestOptions = {
      ...this._requestOptions,
      ...requestOptions,
    };
    return generateContent(
      this.apiKey,
      this.model,
      {
        generationConfig: this.generationConfig,
        safetySettings: this.safetySettings,
        tools: this.tools,
        toolConfig: this.toolConfig,
        systemInstruction: this.systemInstruction,
        cachedContent: this.cachedContent?.name,
        ...formattedParams,
      },
      generativeModelRequestOptions,
    );
  }

  /**
   * Makes a single streaming call to the model and returns an object
   * containing an iterable stream that iterates over all chunks in the
   * streaming response as well as a promise that returns the final
   * aggregated response.
   *
   * Fields set in the optional {@link SingleRequestOptions} parameter will
   * take precedence over the {@link RequestOptions} values provided to
   * {@link GoogleGenerativeAI.getGenerativeModel }.
   */
  async generateContentStream(
    request: GenerateContentRequest | string | Array<string | Part>,
    requestOptions: SingleRequestOptions = {},
  ): Promise<GenerateContentStreamResult> {
    const formattedParams = formatGenerateContentInput(request);
    const generativeModelRequestOptions: SingleRequestOptions = {
      ...this._requestOptions,
      ...requestOptions,
    };
    return generateContentStream(
      this.apiKey,
      this.model,
      {
        generationConfig: this.generationConfig,
        safetySettings: this.safetySettings,
        tools: this.tools,
        toolConfig: this.toolConfig,
        systemInstruction: this.systemInstruction,
        cachedContent: this.cachedContent?.name,
        ...formattedParams,
      },
      generativeModelRequestOptions,
    );
  }

  /**
   * Gets a new {@link ChatSession} instance which can be used for
   * multi-turn chats.
   */
  startChat(startChatParams?: StartChatParams): ChatSession {
    return new ChatSession(
      this.apiKey,
      this.model,
      {
        generationConfig: this.generationConfig,
        safetySettings: this.safetySettings,
        tools: this.tools,
        toolConfig: this.toolConfig,
        systemInstruction: this.systemInstruction,
        cachedContent: this.cachedContent?.name,
        ...startChatParams,
      },
      this._requestOptions,
    );
  }

  /**
   * Counts the tokens in the provided request.
   *
   * Fields set in the optional {@link SingleRequestOptions} parameter will
   * take precedence over the {@link RequestOptions} values provided to
   * {@link GoogleGenerativeAI.getGenerativeModel }.
   */
  async countTokens(
    request: CountTokensRequest | string | Array<string | Part>,
    requestOptions: SingleRequestOptions = {},
  ): Promise<CountTokensResponse> {
    const formattedParams = formatCountTokensInput(request, {
      model: this.model,
      generationConfig: this.generationConfig,
      safetySettings: this.safetySettings,
      tools: this.tools,
      toolConfig: this.toolConfig,
      systemInstruction: this.systemInstruction,
      cachedContent: this.cachedContent,
    });
    const generativeModelRequestOptions: SingleRequestOptions = {
      ...this._requestOptions,
      ...requestOptions,
    };
    return countTokens(
      this.apiKey,
      this.model,
      formattedParams,
      generativeModelRequestOptions,
    );
  }

  /**
   * Embeds the provided content.
   *
   * Fields set in the optional {@link SingleRequestOptions} parameter will
   * take precedence over the {@link RequestOptions} values provided to
   * {@link GoogleGenerativeAI.getGenerativeModel }.
   */
  async embedContent(
    request: EmbedContentRequest | string | Array<string | Part>,
    requestOptions: SingleRequestOptions = {},
  ): Promise<EmbedContentResponse> {
    const formattedParams = formatEmbedContentInput(request);
    const generativeModelRequestOptions: SingleRequestOptions = {
      ...this._requestOptions,
      ...requestOptions,
    };
    return embedContent(
      this.apiKey,
      this.model,
      formattedParams,
      generativeModelRequestOptions,
    );
  }

  /**
   * Embeds an array of {@link EmbedContentRequest}s.
   *
   * Fields set in the optional {@link SingleRequestOptions} parameter will
   * take precedence over the {@link RequestOptions} values provided to
   * {@link GoogleGenerativeAI.getGenerativeModel }.
   */
  async batchEmbedContents(
    batchEmbedContentRequest: BatchEmbedContentsRequest,
    requestOptions: SingleRequestOptions = {},
  ): Promise<BatchEmbedContentsResponse> {
    const generativeModelRequestOptions: SingleRequestOptions = {
      ...this._requestOptions,
      ...requestOptions,
    };
    return batchEmbedContents(
      this.apiKey,
      this.model,
      batchEmbedContentRequest,
      generativeModelRequestOptions,
    );
  }

  /**
   * Lists all tuned models.
   *
   * Fields set in the optional {@link SingleRequestOptions} parameter will
   * take precedence over the {@link RequestOptions} values provided to
   * {@link GoogleGenerativeAI.getGenerativeModel }.
   *
   * @param listParams - Optional parameters for filtering and pagination
   * @param requestOptions - Optional request configuration
   * @returns A promise that resolves to the list of tuned models
   */
  async listTunedModels(
    listParams?: ListTunedModelsParams,
    requestOptions: SingleRequestOptions = {},
  ): Promise<ListTunedModelsResponse> {
    const generativeModelRequestOptions: SingleRequestOptions = {
      ...this._requestOptions,
      ...requestOptions,
    };
    return listTunedModels(
      this.apiKey,
      listParams,
      generativeModelRequestOptions,
    );
  }

  /**
   * Gets details for a tuned model.
   *
   * Fields set in the optional {@link SingleRequestOptions} parameter will
   * take precedence over the {@link RequestOptions} values provided to
   * {@link GoogleGenerativeAI.getGenerativeModel }.
   *
   * @param modelName - Name of the tuned model to retrieve
   * @param requestOptions - Optional request configuration
   * @returns A promise that resolves to the tuned model details
   */
  async getTunedModel(
    modelName: string,
    requestOptions: SingleRequestOptions = {},
  ): Promise<TunedModelResponse> {
    const generativeModelRequestOptions: SingleRequestOptions = {
      ...this._requestOptions,
      ...requestOptions,
    };
    return getTunedModel(this.apiKey, modelName, generativeModelRequestOptions);
  }

  /**
   * Creates a new tuned model.
   *
   * Fields set in the optional {@link SingleRequestOptions} parameter will
   * take precedence over the {@link RequestOptions} values provided to
   * {@link GoogleGenerativeAI.getGenerativeModel }.
   *
   * @param params - Parameters for the tuned model creation
   * @param requestOptions - Optional request configuration
   * @returns A promise that resolves to the tuned model creation operation
   */
  async createTunedModel(
    params: CreateTunedModelParams,
    requestOptions: SingleRequestOptions = {},
  ): Promise<CreateTunedModelResponse> {
    const generativeModelRequestOptions: SingleRequestOptions = {
      ...this._requestOptions,
      ...requestOptions,
    };
    return createTunedModel(this.apiKey, params, generativeModelRequestOptions);
  }

  /**
   * Deletes a tuned model.
   *
   * Fields set in the optional {@link SingleRequestOptions} parameter will
   * take precedence over the {@link RequestOptions} values provided to
   * {@link GoogleGenerativeAI.getGenerativeModel }.
   *
   * @param modelName - Name of the tuned model to delete
   * @param requestOptions - Optional request configuration
   * @returns A promise that resolves when the deletion is complete
   */
  async deleteTunedModel(
    modelName: string,
    requestOptions: SingleRequestOptions = {},
  ): Promise<void> {
    const generativeModelRequestOptions: SingleRequestOptions = {
      ...this._requestOptions,
      ...requestOptions,
    };
    return deleteTunedModel(
      this.apiKey,
      modelName,
      generativeModelRequestOptions,
    );
  }

  /**
   * Gets the status of a tuning operation.
   *
   * Fields set in the optional {@link SingleRequestOptions} parameter will
   * take precedence over the {@link RequestOptions} values provided to
   * {@link GoogleGenerativeAI.getGenerativeModel }.
   *
   * @param operationName - Name of the operation to check
   * @param requestOptions - Optional request configuration
   * @returns A promise that resolves to the operation status
   */
  async getTuningOperation(
    operationName: string,
    requestOptions: SingleRequestOptions = {},
  ): Promise<TuningOperationResponse> {
    const generativeModelRequestOptions: SingleRequestOptions = {
      ...this._requestOptions,
      ...requestOptions,
    };
    return getTuningOperation(
      this.apiKey,
      operationName,
      generativeModelRequestOptions,
    );
  }
}
