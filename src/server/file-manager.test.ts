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
import { FileMetadata } from "../../types/server";

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
