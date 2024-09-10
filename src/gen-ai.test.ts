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
import { ModelParams } from "../types";
import { GenerativeModel, GoogleGenerativeAI } from "./gen-ai";
import { expect } from "chai";

const fakeContents = [{ role: "user", parts: [{ text: "hello" }] }];

const fakeCachedContent = {
  model: "my-model",
  name: "mycachename",
  contents: fakeContents,
};

describe("GoogleGenerativeAI", () => {
  it("getGenerativeModel throws if no model is provided", () => {
    const genAI = new GoogleGenerativeAI("apikey");
    expect(() => genAI.getGenerativeModel({} as ModelParams)).to.throw(
      "Must provide a model name",
    );
  });
  it("getGenerativeModel gets a GenerativeModel", () => {
    const genAI = new GoogleGenerativeAI("apikey");
    const genModel = genAI.getGenerativeModel({ model: "my-model" });
    expect(genModel).to.be.an.instanceOf(GenerativeModel);
    expect(genModel.model).to.equal("models/my-model");
  });
  it("getGenerativeModelFromCachedContent gets a GenerativeModel", () => {
    const genAI = new GoogleGenerativeAI("apikey");
    const genModel =
      genAI.getGenerativeModelFromCachedContent(fakeCachedContent);
    expect(genModel).to.be.an.instanceOf(GenerativeModel);
    expect(genModel.model).to.equal("models/my-model");
    expect(genModel.cachedContent).to.eql(fakeCachedContent);
  });
  it("getGenerativeModelFromCachedContent gets a GenerativeModel merged with modelParams", () => {
    const genAI = new GoogleGenerativeAI("apikey");
    const genModel = genAI.getGenerativeModelFromCachedContent(
      fakeCachedContent,
      { generationConfig: { temperature: 0 } },
    );
    expect(genModel).to.be.an.instanceOf(GenerativeModel);
    expect(genModel.model).to.equal("models/my-model");
    expect(genModel.generationConfig.temperature).to.equal(0);
    expect(genModel.cachedContent).to.eql(fakeCachedContent);
  });
  it("getGenerativeModelFromCachedContent gets a GenerativeModel merged with modelParams with overlapping keys", () => {
    const genAI = new GoogleGenerativeAI("apikey");
    const genModel = genAI.getGenerativeModelFromCachedContent(
      fakeCachedContent,
      { model: "my-model", generationConfig: { temperature: 0 } },
    );
    expect(genModel).to.be.an.instanceOf(GenerativeModel);
    expect(genModel.model).to.equal("models/my-model");
    expect(genModel.generationConfig.temperature).to.equal(0);
    expect(genModel.cachedContent).to.eql(fakeCachedContent);
  });
  it("getGenerativeModelFromCachedContent throws if no name", () => {
    const genAI = new GoogleGenerativeAI("apikey");
    expect(() =>
      genAI.getGenerativeModelFromCachedContent({
        model: "my-model",
        contents: fakeContents,
      }),
    ).to.throw("Cached content must contain a `name` field.");
  });
  it("getGenerativeModelFromCachedContent throws if no model", () => {
    const genAI = new GoogleGenerativeAI("apikey");
    expect(() =>
      genAI.getGenerativeModelFromCachedContent({
        name: "cachename",
        contents: fakeContents,
      }),
    ).to.throw("Cached content must contain a `model` field.");
  });
  it("getGenerativeModelFromCachedContent throws if mismatched model", () => {
    const genAI = new GoogleGenerativeAI("apikey");
    expect(() =>
      genAI.getGenerativeModelFromCachedContent(
        {
          name: "cachename",
          model: "my-model",
          contents: fakeContents,
        },
        { model: "your-model" },
      ),
    ).to.throw(
      `Different value for "model" specified in modelParams (your-model) and cachedContent (my-model)`,
    );
  });
  it("getGenerativeModelFromCachedContent throws if mismatched systemInstruction", () => {
    const genAI = new GoogleGenerativeAI("apikey");
    expect(() =>
      genAI.getGenerativeModelFromCachedContent(
        {
          name: "cachename",
          model: "my-model",
          contents: fakeContents,
          systemInstruction: "hi",
        },
        { model: "models/my-model", systemInstruction: "yo" },
      ),
    ).to.throw(
      `Different value for "systemInstruction" specified in modelParams (yo) and cachedContent (hi)`,
    );
  });
});
