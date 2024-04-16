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

/**
 * Params to pass to {@link GoogleAIFileManager.listFiles}
 * @public
 */
export interface ListParams {
  pageSize?: number;
  pageToken?: string;
}

/**
 * Metadata to provide alongside a file upload
 * @public
 */
export interface FileMetadata {
  name?: string;
  displayName?: string;
  mimeType: string;
}

/**
 * File metadata response from server.
 * @public
 */
export interface FileMetadataResponse {
  name: string;
  displayName?: string;
  mimeType: string;
  sizeBytes: string;
  createTime: string;
  updateTime: string;
  expirationTime: string;
  sha256Hash: string;
  uri: string;
}

/**
 * Response from calling {@link GoogleAIFileManager.listFiles}
 * @public
 */
export interface ListFilesResponse {
  files: FileMetadataResponse[];
  nextPageToken?: string;
}

/**
 * Response from calling {@link GoogleAIFileManager.uploadFile}
 * @public
 */
export interface UploadFileResponse {
  file: FileMetadataResponse;
}
