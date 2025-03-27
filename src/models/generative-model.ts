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
  GenerateAnswerRequest,
  GenerateAnswerResponse,
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
import { ChatSession } from "../methods/chat-session";
import { countTokens } from "../methods/count-tokens";
import { batchEmbedContents, embedContent } from "../methods/embed-content";
import {
  formatCountTokensInput,
  formatEmbedContentInput,
  formatGenerateContentInput,
  formatSystemInstruction,
} from "../requests/request-helpers";
import { Task, makeModelRequest } from "../requests/request";
import { processAqaResponse } from "../requests/response-helpers";
import { GoogleGenerativeAIRequestInputError, GoogleGenerativeAIResponseError } from "../errors";

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
   * Generates an attributed answer based on provided sources and input question.
   * 
   * @public
   * 
   * @param request - The request parameters containing:
   *  - `input`: Required. The question to be answered
   *  - `sources`: Array of attributed sources to reference
   *  - `temperature`: Optional. Controls randomness (0.0-1.0)
   * 
   * @param requestOptions - Optional. Overrides for request configuration
   * 
   * @returns Promise resolving to {@link GenerateAnswerResponse} containing:
   *  - `answer`: The generated answer text
   *  - `attributedPassages`: Array of source passages used
   *  - `confidenceScore`: Model's confidence in the answer (0.0-1.0)
   * 
   * @throws {GoogleGenerativeAIRequestInputError} If invalid request format
   * @throws {GoogleGenerativeAIResponseError} If API returns error
   * 
   * @example
   * ```
   * const model = genAI.getGenerativeModel({ model: 'models/aqa' });
   * const request = {
   *   input: "What's the capital of France?",
   *   sources: [{
   *     title: "World Factbook",
   *     url: "https://example.com/factbook",
   *     content: "Paris is the administrative and cultural center of France."
   *   }]
   * };
   * 
   * try {
   *   const result = await model.generateAnswer(request);
   *   console.log(result.answer); // "Paris"
   *   console.log(result.attributedPassages[0].source.title); // "World Factbook"
   * } catch (err) {
   *   console.error(err);
   * }
   * ```
   */
  async generateAnswer(
    request: GenerateAnswerRequest,
    requestOptions: SingleRequestOptions = {},
  ): Promise<GenerateAnswerResponse> {
    const generativeModelRequestOptions: SingleRequestOptions = {
      ...this._requestOptions,
      ...requestOptions,
    };
    
    if (!request.input) {
      throw new GoogleGenerativeAIRequestInputError(
        "GenerateAnswerRequest must contain 'input' field"
      );
    }

    try {
      const response = await makeModelRequest(
        'models/aqa', // Hardcode AQA model path
        Task.GENERATE_ANSWER,
        this.apiKey,
        false,
        JSON.stringify(request),
        generativeModelRequestOptions
      );
      
      const responseJson = await response.json();
      return processAqaResponse(responseJson);
    } catch (e) {
      if (e instanceof GoogleGenerativeAIResponseError) {
        throw new GoogleGenerativeAIResponseError<GenerateAnswerResponse>(
          `AQA API Error: ${e.message}`,
          e.response
        );
      }
      throw e;
    }
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
}
