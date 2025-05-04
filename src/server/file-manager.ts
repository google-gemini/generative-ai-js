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

import { RequestOptions, SingleRequestOptions } from "../../types";
import { FilesRequestUrl, getHeaders, makeServerRequest } from "./request";
import {
  FileMetadata,
  FileMetadataResponse,
  ListFilesResponse,
  ListParams,
  UploadFileResponse,
} from "../../types/server";
import { RpcTask } from "./constants";
import {
  GoogleGenerativeAIError,
  GoogleGenerativeAIRequestInputError,
} from "../errors";

import * as fs from "fs";
let readFileSync: (path: string) => Buffer;
try {
  readFileSync = fs.readFileSync;
} catch (e) {
  // fs module not available in this environment (e.g., serverless)
  readFileSync = (_: string) => {
    throw new GoogleGenerativeAIError(
      "File system operations are not supported in this environment. " +
        "Please use uploadFileFromBuffer or uploadFileFromUrl instead.",
    );
  };
}
// Internal type, metadata sent in the upload
export interface UploadMetadata {
  name?: string;
  ["display_name"]?: string;
}

/**
 * Class for managing GoogleAI file uploads.
 * @public
 */
export class GoogleAIFileManager {
  constructor(
    public apiKey: string,
    private _requestOptions: RequestOptions = {},
  ) {}

  /**
   * Upload a file from a local file path.
   * Note: This method requires the fs module and will not work in serverless environments.
   * For serverless environments, use uploadFileFromBuffer or uploadFileFromUrl instead.
   */
  async uploadFile(
    fileData: string | Buffer,
    fileMetadata: FileMetadata,
  ): Promise<UploadFileResponse> {
    // If fileData is already a Buffer, use it directly
    if (Buffer.isBuffer(fileData)) {
      return this.uploadFileFromBuffer(fileData, fileMetadata);
    }

    // Otherwise, treat it as a file path and try to read it
    try {
      const fileBuffer = readFileSync(fileData);
      return this.uploadFileFromBuffer(fileBuffer, fileMetadata);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("fs") || error.message.includes("file system"))
      ) {
        throw new GoogleGenerativeAIError(
          "File system operations are not supported in this environment. " +
            "Please use uploadFileFromBuffer or uploadFileFromUrl instead.",
        );
      }
      throw error;
    }
  }

  /**
   * Upload a file from a Buffer or ArrayBuffer.
   * This method works in both Node.js and serverless environments.
   */
  async uploadFileFromBuffer(
    fileBuffer: Buffer | ArrayBuffer,
    fileMetadata: FileMetadata,
  ): Promise<UploadFileResponse> {
    const url = new FilesRequestUrl(
      RpcTask.UPLOAD,
      this.apiKey,
      this._requestOptions,
    );

    const uploadHeaders = getHeaders(url);
    const boundary = generateBoundary();
    uploadHeaders.append("X-Goog-Upload-Protocol", "multipart");
    uploadHeaders.append(
      "Content-Type",
      `multipart/related; boundary=${boundary}`,
    );

    const uploadMetadata = getUploadMetadata(fileMetadata);

    // Multipart formatting code taken from @firebase/storage
    const metadataString = JSON.stringify({ file: uploadMetadata });
    const preBlobPart =
      "--" +
      boundary +
      "\r\n" +
      "Content-Type: application/json; charset=utf-8\r\n\r\n" +
      metadataString +
      "\r\n--" +
      boundary +
      "\r\n" +
      "Content-Type: " +
      fileMetadata.mimeType +
      "\r\n\r\n";
    const postBlobPart = "\r\n--" + boundary + "--";

    const blob = new Blob([preBlobPart, fileBuffer, postBlobPart]);

    const response = await makeServerRequest(url, uploadHeaders, blob);
    return response.json();
  }

  /**
   * Upload a file from a public URL.
   * This method works in both Node.js and serverless environments.
   */
  async uploadFileFromUrl(
    fileUrl: string,
    fileMetadata: FileMetadata,
  ): Promise<UploadFileResponse> {
    try {
      // Fetch the file from the provided URL
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new GoogleGenerativeAIError(
          `Failed to fetch file from URL: ${response.status} ${response.statusText}`,
        );
      }

      // Get file as ArrayBuffer
      const fileBuffer = await response.arrayBuffer();

      // Use the buffer upload method
      return this.uploadFileFromBuffer(fileBuffer, fileMetadata);
    } catch (error) {
      throw new GoogleGenerativeAIError(
        `Error uploading file from URL: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * List all uploaded files.
   *
   * Any fields set in the optional {@link SingleRequestOptions} parameter will take
   * precedence over the {@link RequestOptions} values provided at the time of the
   * {@link GoogleAIFileManager} initialization.
   */
  async listFiles(
    listParams?: ListParams,
    requestOptions: SingleRequestOptions = {},
  ): Promise<ListFilesResponse> {
    const filesRequestOptions: SingleRequestOptions = {
      ...this._requestOptions,
      ...requestOptions,
    };
    const url = new FilesRequestUrl(
      RpcTask.LIST,
      this.apiKey,
      filesRequestOptions,
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
   * Get metadata for file with given ID.
   *
   * Any fields set in the optional {@link SingleRequestOptions} parameter will take
   * precedence over the {@link RequestOptions} values provided at the time of the
   * {@link GoogleAIFileManager} initialization.
   */
  async getFile(
    fileId: string,
    requestOptions: SingleRequestOptions = {},
  ): Promise<FileMetadataResponse> {
    const filesRequestOptions: SingleRequestOptions = {
      ...this._requestOptions,
      ...requestOptions,
    };
    const url = new FilesRequestUrl(
      RpcTask.GET,
      this.apiKey,
      filesRequestOptions,
    );
    url.appendPath(parseFileId(fileId));
    const uploadHeaders = getHeaders(url);
    const response = await makeServerRequest(url, uploadHeaders);
    return response.json();
  }

  /**
   * Delete file with given ID.
   */
  async deleteFile(fileId: string): Promise<void> {
    const url = new FilesRequestUrl(
      RpcTask.DELETE,
      this.apiKey,
      this._requestOptions,
    );
    url.appendPath(parseFileId(fileId));
    const uploadHeaders = getHeaders(url);
    await makeServerRequest(url, uploadHeaders);
  }
}

/**
 * If fileId is prepended with "files/", remove prefix
 */
function parseFileId(fileId: string): string {
  if (fileId.startsWith("files/")) {
    return fileId.split("files/")[1];
  }
  if (!fileId) {
    throw new GoogleGenerativeAIError(
      `Invalid fileId ${fileId}. ` +
        `Must be in the format "files/filename" or "filename"`,
    );
  }

  return fileId;
}

function generateBoundary(): string {
  let str = "";
  for (let i = 0; i < 2; i++) {
    str = str + Math.random().toString().slice(2);
  }
  return str;
}

export function getUploadMetadata(inputMetadata: FileMetadata): FileMetadata {
  if (!inputMetadata.mimeType) {
    throw new GoogleGenerativeAIRequestInputError("Must provide a mimeType.");
  }
  const uploadMetadata: FileMetadata = {
    mimeType: inputMetadata.mimeType,
    displayName: inputMetadata.displayName,
  };

  if (inputMetadata.name) {
    uploadMetadata.name = inputMetadata.name.includes("/")
      ? inputMetadata.name
      : `files/${inputMetadata.name}`;
  }
  return uploadMetadata;
}
