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

import { RequestOptions } from "../types";
import { readFileSync } from "fs";
import { FilesRequestUrl, getHeaders, makeFilesRequest } from "./request";
import { FileMetadata, FilesTask, ListData } from "./types";

/**
 * Class for managing GoogleAI file uploads.
 * @public
 */
export class GoogleAIFileManager {
  constructor(
    public apiKey: string,
    private _requestOptions: RequestOptions,
  ) {}

  /**
   * Upload a file
   */
  async uploadFile(
    filePath: string,
    metadata: FileMetadata,
  ): Promise<Response> {
    const file = readFileSync(filePath);
    const url = new FilesRequestUrl(
      FilesTask.UPLOAD,
      this.apiKey,
      this._requestOptions,
    );
    const uploadHeaders = getHeaders(url);
    const boundary = genBoundary();
    // uploadHeaders.append("Content-Type", metadata.mimeType);
    uploadHeaders.append("X-Goog-Upload-Protocol", 'multipart');
    uploadHeaders.append("Content-Type", `multipart/related; boundary=${boundary}`);

    const uploadMetadata: Record<string, string> = {};
    if (metadata.displayName) {
      uploadMetadata.displayName = metadata.displayName;
    }
    const metadataString = JSON.stringify(uploadMetadata);


    
    return makeFilesRequest(url, uploadHeaders, file);
  }

  /**
   * List all uploaded files
   */
  async listFiles(listData?: ListData): Promise<Response> {
    const url = new FilesRequestUrl(
      FilesTask.LIST,
      this.apiKey,
      this._requestOptions,
    );
    if (listData?.pageSize) {
      url.appendParam("pageSize", listData.pageSize.toString());
    }
    if (listData?.pageToken) {
      url.appendParam("pageSize", listData.pageToken);
    }
    const uploadHeaders = getHeaders(url);
    return makeFilesRequest(url, uploadHeaders);
  }

  /**
   * Get metadata for file with given ID
   */
  async getFile(fileId: string): Promise<Response> {
    const url = new FilesRequestUrl(
      FilesTask.GET,
      this.apiKey,
      this._requestOptions,
    );
    url.appendPath(parseFileId(fileId));
    const uploadHeaders = getHeaders(url);
    return makeFilesRequest(url, uploadHeaders);
  }

  /**
   * Delete file with given ID
   */
  async deleteFile(fileId: string): Promise<Response> {
    const url = new FilesRequestUrl(
      FilesTask.DELETE,
      this.apiKey,
      this._requestOptions,
    );
    url.appendPath(parseFileId(fileId));
    const uploadHeaders = getHeaders(url);
    return makeFilesRequest(url, uploadHeaders);
  }
}

/**
 * If fileId is prepended with "files/", remove prefix
 */
function parseFileId(fileId: string): string {
  if (fileId.startsWith('files/')) {
    return fileId.split('files/')[1];
  }
  return fileId;
}

function genBoundary(): string {
  let str = '';
  for (let i = 0; i < 2; i++) {
    str = str + Math.random().toString().slice(2);
  }
  return str;
}