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
import { GoogleAIFileManager } from "./file-manager";
import * as sinonChai from "sinon-chai";
import { restore, stub } from "sinon";
import * as request from "./request";
import { FilesTask } from "./constants";

use(sinonChai);

describe("GoogleAIFileManager", () => {
  afterEach(() => {
    restore();
  });

  it("stores api key", () => {
    const fileManager = new GoogleAIFileManager("apiKey");
    expect(fileManager.apiKey).to.equal("apiKey");
  });
  it("passes uploadFile request info", async () => {
    const makeRequestStub = stub(request, "makeFilesRequest").resolves({
      ok: true,
      json: () => Promise.resolve({ file: { name: "uploadedfilename" } }),
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey");
    const result = await fileManager.uploadFile("./test-utils/cat.png", {
      mimeType: "image/png",
    });
    expect(result.file.name).to.equal("uploadedfilename");
    expect(makeRequestStub.args[0][0].task).to.equal(FilesTask.UPLOAD);
    expect(makeRequestStub.args[0][0].toString()).to.include("/upload/");
    expect(makeRequestStub.args[0][1]).to.be.instanceOf(Headers);
    expect(makeRequestStub.args[0][1].get("X-Goog-Upload-Protocol")).to.equal(
      "multipart",
    );
    expect(makeRequestStub.args[0][2]).to.be.instanceOf(Blob);
    const bodyBlob = makeRequestStub.args[0][2];
    const blobText = await bodyBlob.text();
    expect(blobText).to.include("Content-Type: image/png");
  });
  it("passes uploadFile request info and metadata", async () => {
    const makeRequestStub = stub(request, "makeFilesRequest").resolves({
      ok: true,
      json: () => Promise.resolve({ file: { name: "uploadedfilename" } }),
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey");
    const result = await fileManager.uploadFile("./test-utils/cat.png", {
      mimeType: "image/png",
      name: "customname",
      displayName: "mydisplayname",
    });
    // This should match what was sent but we're faking the response
    // so it won't.
    expect(result.file.name).to.equal("uploadedfilename");
    expect(makeRequestStub.args[0][2]).to.be.instanceOf(Blob);
    const bodyBlob = makeRequestStub.args[0][2];
    const blobText = await bodyBlob.text();
    expect(blobText).to.include("Content-Type: image/png");
    expect(blobText).to.include("customname");
    expect(blobText).to.include("mydisplayname");
  });
  it("passes uploadFile request info (with options)", async () => {
    const makeRequestStub = stub(request, "makeFilesRequest").resolves({
      ok: true,
      json: () => Promise.resolve({ file: { name: "uploadedfilename" } }),
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey", {
      apiVersion: "v3000",
      baseUrl: "http://mysite.com",
    });
    const result = await fileManager.uploadFile("./test-utils/cat.png", {
      mimeType: "image/png",
    });
    expect(result.file.name).to.equal("uploadedfilename");
    expect(makeRequestStub.args[0][0].task).to.equal(FilesTask.UPLOAD);
    expect(makeRequestStub.args[0][0].toString()).to.include("/upload/");
    expect(makeRequestStub.args[0][1]).to.be.instanceOf(Headers);
    expect(makeRequestStub.args[0][1].get("X-Goog-Upload-Protocol")).to.equal(
      "multipart",
    );
    expect(makeRequestStub.args[0][2]).to.be.instanceOf(Blob);
    const bodyBlob = makeRequestStub.args[0][2];
    const blobText = await bodyBlob.text();
    expect(blobText).to.include("Content-Type: image/png");
    expect(makeRequestStub.args[0][0].toString()).to.include("v3000/files");
    expect(makeRequestStub.args[0][0].toString()).to.match(
      /^http:\/\/mysite\.com/,
    );
  });
  it("passes listFiles request info", async () => {
    const makeRequestStub = stub(request, "makeFilesRequest").resolves({
      ok: true,
      json: () => Promise.resolve({ files: [{ name: "afilename" }] }),
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey");
    const result = await fileManager.listFiles();
    expect(result.files[0].name).to.equal("afilename");
    expect(makeRequestStub.args[0][0].task).to.equal(FilesTask.LIST);
    expect(makeRequestStub.args[0][0].toString()).to.match(/\/files$/);
  });
  it("passes listFiles request info with params", async () => {
    const makeRequestStub = stub(request, "makeFilesRequest").resolves({
      ok: true,
      json: () => Promise.resolve({ files: [{ name: "afilename" }] }),
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey");
    const result = await fileManager.listFiles({
      pageSize: 3,
      pageToken: "abc",
    });
    expect(result.files[0].name).to.equal("afilename");
    expect(makeRequestStub.args[0][0].task).to.equal(FilesTask.LIST);
    expect(makeRequestStub.args[0][0].toString()).to.include("pageSize=3");
    expect(makeRequestStub.args[0][0].toString()).to.include("pageToken=abc");
  });
  it("passes listFiles request info with options", async () => {
    const makeRequestStub = stub(request, "makeFilesRequest").resolves({
      ok: true,
      json: () => Promise.resolve({ files: [{ name: "afilename" }] }),
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey", {
      apiVersion: "v3000",
      baseUrl: "http://mysite.com",
    });
    const result = await fileManager.listFiles();
    expect(result.files[0].name).to.equal("afilename");
    expect(makeRequestStub.args[0][0].task).to.equal(FilesTask.LIST);
    expect(makeRequestStub.args[0][0].toString()).to.match(/\/files$/);
    expect(makeRequestStub.args[0][0].toString()).to.include("v3000/files");
    expect(makeRequestStub.args[0][0].toString()).to.match(
      /^http:\/\/mysite\.com/,
    );
  });
  it("passes getFile request info", async () => {
    const makeRequestStub = stub(request, "makeFilesRequest").resolves({
      ok: true,
      json: () => Promise.resolve({ name: "myfilename" }),
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey");
    const result = await fileManager.getFile("nameoffile");
    expect(result.name).to.equal("myfilename");
    expect(makeRequestStub.args[0][0].task).to.equal(FilesTask.GET);
    expect(makeRequestStub.args[0][0].toString()).to.include("/nameoffile");
  });
  it("passes getFile request info (with options)", async () => {
    const makeRequestStub = stub(request, "makeFilesRequest").resolves({
      ok: true,
      json: () => Promise.resolve({ name: "myfilename" }),
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey", {
      apiVersion: "v3000",
      baseUrl: "http://mysite.com",
    });
    const result = await fileManager.getFile("nameoffile");
    expect(result.name).to.equal("myfilename");
    expect(makeRequestStub.args[0][0].task).to.equal(FilesTask.GET);
    expect(makeRequestStub.args[0][0].toString()).to.include("/nameoffile");
    expect(makeRequestStub.args[0][0].toString()).to.include("v3000/files");
    expect(makeRequestStub.args[0][0].toString()).to.match(
      /^http:\/\/mysite\.com/,
    );
  });
  it("passes deleteFile request info", async () => {
    const makeRequestStub = stub(request, "makeFilesRequest").resolves({
      ok: true,
      json: () => Promise.resolve({ name: "myfilename" }),
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey");
    await fileManager.deleteFile("nameoffile");
    expect(makeRequestStub.args[0][0].task).to.equal(FilesTask.DELETE);
    expect(makeRequestStub.args[0][0].toString()).to.include("/nameoffile");
  });
  it("passes deleteFile request info (with options)", async () => {
    const makeRequestStub = stub(request, "makeFilesRequest").resolves({
      ok: true,
      json: () => Promise.resolve({ name: "myfilename" }),
    } as Response);
    const fileManager = new GoogleAIFileManager("apiKey", {
      apiVersion: "v3000",
      baseUrl: "http://mysite.com",
    });
    await fileManager.deleteFile("nameoffile");
    expect(makeRequestStub.args[0][0].task).to.equal(FilesTask.DELETE);
    expect(makeRequestStub.args[0][0].toString()).to.include("/nameoffile");
    expect(makeRequestStub.args[0][0].toString()).to.include("v3000/files");
    expect(makeRequestStub.args[0][0].toString()).to.match(
      /^http:\/\/mysite\.com/,
    );
  });
});
