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
import { GoogleAICacheManager } from "./cache-manager";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { restore, stub } from "sinon";
import * as request from "./request";
import { RpcTask } from "./constants";
import { DEFAULT_API_VERSION } from "../requests/request";

use(sinonChai);
use(chaiAsPromised);

const FAKE_CONTENTS = [{ role: "user", parts: [{ text: "some text" }] }];
const FAKE_CACHE_NAME = "cachedContents/hash1234";
const fakeResponseJson: () => Promise<{}> = () =>
  Promise.resolve({ name: FAKE_CACHE_NAME });
const model = "models/gemini-1.5-pro-001";

describe("GoogleAICacheManager", () => {
  afterEach(() => {
    restore();
  });

  it("stores api key", () => {
    const cacheManager = new GoogleAICacheManager("apiKey");
    expect(cacheManager.apiKey).to.equal("apiKey");
  });
  it("passes create request info", async () => {
    const displayName = "a display name.";
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: fakeResponseJson,
    } as Response);
    const cacheManager = new GoogleAICacheManager("apiKey");
    const result = await cacheManager.create({
      model,
      contents: FAKE_CONTENTS,
      ttlSeconds: 30,
      systemInstruction: "talk like a cat",
      tools: [{ functionDeclarations: [{ name: "myFn" }] }],
      toolConfig: { functionCallingConfig: {} },
      displayName,
    });
    expect(result.name).to.equal(FAKE_CACHE_NAME);
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.CREATE);
    expect(makeRequestStub.args[0][1]).to.be.instanceOf(Headers);
    const requestBody = JSON.parse(makeRequestStub.args[0][2] as string);
    expect(requestBody.model).to.equal(model);
    expect(requestBody.contents).to.deep.equal(FAKE_CONTENTS);
    expect(requestBody.ttl).to.deep.equal("30s");
    expect(requestBody.displayName).to.equal(displayName);
    expect(requestBody.systemInstruction.parts[0].text).to.equal(
      "talk like a cat",
    );
    expect(requestBody.tools[0].functionDeclarations[0].name).to.equal("myFn");
    expect(requestBody.toolConfig.functionCallingConfig).to.exist;
  });
  it("create() formats unprefixed model name", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: fakeResponseJson,
    } as Response);
    const cacheManager = new GoogleAICacheManager("apiKey");
    await cacheManager.create({
      model,
      contents: FAKE_CONTENTS,
    });
    const requestBody = JSON.parse(makeRequestStub.args[0][2] as string);
    expect(requestBody.model).to.equal(model);
  });
  it("create() errors without a model name", async () => {
    const cacheManager = new GoogleAICacheManager("apiKey");
    await expect(
      cacheManager.create({
        contents: FAKE_CONTENTS,
      }),
    ).to.be.rejectedWith("Cached content must contain a `model` field.");
  });
  it("create() errors if ttlSeconds and expireTime are both provided", async () => {
    const cacheManager = new GoogleAICacheManager("apiKey");
    await expect(
      cacheManager.create({
        model,
        contents: FAKE_CONTENTS,
        ttlSeconds: 40,
        expireTime: new Date().toISOString(),
      }),
    ).to.be.rejectedWith("You cannot specify");
  });
  it("passes create request info (with options)", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: fakeResponseJson,
    } as Response);
    const cacheManager = new GoogleAICacheManager("apiKey", {
      apiVersion: "v3000",
      baseUrl: "http://mysite.com",
    });
    await cacheManager.create({
      model,
      contents: FAKE_CONTENTS,
    });
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.CREATE);
    expect(makeRequestStub.args[0][1]).to.be.instanceOf(Headers);
    expect(makeRequestStub.args[0][0].toString()).to.include(
      "v3000/cachedContents",
    );
    expect(makeRequestStub.args[0][0].toString()).to.match(
      /^http:\/\/mysite\.com/,
    );
  });
  it("passes update request info", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: fakeResponseJson,
    } as Response);
    const cacheManager = new GoogleAICacheManager("apiKey");
    const result = await cacheManager.update(FAKE_CACHE_NAME, {
      cachedContent: {
        ttlSeconds: 30,
      },
    });
    expect(result.name).to.equal(FAKE_CACHE_NAME);
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.UPDATE);
    expect(makeRequestStub.args[0][1]).to.be.instanceOf(Headers);
    const requestBody = JSON.parse(makeRequestStub.args[0][2] as string);
    expect(requestBody.ttl).to.deep.equal("30s");
  });
  it("passes list request info", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: () =>
        Promise.resolve({ cachedContents: [{ name: FAKE_CACHE_NAME }] }),
    } as Response);
    const cacheManager = new GoogleAICacheManager("apiKey");
    const result = await cacheManager.list();
    expect(result.cachedContents[0].name).to.equal(FAKE_CACHE_NAME);
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.LIST);
    expect(makeRequestStub.args[0][0].toString()).to.match(/\/cachedContents$/);
  });
  it("passes list request info with params", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: () =>
        Promise.resolve({ cachedContents: [{ name: FAKE_CACHE_NAME }] }),
    } as Response);
    const cacheManager = new GoogleAICacheManager("apiKey");
    const result = await cacheManager.list({
      pageSize: 3,
      pageToken: "abc",
    });
    expect(result.cachedContents[0].name).to.equal(FAKE_CACHE_NAME);
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.LIST);
    expect(makeRequestStub.args[0][0].toString()).to.include("pageSize=3");
    expect(makeRequestStub.args[0][0].toString()).to.include("pageToken=abc");
  });
  it("passes list request info with options", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: () =>
        Promise.resolve({ cachedContents: [{ name: FAKE_CACHE_NAME }] }),
    } as Response);
    const cacheManager = new GoogleAICacheManager("apiKey", {
      apiVersion: "v3000",
      baseUrl: "http://mysite.com",
    });
    const result = await cacheManager.list();
    expect(result.cachedContents[0].name).to.equal(FAKE_CACHE_NAME);
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.LIST);
    expect(makeRequestStub.args[0][0].toString()).to.match(/\/cachedContents$/);
    expect(makeRequestStub.args[0][0].toString()).to.include(
      "v3000/cachedContents",
    );
    expect(makeRequestStub.args[0][0].toString()).to.match(
      /^http:\/\/mysite\.com/,
    );
  });
  it("passes get request info with name prefix provided", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: fakeResponseJson,
    } as Response);
    const cacheManager = new GoogleAICacheManager("apiKey");
    const result = await cacheManager.get("cachedContents/hash1234");
    expect(result.name).to.equal(FAKE_CACHE_NAME);
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.GET);
    expect(makeRequestStub.args[0][0].toString()).to.include(
      `${DEFAULT_API_VERSION}/cachedContents/hash1234`,
    );
  });
  it("passes get request info with no name prefix", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: fakeResponseJson,
    } as Response);
    const cacheManager = new GoogleAICacheManager("apiKey");
    const result = await cacheManager.get("hash1234");
    expect(result.name).to.equal(FAKE_CACHE_NAME);
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.GET);
    expect(makeRequestStub.args[0][0].toString()).to.include(
      `${DEFAULT_API_VERSION}/cachedContents/hash1234`,
    );
  });
  it("passes getFile request info (with options)", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: fakeResponseJson,
    } as Response);
    const cacheManager = new GoogleAICacheManager("apiKey", {
      apiVersion: "v3000",
      baseUrl: "http://mysite.com",
    });
    const result = await cacheManager.get("hash1234");
    expect(result.name).to.equal(FAKE_CACHE_NAME);
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.GET);
    expect(makeRequestStub.args[0][0].toString()).to.include(
      "v3000/cachedContents/hash1234",
    );
    expect(makeRequestStub.args[0][0].toString()).to.match(
      /^http:\/\/mysite\.com/,
    );
  });
  it("get throws on bad name", async () => {
    stub(request, "makeServerRequest").resolves({
      ok: true,
      json: fakeResponseJson,
    } as Response);
    const cacheManager = new GoogleAICacheManager("apiKey");
    await expect(cacheManager.get("")).to.be.rejectedWith("Invalid name");
  });
  it("passes delete request info (no prefix)", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);
    const cacheManager = new GoogleAICacheManager("apiKey");
    await cacheManager.delete("hash1234");
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.DELETE);
    expect(makeRequestStub.args[0][0].toString()).to.include(
      `${DEFAULT_API_VERSION}/cachedContents/hash1234`,
    );
  });
  it("passes delete request info (prefix)", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);
    const cacheManager = new GoogleAICacheManager("apiKey");
    await cacheManager.delete("cachedContents/hash1234");
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.DELETE);
    expect(makeRequestStub.args[0][0].toString()).to.include(
      `${DEFAULT_API_VERSION}/cachedContents/hash1234`,
    );
  });
  it("passes delete request info (with options)", async () => {
    const makeRequestStub = stub(request, "makeServerRequest").resolves({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);
    const cacheManager = new GoogleAICacheManager("apiKey", {
      apiVersion: "v3000",
      baseUrl: "http://mysite.com",
    });
    await cacheManager.delete("hash1234");
    expect(makeRequestStub.args[0][0].task).to.equal(RpcTask.DELETE);
    expect(makeRequestStub.args[0][0].toString()).to.include(
      "v3000/cachedContents/hash1234",
    );
    expect(makeRequestStub.args[0][0].toString()).to.match(
      /^http:\/\/mysite\.com/,
    );
  });
  it("delete throws on bad name", async () => {
    stub(request, "makeServerRequest").resolves({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);
    const cacheManager = new GoogleAICacheManager("apiKey");
    await expect(cacheManager.delete("")).to.be.rejectedWith("Invalid name");
  });
});
