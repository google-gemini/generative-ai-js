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
import { expect, use } from "chai";
import { GoogleAIFileManager, getUploadMetadata } from "./file-manager";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { restore, stub } from "sinon";
import * as request from "./request";
import { RpcTask } from "./constants";
import { DEFAULT_API_VERSION } from "../requests/request";
import {
  FileMetadata,
  FileMetadataResponse,
  FileState,
  UploadFileResponse,
} from "../../types/server";
import { readFile } from "fs/promises";

use(sinonChai);
use(chaiAsPromised);

const FAKE_URI = "https://yourfile.here/filename";
const fakeUploadJson: () => Promise<{}> = () =>
  Promise.resolve({ file: { uri: FAKE_URI } });

describe("GoogleAIFileManager", () => {
  afterEach(() => {
    restore();
  });

  it("stores api key", () => {
    const fileManager = new GoogleAIFileManager("apiKey");
    expect(fileManager.apiKey).to.equal("apiKey");
  });
  it("passes uploadFile request info", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: fakeUploadJson,
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey");
    const result = await fileManager.uploadFile("./test-utils/cat.png", {
      mimeType: "image/png",
    });
    expect(result.file.uri).to.equal(FAKE_URI);
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.UPLOAD);
    expect(makeRequestStub.args[0][0].toString()).to.include("/upload/");
    expect(makeRequestStub.args[0][1]).to.be.instanceOf(Headers);
    expect(makeRequestStub.args[0][1].get("X-Goog-Upload-Protocol")).to.equal(
      "multipart",
    );
    expect(makeRequestStub.args[0][2]).to.be.instanceOf(Blob);
    const bodyBlob = makeRequestStub.args[0][2];
    const blobText = await (bodyBlob as Blob).text();
    expect(blobText).to.include("Content-Type: image/png");
  });
  it("passes uploadFile request info reading from buffer", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: fakeUploadJson,
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey");
    const fileBuffer = await readFile("./test-utils/cat.png");
    const result = await fileManager.uploadFile(fileBuffer, {
      mimeType: "image/png",
    });
    expect(result.file.uri).to.equal(FAKE_URI);
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.UPLOAD);
    expect(makeRequestStub.args[0][0].toString()).to.include("/upload/");
    expect(makeRequestStub.args[0][1]).to.be.instanceOf(Headers);
    expect(makeRequestStub.args[0][1].get("X-Goog-Upload-Protocol")).to.equal(
      "multipart",
    );
    expect(makeRequestStub.args[0][2]).to.be.instanceOf(Blob);
    const bodyBlob = makeRequestStub.args[0][2];
    const blobText = await (bodyBlob as Blob).text();
    expect(blobText).to.include("Content-Type: image/png");
  });
  it("passes uploadFile request info and metadata", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: fakeUploadJson,
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey");
    const result = await fileManager.uploadFile("./test-utils/cat.png", {
      mimeType: "image/png",
      name: "files/customname",
      displayName: "mydisplayname",
    });
    expect(result.file.uri).to.equal(FAKE_URI);
    expect(makeRequestStub.args[0][2]).to.be.instanceOf(Blob);
    const bodyBlob = makeRequestStub.args[0][2];
    const blobText = await (bodyBlob as Blob).text();
    expect(blobText).to.include("Content-Type: image/png");
    expect(blobText).to.include("files/customname");
    expect(blobText).to.include("mydisplayname");
  });
  it("passes uploadFile request info and metadata from buffer", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: fakeUploadJson,
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey");
    const fileBuffer = await readFile("./test-utils/cat.png");
    const result = await fileManager.uploadFile(fileBuffer, {
      mimeType: "image/png",
      name: "files/customname",
      displayName: "mydisplayname",
    });
    expect(result.file.uri).to.equal(FAKE_URI);
    expect(makeRequestStub.args[0][2]).to.be.instanceOf(Blob);
    const bodyBlob = makeRequestStub.args[0][2];
    const blobText = await (bodyBlob as Blob).text();
    expect(blobText).to.include("Content-Type: image/png");
    expect(blobText).to.include("files/customname");
    expect(blobText).to.include("mydisplayname");
  });
  it("passes uploadFile metadata and formats file name", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: fakeUploadJson,
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey");
    await fileManager.uploadFile("./test-utils/cat.png", {
      mimeType: "image/png",
      name: "customname",
      displayName: "mydisplayname",
    });
    const bodyBlob = makeRequestStub.args[0][2];
    const blobText = await (bodyBlob as Blob).text();
    expect(blobText).to.include("files/customname");
  });
  it("passes uploadFile metadata and formats file name from buffer", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: fakeUploadJson,
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey");
    const fileBuffer = await readFile("./test-utils/cat.png");
    await fileManager.uploadFile(fileBuffer, {
      mimeType: "image/png",
      name: "customname",
      displayName: "mydisplayname",
    });
    const bodyBlob = makeRequestStub.args[0][2];
    const blobText = await (bodyBlob as Blob).text();
    expect(blobText).to.include("files/customname");
  });
  it("passes uploadFile request info (with options)", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: fakeUploadJson,
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey", {
      apiVersion: "v3000",
      baseUrl: "http://mysite.com",
    });
    const result = await fileManager.uploadFile("./test-utils/cat.png", {
      mimeType: "image/png",
    });
    expect(result.file.uri).to.equal(FAKE_URI);
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.UPLOAD);
    expect(makeRequestStub.args[0][0].toString()).to.include("/upload/");
    expect(makeRequestStub.args[0][1]).to.be.instanceOf(Headers);
    expect(makeRequestStub.args[0][1].get("X-Goog-Upload-Protocol")).to.equal(
      "multipart",
    );
    expect(makeRequestStub.args[0][2]).to.be.instanceOf(Blob);
    const bodyBlob = makeRequestStub.args[0][2];
    const blobText = await (bodyBlob as Blob).text();
    expect(blobText).to.include("Content-Type: image/png");
    expect(makeRequestStub.args[0][0].toString()).to.include("v3000/files");
    expect(makeRequestStub.args[0][0].toString()).to.match(
      /^http:\/\/mysite\.com/,
    );
  });
  it("passes uploadFile request info (with options) from buffer", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: fakeUploadJson,
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey", {
      apiVersion: "v3000",
      baseUrl: "http://mysite.com",
    });
    const fileBuffer = await readFile("./test-utils/cat.png");
    const result = await fileManager.uploadFile(fileBuffer, {
      mimeType: "image/png",
    });
    expect(result.file.uri).to.equal(FAKE_URI);
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.UPLOAD);
    expect(makeRequestStub.args[0][0].toString()).to.include("/upload/");
    expect(makeRequestStub.args[0][1]).to.be.instanceOf(Headers);
    expect(makeRequestStub.args[0][1].get("X-Goog-Upload-Protocol")).to.equal(
      "multipart",
    );
    expect(makeRequestStub.args[0][2]).to.be.instanceOf(Blob);
    const bodyBlob = makeRequestStub.args[0][2];
    const blobText = await (bodyBlob as Blob).text();
    expect(blobText).to.include("Content-Type: image/png");
    expect(makeRequestStub.args[0][0].toString()).to.include("v3000/files");
    expect(makeRequestStub.args[0][0].toString()).to.match(
      /^http:\/\/mysite\.com/,
    );
  });
  it("passes listFiles request info", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: () => Promise.resolve({ files: [{ uri: FAKE_URI }] }),
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey");
    const result = await fileManager.listFiles();
    expect(result.files[0].uri).to.equal(FAKE_URI);
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.LIST);
    expect(makeRequestStub.args[0][0].toString()).to.match(/\/files$/);
  });
  it("passes listFiles request info with params", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: () => Promise.resolve({ files: [{ uri: FAKE_URI }] }),
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey");
    const result = await fileManager.listFiles({
      pageSize: 3,
      pageToken: "abc",
    });
    expect(result.files[0].uri).to.equal(FAKE_URI);
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.LIST);
    expect(makeRequestStub.args[0][0].toString()).to.include("pageSize=3");
    expect(makeRequestStub.args[0][0].toString()).to.include("pageToken=abc");
  });
  it("passes listFiles request info with options", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: () => Promise.resolve({ files: [{ uri: FAKE_URI }] }),
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey", {
      apiVersion: "v3000",
      baseUrl: "http://mysite.com",
    });
    const result = await fileManager.listFiles();
    expect(result.files[0].uri).to.equal(FAKE_URI);
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.LIST);
    expect(makeRequestStub.args[0][0].toString()).to.match(/\/files$/);
    expect(makeRequestStub.args[0][0].toString()).to.include("v3000/files");
    expect(makeRequestStub.args[0][0].toString()).to.match(
      /^http:\/\/mysite\.com/,
    );
  });
  it("passes getFile request info", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: () => Promise.resolve({ uri: FAKE_URI }),
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey");
    const result = await fileManager.getFile("nameoffile");
    expect(result.uri).to.equal(FAKE_URI);
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.GET);
    expect(makeRequestStub.args[0][0].toString()).to.include(
      `${DEFAULT_API_VERSION}/files/nameoffile`,
    );
  });
  it("passes getFile request info", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: () => Promise.resolve({ uri: FAKE_URI }),
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey");
    await fileManager.getFile("files/nameoffile");
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.GET);
    expect(makeRequestStub.args[0][0].toString()).to.include(
      `${DEFAULT_API_VERSION}/files/nameoffile`,
    );
  });
  it("passes getFile request info (with options)", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: () => Promise.resolve({ uri: FAKE_URI }),
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey", {
      apiVersion: "v3000",
      baseUrl: "http://mysite.com",
    });
    const result = await fileManager.getFile("nameoffile");
    expect(result.uri).to.equal(FAKE_URI);
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.GET);
    expect(makeRequestStub.args[0][0].toString()).to.include("/nameoffile");
    expect(makeRequestStub.args[0][0].toString()).to.include("v3000/files");
    expect(makeRequestStub.args[0][0].toString()).to.match(
      /^http:\/\/mysite\.com/,
    );
  });
  it("getFile throws on bad fileId", async () => {
    stub(request, "makeServerRequest").resolves({
      ok: true,
      json: () => Promise.resolve({ uri: FAKE_URI }),
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey");
    await expect(fileManager.getFile("")).to.be.rejectedWith("Invalid fileId");
  });
  it("passes deleteFile request info", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey");
    await fileManager.deleteFile("nameoffile");
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.DELETE);
    expect(makeRequestStub.args[0][0].toString()).to.include("/nameoffile");
  });
  it("passes deleteFile request info (with options)", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey", {
      apiVersion: "v3000",
      baseUrl: "http://mysite.com",
    });
    await fileManager.deleteFile("nameoffile");
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.DELETE);
    expect(makeRequestStub.args[0][0].toString()).to.include("/nameoffile");
    expect(makeRequestStub.args[0][0].toString()).to.include("v3000/files");
    expect(makeRequestStub.args[0][0].toString()).to.match(
      /^http:\/\/mysite\.com/,
    );
  });
  it("deleteFile throws on bad fileId", async () => {
    stub(request, "makeServerRequest").resolves({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey");
    await expect(fileManager.deleteFile("")).to.be.rejectedWith(
      "Invalid fileId",
    );
  });

  describe("getUploadMetadata", () => {
    it("getUploadMetadata with only mimeType", () => {
      const uploadMetadata = getUploadMetadata({ mimeType: "image/jpeg" });
      expect(uploadMetadata.mimeType).to.equal("image/jpeg");
      expect(uploadMetadata.displayName).be.undefined;
      expect(uploadMetadata.name).be.undefined;
    });
    it("getUploadMetadata with no mimeType", () => {
      expect(() => getUploadMetadata({} as FileMetadata)).to.throw(
        "Must provide a mimeType.",
      );
    });
    it("getUploadMetadata with all fields defined", () => {
      const uploadMetadata = getUploadMetadata({
        mimeType: "image/jpeg",
        displayName: "display name",
        name: "filename",
      });
      expect(uploadMetadata.mimeType).to.equal("image/jpeg");
      expect(uploadMetadata.displayName).to.equal("display name");
      expect(uploadMetadata.name).to.equal("files/filename");
    });
    it("getUploadMetadata with full file path", () => {
      const uploadMetadata = getUploadMetadata({
        mimeType: "image/jpeg",
        displayName: "display name",
        name: "custom/path/filename",
      });
      expect(uploadMetadata.mimeType).to.equal("image/jpeg");
      expect(uploadMetadata.displayName).to.equal("display name");
      expect(uploadMetadata.name).to.equal("custom/path/filename");
    });
  });
});
describe("GoogleAIFileManager Serverless Support", (): void => {
  // Sample response data
  const FAKE_URI = "files/abcdef123456";
  const fakeUploadJson = (): object => ({
    file: {
      name: "files/abc123",
      uri: FAKE_URI,
      mimeType: "image/png",
    },
  });

  afterEach((): void => {
    restore();
  });

  it("uploadFileFromBuffer handles ArrayBuffer input", async (): Promise<void> => {
    // Create a proper Response object with all required properties
    const mockResponse = {
      ok: true,
      json: fakeUploadJson,
      // Add the missing Response properties
      headers: new Headers(),
      redirected: false,
      status: 200,
      statusText: "OK",
      type: "basic" as ResponseType,
      url: "",
      body: null,
      bodyUsed: false,
      clone() {
        return mockResponse as unknown as Response;
      },
      arrayBuffer: async (): Promise<ArrayBuffer> => new ArrayBuffer(0),
      blob: async (): Promise<Blob> => new Blob(),
      formData: async (): Promise<FormData> => new FormData(),
      text: async (): Promise<string> => "",
    } as unknown as Response;

    const makeRequestStub = stub(request, "makeServerRequest").resolves(
      mockResponse,
    );

    const fileManager = new GoogleAIFileManager("apiKey");

    // Create sample ArrayBuffer
    const buffer = new ArrayBuffer(8);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < 8; i++) {
      view[i] = i;
    }

    const result = await fileManager.uploadFileFromBuffer(buffer, {
      mimeType: "application/octet-stream",
      displayName: "test-arraybuffer",
    });

    expect(result.file.uri).to.equal(FAKE_URI);
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.UPLOAD);
    expect(makeRequestStub.args[0][0].toString()).to.include("/upload/");
    expect(makeRequestStub.args[0][1]).to.be.instanceOf(Headers);
    expect(makeRequestStub.args[0][1].get("X-Goog-Upload-Protocol")).to.equal(
      "multipart",
    );

    const bodyBlob = makeRequestStub.args[0][2];
    const blobText = await (bodyBlob as Blob).text();
    expect(blobText).to.include("Content-Type: application/octet-stream");
    expect(blobText).to.include("test-arraybuffer");
  });

  it("uploadFileFromBuffer handles Buffer input", async (): Promise<void> => {
    const mockResponse = {
      ok: true,
      json: fakeUploadJson,
      headers: new Headers(),
      redirected: false,
      status: 200,
      statusText: "OK",
      type: "basic" as ResponseType,
      url: "",
      body: null,
      bodyUsed: false,
      clone() {
        return mockResponse as unknown as Response;
      },
      arrayBuffer: async (): Promise<ArrayBuffer> => new ArrayBuffer(0),
      blob: async (): Promise<Blob> => new Blob(),
      formData: async (): Promise<FormData> => new FormData(),
      text: async (): Promise<string> => "",
    } as unknown as Response;

    const makeRequestStub = stub(request, "makeServerRequest").resolves(
      mockResponse,
    );

    const fileManager = new GoogleAIFileManager("apiKey");
    const fileBuffer = await readFile("./test-utils/cat.png");

    const result = await fileManager.uploadFileFromBuffer(fileBuffer, {
      mimeType: "image/png",
      displayName: "test-buffer",
    });

    expect(result.file.uri).to.equal(FAKE_URI);
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.UPLOAD);
    expect(makeRequestStub.args[0][1].get("X-Goog-Upload-Protocol")).to.equal(
      "multipart",
    );

    const bodyBlob = makeRequestStub.args[0][2];
    const blobText = await (bodyBlob as Blob).text();
    expect(blobText).to.include("Content-Type: image/png");
    expect(blobText).to.include("test-buffer");
  });

  it("uploadFileFromBuffer supports metadata", async (): Promise<void> => {
    const mockResponse = {
      ok: true,
      json: fakeUploadJson,
      headers: new Headers(),
      redirected: false,
      status: 200,
      statusText: "OK",
      type: "basic" as ResponseType,
      url: "",
      body: null,
      bodyUsed: false,
      clone() {
        return mockResponse as unknown as Response;
      },
      arrayBuffer: async (): Promise<ArrayBuffer> => new ArrayBuffer(0),
      blob: async (): Promise<Blob> => new Blob(),
      formData: async (): Promise<FormData> => new FormData(),
      text: async (): Promise<string> => "",
    } as unknown as Response;

    const makeRequestStub = stub(request, "makeServerRequest").resolves(
      mockResponse,
    );

    const fileManager = new GoogleAIFileManager("apiKey");
    const fileBuffer = await readFile("./test-utils/cat.png");

    const result = await fileManager.uploadFileFromBuffer(fileBuffer, {
      mimeType: "image/png",
      name: "files/buffer-test",
      displayName: "buffer-test-display-name",
    });

    expect(result.file.uri).to.equal(FAKE_URI);

    const bodyBlob = makeRequestStub.args[0][2];
    const blobText = await (bodyBlob as Blob).text();
    expect(blobText).to.include("Content-Type: image/png");
    expect(blobText).to.include("files/buffer-test");
    expect(blobText).to.include("buffer-test-display-name");
  });

  it("uploadFileFromUrl fetches and uploads from URL", async (): Promise<void> => {
    const originalFetch = global.fetch;
    const mockImageBuffer = await readFile("./test-utils/cat.png");

    const mockFetchResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      arrayBuffer: async (): Promise<ArrayBuffer> => mockImageBuffer.buffer,
      headers: new Headers(),
      redirected: false,
      type: "basic" as ResponseType,
      url: "",
      body: null as ReadableStream<Uint8Array> | null,
      bodyUsed: false,
      clone() {
        return this as unknown as Response;
      },
      blob: async (): Promise<Blob> => new Blob(),
      formData: async (): Promise<FormData> => new FormData(),
      json: async (): Promise<{}> => ({}),
      text: async (): Promise<string> => "",
    };

    global.fetch = stub().resolves(mockFetchResponse as unknown as Response);

    const mockUploadResponse = {
      ok: true,
      json: fakeUploadJson,
      headers: new Headers(),
      redirected: false,
      status: 200,
      statusText: "OK",
      type: "basic" as ResponseType,
      url: "",
      body: null,
      bodyUsed: false,
      clone() {
        return mockUploadResponse as unknown as Response;
      },
      arrayBuffer: async (): Promise<ArrayBuffer> => new ArrayBuffer(0),
      blob: async (): Promise<Blob> => new Blob(),
      formData: async (): Promise<FormData> => new FormData(),
      text: async (): Promise<string> => "",
    } as unknown as Response;

    const makeRequestStub = stub(request, "makeServerRequest").resolves(
      mockUploadResponse,
    );

    const fileManager = new GoogleAIFileManager("apiKey");
    const testUrl = "https://example.com/test-image.png";

    const result = await fileManager.uploadFileFromUrl(testUrl, {
      mimeType: "image/png",
      displayName: "url-test",
    });

    expect(result.file.uri).to.equal(FAKE_URI);
    expect(global.fetch).to.have.been.calledWith(testUrl);
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.UPLOAD);
    expect(makeRequestStub.args[0][1].get("X-Goog-Upload-Protocol")).to.equal(
      "multipart",
    );

    const bodyBlob = makeRequestStub.args[0][2];
    const blobText = await (bodyBlob as Blob).text();
    expect(blobText).to.include("Content-Type: image/png");
    expect(blobText).to.include("url-test");

    global.fetch = originalFetch;
  });

  it("uploadFileFromUrl throws error on failed fetch", async (): Promise<void> => {
    const originalFetch = global.fetch;
    const mockErrorResponse = {
      ok: false,
      status: 404,
      statusText: "Not Found",
      headers: new Headers(),
      redirected: false,
      type: "error" as ResponseType,
      url: "",
      body: null as ReadableStream<Uint8Array> | null,
      bodyUsed: false,
      clone() {
        return this as unknown as Response;
      },
      arrayBuffer: async (): Promise<ArrayBuffer> => {
        throw new Error("Cannot read");
      },
      blob: async (): Promise<Blob> => {
        throw new Error("Cannot read");
      },
      formData: async (): Promise<FormData> => {
        throw new Error("Cannot read");
      },
      json: async (): Promise<{}> => {
        throw new Error("Cannot read");
      },
      text: async (): Promise<string> => {
        throw new Error("Cannot read");
      },
    };

    global.fetch = stub().resolves(mockErrorResponse as unknown as Response);

    const fileManager = new GoogleAIFileManager("apiKey");
    const testUrl = "https://example.com/nonexistent-image.png";

    let errorThrown = false;
    try {
      await fileManager.uploadFileFromUrl(testUrl, {
        mimeType: "image/png",
      });
    } catch (error: any) {
      errorThrown = true;
      expect(error.message).to.include(
        "Failed to fetch file from URL: 404 Not Found",
      );
    }

    expect(errorThrown).to.be.true;
    expect(global.fetch).to.have.been.calledWith(testUrl);

    global.fetch = originalFetch;
  });

  it("uploadFileFromUrl throws error when fetch rejects", async (): Promise<void> => {
    const originalFetch = global.fetch;
    global.fetch = stub().rejects(new Error("Network error"));

    const fileManager = new GoogleAIFileManager("apiKey");
    const testUrl = "https://example.com/test-image.png";

    let errorThrown = false;
    try {
      await fileManager.uploadFileFromUrl(testUrl, {
        mimeType: "image/png",
      });
    } catch (error: any) {
      errorThrown = true;
      expect(error.message).to.include(
        "Error uploading file from URL: Network error",
      );
    }

    expect(errorThrown).to.be.true;
    expect(global.fetch).to.have.been.calledWith(testUrl);

    global.fetch = originalFetch;
  });
  it("uploadFileFromUrl throws error when fetch rejects", async (): Promise<void> => {
    // Mock the fetch API to reject
    const originalFetch = global.fetch;
    global.fetch = stub().rejects(new Error("Network error"));

    const fileManager = new GoogleAIFileManager("apiKey");
    const testUrl = "https://example.com/test-image.png";

    let errorThrown = false;
    try {
      await fileManager.uploadFileFromUrl(testUrl, {
        mimeType: "image/png",
      });
    } catch (error: any) {
      errorThrown = true;
      expect(error.message).to.include(
        "Error uploading file from URL: Network error",
      );
    }

    expect(errorThrown).to.be.true;
    expect(global.fetch).to.have.been.calledWith(testUrl);

    // Restore fetch
    global.fetch = originalFetch;
  });

  // Create a helper that returns a valid FileMetadataResponse object
  function createFakeFileMetadata(): FileMetadataResponse {
    return {
      uri: "test-delegation",
      name: "test-delegation-name",
      mimeType: "image/png",
      sizeBytes: "1234", // number type
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 3600 * 1000).toISOString(), // dummy value
      sha256Hash: "dummy-sha256", // dummy value
      state: FileState.ACTIVE, // dummy value – adjust as needed
    };
  }

  it("maintains backward compatibility with original uploadFile method", async (): Promise<void> => {
    const mockResponse = {
      ok: true,
      json: fakeUploadJson,
      headers: new Headers(),
      redirected: false,
      status: 200,
      statusText: "OK",
      type: "basic" as ResponseType,
      url: "",
      body: null,
      bodyUsed: false,
      clone: () => mockResponse as unknown as Response,
      arrayBuffer: async (): Promise<ArrayBuffer> => new ArrayBuffer(0),
      blob: async (): Promise<Blob> => new Blob(),
      formData: async (): Promise<FormData> => new FormData(),
      text: async (): Promise<string> => "",
    } as unknown as Response;

    const makeRequestStub = stub(request, "makeServerRequest").resolves(
      mockResponse,
    );

    const fileManager = new GoogleAIFileManager("apiKey");
    const fileBuffer = await readFile("./test-utils/cat.png");

    // Test that the original method still works with a buffer
    const result = await fileManager.uploadFile(fileBuffer, {
      mimeType: "image/png",
    });

    expect(result.file.uri).to.equal(FAKE_URI);
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.UPLOAD);

    // Test that our new methods delegate properly.
    // Use the helper function to get a complete FileMetadataResponse.
    const uploadFileFromBufferSpy = stub(
      fileManager,
      "uploadFileFromBuffer",
    ).resolves({
      file: createFakeFileMetadata(),
    } as unknown as UploadFileResponse);

    await fileManager.uploadFile(fileBuffer, { mimeType: "image/png" });
    expect(uploadFileFromBufferSpy.calledOnce).to.be.true;
    expect(uploadFileFromBufferSpy.firstCall.args[0]).to.equal(fileBuffer);
  });
});
