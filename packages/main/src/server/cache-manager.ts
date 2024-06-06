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
  CachedContent,
  Content,
  Part,
  RequestOptions,
  Tool,
  ToolConfig,
} from "../../types";
import {
  CachedContentUrl,
  FilesRequestUrl,
  getHeaders,
  makeServerRequest,
} from "./request";
import {
  CachedContentCreateParams,
  CachedContentUpdateParams,
  ListCacheResponse,
  ListParams,
} from "../../types/server";
import { RpcTask } from "./constants";
import { GoogleGenerativeAIError } from "../errors";

/**
 * Class for managing GoogleAI file uploads.
 * @public
 */
export class GoogleAICacheManager {
  model: string;
  ttl?: string;
  tools?: Tool[];
  toolConfig?: ToolConfig;
  systemInstruction?: string | Part | Content;

  constructor(
    public apiKey: string,
    private _requestOptions: RequestOptions,
  ) {}

  /**
   * Upload a new content cache
   */
  async create(
    createOptions: CachedContentCreateParams,
  ): Promise<CachedContent> {
    const newCachedContent: CachedContent = { ...createOptions };
    if (createOptions.ttlSeconds) {
      newCachedContent.ttl = createOptions.ttlSeconds.toString() + "s";
      delete (newCachedContent as CachedContentCreateParams).ttlSeconds;
    }
    if (!newCachedContent.model.includes("/")) {
      // If path is not included, assume it's a non-tuned model.
      newCachedContent.model = `models/${newCachedContent.model}`;
    }
    const url = new CachedContentUrl(
      RpcTask.UPLOAD,
      this.apiKey,
      this._requestOptions,
    );

    const uploadHeaders = getHeaders(url);

    const response = await makeServerRequest(
      url,
      uploadHeaders,
      JSON.stringify(newCachedContent),
    );
    return response.json();
  }

  /**
   * List all uploaded content caches
   */
  async list(listParams?: ListParams): Promise<ListCacheResponse> {
    const url = new CachedContentUrl(
      RpcTask.LIST,
      this.apiKey,
      this._requestOptions,
    );
    if (listParams?.pageSize) {
      url.appendParam("pageSize", listParams.pageSize.toString());
    }
    if (listParams?.pageToken) {
      url.appendParam("pageToken", listParams.pageToken);
    }
    const uploadHeaders = getHeaders(url);
    const response = await makeServerRequest(url, uploadHeaders);
    return response.json();
  }

  /**
   * Get a content cache
   */
  async get(name: string): Promise<CachedContent> {
    const url = new CachedContentUrl(
      RpcTask.GET,
      this.apiKey,
      this._requestOptions,
    );
    url.appendPath(parseCacheName(name));
    const uploadHeaders = getHeaders(url);
    const response = await makeServerRequest(url, uploadHeaders);
    return response.json();
  }

  /**
   * Update an existing content cache
   */
  async update(
    name: string,
    updateParams: CachedContentUpdateParams,
  ): Promise<CachedContent> {
    const url = new CachedContentUrl(
      RpcTask.UPDATE,
      this.apiKey,
      this._requestOptions,
    );
    url.appendPath(parseCacheName(name));
    const uploadHeaders = getHeaders(url);
    const response = await makeServerRequest(
      url,
      uploadHeaders,
      JSON.stringify(updateParams),
    );
    return response.json();
  }

  /**
   * Delete content cache with given name
   */
  async delete(name: string): Promise<void> {
    const url = new FilesRequestUrl(
      RpcTask.DELETE,
      this.apiKey,
      this._requestOptions,
    );
    url.appendPath(parseCacheName(name));
    const uploadHeaders = getHeaders(url);
    await makeServerRequest(url, uploadHeaders);
  }
}

/**
 * If fileId is prepended with "files/", remove prefix
 */
function parseCacheName(name: string): string {
  if (name.startsWith("cachedContents/")) {
    return name.split("cachedContents/")[1];
  }
  if (!name) {
    throw new GoogleGenerativeAIError(
      `Invalid name ${name}. ` +
        `Must be in the format "cachedContents/name" or "name"`,
    );
  }

  return name;
}
