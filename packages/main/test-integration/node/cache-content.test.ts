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
import * as chaiAsPromised from "chai-as-promised";
import { GoogleGenerativeAI } from "../..";
import { GoogleAICacheManager } from "../../server"; //= require("@google/generative-ai/server");

use(chaiAsPromised);

/**
 * Integration tests against live backend.
 */

describe("cacheContent", function () {
  this.timeout(60e3);
  this.slow(10e3);
  const model = "models/gemini-1.5-pro-001";
  let text: string = "";

  // Minimum cache size is 32768 tokens.
  for (let i = 0; i < 6554; i++) {
    text += "Purple cats drink chicken soup.";
    text += i % 8 === 7 ? "\n" : " ";
  }
  it("createCache", async () => {
    // cacheManager create
    const ttlSeconds = 5;
    const displayName = "A display name.";
    const cacheManager = new GoogleAICacheManager(
      process.env.GEMINI_API_KEY || "",
    );
    const createCacheResult = await cacheManager.create({
      ttlSeconds,
      model,
      contents: [
        {
          role: "user",
          parts: [{ text }],
        },
      ],
      displayName,
    });
    expect(createCacheResult.name).to.exist;
    expect(createCacheResult.model).to.exist;
    expect(createCacheResult.createTime).to.exist;
    expect(createCacheResult.updateTime).to.exist;
    expect(createCacheResult.expireTime).to.exist;
    expect(createCacheResult.displayName).to.exist.and.equal(displayName);
    expect(createCacheResult.name.startsWith("cachedContents/")).to.be.true;
    const createdTime = Date.parse(createCacheResult.createTime);
    const expireTime = Date.parse(createCacheResult.expireTime);
    expect(expireTime - createdTime).to.be.lessThanOrEqual(ttlSeconds * 1000);
  });
  it("cacheManager list", async () => {
    // cacheManager create
    const displayName = new Date().toISOString();
    const cacheManager = new GoogleAICacheManager(
      process.env.GEMINI_API_KEY || "",
    );
    const createCacheResult = await cacheManager.create({
      ttlSeconds: 5,
      model,
      contents: [
        {
          role: "user",
          parts: [{ text }],
        },
      ],
      displayName,
    });
    expect(createCacheResult.name).to.exist;
    expect(createCacheResult.displayName).to.exist.and.equal(displayName);
    expect(createCacheResult.name.startsWith("cachedContents/")).to.be.true;

    // List
    const listResult = await cacheManager.list();
    expect(listResult.cachedContents).to.exist;
    expect(
      listResult.cachedContents.map((e) => ({ name: e.name })),
    ).to.deep.include({ name: createCacheResult.name });
    expect(
      listResult.cachedContents.map((e) => ({ displayName: e.displayName })),
    ).to.deep.include({ displayName });
  });
  it("cacheManager get", async () => {
    // cacheManager create
    const displayName = new Date().toISOString();
    const cacheManager = new GoogleAICacheManager(
      process.env.GEMINI_API_KEY || "",
    );
    const createCacheResult = await cacheManager.create({
      ttlSeconds: 5,
      model,
      contents: [
        {
          role: "user",
          parts: [{ text }],
        },
      ],
      displayName,
    });
    expect(createCacheResult.name).to.exist;
    expect(createCacheResult.displayName).to.exist.and.equal(displayName);
    expect(createCacheResult.name.startsWith("cachedContents/")).to.be.true;

    // cacheManager.get
    const cache = await cacheManager.get(createCacheResult.name);
    expect(cache.name).to.equal(createCacheResult.name);
    expect(cache.model).to.equal(createCacheResult.model);
    expect(cache.createTime).to.equal(createCacheResult.createTime);
    expect(cache.updateTime).to.equal(createCacheResult.updateTime);
    expect(cache.expireTime).to.equal(createCacheResult.expireTime);
    expect(cache.displayName).to.exist.and.equal(displayName);
  });
  it("cacheManager update ttl then get", async () => {
    // cacheManager create
    const displayName = new Date().toISOString();
    const originalTtlSeconds = 20;
    const cacheManager = new GoogleAICacheManager(
      process.env.GEMINI_API_KEY || "",
    );
    const createCacheResult = await cacheManager.create({
      ttlSeconds: originalTtlSeconds,
      model,
      contents: [
        {
          role: "user",
          parts: [{ text }],
        },
      ],
      displayName,
    });
    expect(createCacheResult.name).to.exist;
    expect(createCacheResult.name.startsWith("cachedContents/")).to.be.true;
    expect(createCacheResult.displayName).to.exist.and.equal(displayName);

    // cacheManager.update
    const newTtlSeconds = originalTtlSeconds + 10;
    const updateParams = { cachedContent: { ttlSeconds: newTtlSeconds } };
    const updateResult = await cacheManager.update(
      createCacheResult.name,
      updateParams,
    );

    // cacheManager.get
    const cache = await cacheManager.get(createCacheResult.name);
    expect(cache.name).to.equal(createCacheResult.name);
    expect(cache.name).to.equal(updateResult.name);
    expect(cache.model).to.equal(createCacheResult.model);
    expect(cache.model).to.equal(updateResult.model);
    expect(cache.createTime).to.equal(createCacheResult.createTime);
    expect(cache.updateTime).to.not.equal(createCacheResult.updateTime);
    expect(cache.updateTime).to.equal(updateResult.updateTime);
    expect(cache.expireTime).to.not.equal(createCacheResult.expireTime);
    expect(cache.expireTime).to.equal(updateResult.expireTime);
    expect(cache.displayName).to.exist.and.equal(displayName);
    const createdTime = Date.parse(createCacheResult.createTime);
    const expireTime = Date.parse(createCacheResult.expireTime);
    const updatedTime = Date.parse(cache.updateTime);
    expect(expireTime - createdTime).to.be.lessThanOrEqual(
      originalTtlSeconds * 1000,
    );
    expect(expireTime - updatedTime).to.be.lessThanOrEqual(
      newTtlSeconds * 1000,
    );
  });
  it("cacheManager update expireTime then get", async () => {
    // cacheManager create
    const cacheManager = new GoogleAICacheManager(
      process.env.GEMINI_API_KEY || "",
    );
    const createCacheResult = await cacheManager.create({
      ttlSeconds: 20,
      model,
      contents: [
        {
          role: "user",
          parts: [{ text }],
        },
      ],
    });
    expect(createCacheResult.name).to.exist;
    expect(createCacheResult.name.startsWith("cachedContents/")).to.be.true;
    expect(createCacheResult.displayName).to.equal("");

    // cacheManager.update
    const newExpirationTime = new Date(new Date().getTime() + 30 * 1000);
    const updateParams = {
      cachedContent: { expireTime: newExpirationTime.toISOString() },
    };
    const updateResult = await cacheManager.update(
      createCacheResult.name,
      updateParams,
    );

    // cacheManager.get
    const cache = await cacheManager.get(createCacheResult.name);
    expect(cache.name).to.equal(createCacheResult.name);
    expect(cache.name).to.equal(updateResult.name);
    expect(cache.model).to.equal(createCacheResult.model);
    expect(cache.model).to.equal(updateResult.model);
    expect(cache.createTime).to.equal(createCacheResult.createTime);
    expect(cache.updateTime).to.not.equal(createCacheResult.updateTime);
    expect(cache.updateTime).to.equal(updateResult.updateTime);
    expect(cache.expireTime).to.not.equal(createCacheResult.expireTime);
    expect(cache.expireTime).to.equal(updateResult.expireTime);
  });
  it("generateContentWithCache", async () => {
    const cacheManager = new GoogleAICacheManager(
      process.env.GEMINI_API_KEY || "",
    );
    const createCacheResult = await cacheManager.create({
      ttlSeconds: 20,
      model,
      contents: [
        {
          role: "user",
          parts: [{ text }],
        },
      ],
    });
    expect(createCacheResult.name).to.exist;
    const cacheName = createCacheResult.name;
    expect(cacheName.startsWith("cachedContents/")).to.be.true;

    // cacheManager.get
    const cache = await cacheManager.get(cacheName);

    // generate content.
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const genAiModel = genAI.getGenerativeModelFromCachedContent(cache);
    const result = await genAiModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: "What do purple cats drink?" }],
        },
      ],
    });
    const response = await result.response;
    expect(response.text().toLowerCase().includes("chicken soup")).to.be.true;
  });
});
