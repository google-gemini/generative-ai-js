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
import * as sinon from "sinon";
import * as fineTuningMethods from "./methods/fine-tuning";

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

// ------------------ Added Fine-Tuning Test Cases ------------------

describe("GoogleGenerativeAI Fine-Tuning API Methods", () => {
  let genAI: GoogleGenerativeAI;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    genAI = new GoogleGenerativeAI("apikey");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("listTunedModels returns a list of tuned models", async () => {
    const fakeResponse = { tunedModels: [{ name: "model-1" }, { name: "model-2" }] };
    const listStub = sandbox
      .stub(fineTuningMethods, "listTunedModels")
      .resolves(fakeResponse);
    const response = await genAI.listTunedModels(2);
    expect(response).to.deep.equal(fakeResponse);
    expect(listStub.calledOnceWith("apikey", 2)).to.be.true;
  });

  it("createTunedModel returns a tuned model creation response", async () => {
    const displayName = "Test Model";
    const trainingData = [{ input: "example", output: "response" }];
    const fakeResponse = { name: "tuned-model-1" };
    const createStub = sandbox
      .stub(fineTuningMethods, "createTunedModel")
      .resolves(fakeResponse);
    const response = await genAI.createTunedModel(displayName, trainingData);
    expect(response).to.deep.equal(fakeResponse);
    expect(createStub.calledOnceWith("apikey", displayName, trainingData)).to.be.true;
  });

  it("checkTuningStatus returns the tuning status", async () => {
    const operationName = "operation-123";
    const fakeResponse = { metadata: { completedPercent: 50 } };
    const checkStub = sandbox
      .stub(fineTuningMethods, "checkTuningStatus")
      .resolves(fakeResponse);
    const response = await genAI.checkTuningStatus(operationName);
    expect(response).to.deep.equal(fakeResponse);
    expect(checkStub.calledOnceWith("apikey", operationName)).to.be.true;
  });

  it("deleteTunedModel returns the delete tuned model response", async () => {
    const modelName = "tuned-model-1";
    const fakeResponse = { success: true };
    const deleteStub = sandbox
      .stub(fineTuningMethods, "deleteTunedModel")
      .resolves(fakeResponse);
    const response = await genAI.deleteTunedModel(modelName);
    expect(response).to.deep.equal(fakeResponse);
    expect(deleteStub.calledOnceWith("apikey", modelName)).to.be.true;
  });
});
