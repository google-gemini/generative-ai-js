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
import { BaseParams, Tool } from "../../../core/src";

/**
 * Params passed to {@link GoogleGenerativeAI.getGenerativeModel}.
 * @public
 */
export interface ModelParams extends BaseParams {
  model: string;
  tools?: Tool[];
}

/**
 * Export each type by name so we can selectively wrap and re-export any
 * of them as needed.
 */
export {
  BaseParams,
  GenerationConfig,
  SafetySetting,
  Tool,
  RequestOptions,
  CountTokensRequest,
  EmbedContentRequest,
  BatchEmbedContentsRequest,
  GenerateContentResult,
  GenerateContentStreamResult,
  GenerateContentResponse,
  Part,
  HarmBlockThreshold,
  HarmCategory,
  HarmProbability,
  TaskType,
  FunctionDeclarationsTool,
  EnhancedGenerateContentResponse,
  GenerateContentCandidate,
  PromptFeedback,
  GenerateContentRequest,
  CountTokensResponse,
  EmbedContentResponse,
  BatchEmbedContentsResponse,
  StartChatParams,
  _MakeRequestFunction,
  Content,
  TextPart,
  InlineDataPart,
  FunctionCallPart,
  FunctionResponsePart,
  FunctionDeclaration,
  FunctionCall,
  BlockReason,
  FinishReason,
  SafetyRating,
  CitationMetadata,
  ContentEmbedding,
  Role,
  GenerativeContentBlob,
  FunctionResponse,
  FunctionDeclarationSchema,
  CitationSource,
  FunctionDeclarationSchemaProperty,
  FunctionDeclarationSchemaType,
  _Task,
  POSSIBLE_ROLES,
} from "../../../core/src";
