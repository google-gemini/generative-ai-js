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

/**
 * Class for generative model APIs.
 * @public
 */
export class GenerativeModel {
  model: string;
  generationConfig: GenerationConfig;
  safetySettings: SafetySetting[];
  requestOptions: RequestOptions;
  tools?: Tool[];
  toolConfig?: ToolConfig;
  systemInstruction?: Content;
  cachedContent: CachedContent;

  constructor(
    public apiKey: string,
    modelParams: ModelParams,
    requestOptions?: RequestOptions,
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
    this.requestOptions = requestOptions || {};
  }

  /**
   * Makes a single non-streaming call to the model
   * and returns an object containing a single {@link GenerateContentResponse}.
   */
  async generateContent(
    request: GenerateContentRequest | string | Array<string | Part>,
  ): Promise<GenerateContentResult> {
    const formattedParams = formatGenerateContentInput(request);
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
      this.requestOptions,
    );
  }

  /**
   * Makes a single streaming call to the model
   * and returns an object containing an iterable stream that iterates
   * over all chunks in the streaming response as well as
   * a promise that returns the final aggregated response.
   */
  async generateContentStream(
    request: GenerateContentRequest | string | Array<string | Part>,
  ): Promise<GenerateContentStreamResult> {
    const formattedParams = formatGenerateContentInput(request);
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
      this.requestOptions,
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
      this.requestOptions,
    );
  }

  /**
   * Counts the tokens in the provided request.
   */
  async countTokens(
    request: CountTokensRequest | string | Array<string | Part>,
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
    return countTokens(
      this.apiKey,
      this.model,
      formattedParams,
      this.requestOptions,
    );
  }

  /**
   * Embeds the provided content.
   */
  async embedContent(
    request: EmbedContentRequest | string | Array<string | Part>,
  ): Promise<EmbedContentResponse> {
    const formattedParams = formatEmbedContentInput(request);
    return embedContent(
      this.apiKey,
      this.model,
      formattedParams,
      this.requestOptions,
    );
  }

  /**
   * Embeds an array of {@link EmbedContentRequest}s.
   */
  async batchEmbedContents(
    batchEmbedContentRequest: BatchEmbedContentsRequest,
  ): Promise<BatchEmbedContentsResponse> {
    return batchEmbedContents(
      this.apiKey,
      this.model,
      batchEmbedContentRequest,
      this.requestOptions,
    );
  }
}
