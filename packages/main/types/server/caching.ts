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

import { CachedContent, CachedContentBase } from "../cached-content";

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