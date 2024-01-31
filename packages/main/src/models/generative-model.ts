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

import {
  generateContent,
  generateContentStream,
} from "../methods/generate-content";
import {
  BatchEmbedContentsRequest,
  BatchEmbedContentsResponse,
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
} from "../../types";
import { ChatSession } from "../methods/chat-session";
import { countTokens } from "../methods/count-tokens";
import { batchEmbedContents, embedContent } from "../methods/embed-content";
import {
  formatEmbedContentInput,
  formatGenerateContentInput,
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

  constructor(
    public apiKey: string,
    modelParams: ModelParams,
    requestOptions?: RequestOptions,
  ) {
    if (modelParams.model.startsWith("models/")) {
      this.model = modelParams.model.split("models/")?.[1];
    } else {
      this.model = modelParams.model;
    }
    this.generationConfig = modelParams.generationConfig || {};
    this.safetySettings = modelParams.safetySettings || [];
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
      startChatParams,
      this.requestOptions,
    );
  }

  /**
   * Counts the tokens in the provided request.
   */
  async countTokens(
    request: CountTokensRequest | string | Array<string | Part>,
  ): Promise<CountTokensResponse> {
    const formattedParams = formatGenerateContentInput(request);
    return countTokens(this.apiKey, this.model, formattedParams);
  }

  /**
   * Embeds the provided content.
   */
  async embedContent(
    request: EmbedContentRequest | string | Array<string | Part>,
  ): Promise<EmbedContentResponse> {
    const formattedParams = formatEmbedContentInput(request);
    return embedContent(this.apiKey, this.model, formattedParams);
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
