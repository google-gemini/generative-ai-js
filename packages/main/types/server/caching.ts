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
import { Content, Part } from "../content";
import { Tool, ToolConfig } from "../function-calling";

/**
 * @public
 */
export interface CachedContentBase {
  model?: string;
  contents: Content[];
  tools?: Tool[];
  toolConfig?: ToolConfig;
  systemInstruction?: string | Part | Content;
}

/**
 * Describes CachedContent interface for sending to the server (if creating)
 * or received from the server (using getters or list methods).
 * @public
 */
export interface CachedContent extends CachedContentBase {
  name?: string;
  ttl?: string;
  // ISO string
  createTime?: string;
  // ISO string
  updateTime?: string;
}

/**
 * Params to pass to {@link GoogleAICacheManager.create}
 * @public
 */
export interface CachedContentCreateParams extends CachedContentBase {
  // sent field needs to be protobuf Duration ("3.0001s")
  ttlSeconds?: number;
}

/**
 * Params to pass to {@link GoogleAICacheManager.update}
 * @public
 */
export interface CachedContentUpdateParams {
  cachedContent: CachedContentCreateParams;
  /**
   * protobuf FieldMask
   */
  updateMask: string[];
}

/**
 * @public
 */
export interface ListCacheResponse {
  cachedContents: CachedContent[];
  nextPageToken?: string;
}