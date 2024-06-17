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
import { GenerativeModel } from "./generative-model";
import * as sinonChai from "sinon-chai";
import {
  CountTokensRequest,
  FunctionCallingMode,
  FunctionDeclarationSchemaType,
  HarmBlockThreshold,
  HarmCategory,
} from "../../types";
import { getMockResponse } from "../../test-utils/mock-response";
import { match, restore, stub } from "sinon";
import * as request from "../requests/request";

use(sinonChai);

describe("GenerativeModel", () => {
  it("handles plain model name", () => {
    const genModel = new GenerativeModel("apiKey", { model: "my-model" });
    expect(genModel.model).to.equal("models/my-model");
  });
  it("handles prefixed model name", () => {
    const genModel = new GenerativeModel("apiKey", {
      model: "models/my-model",
    });
    expect(genModel.model).to.equal("models/my-model");
  });
  it("handles prefixed tuned model name", () => {
    const genModel = new GenerativeModel("apiKey", {
      model: "tunedModels/my-model",
    });
    expect(genModel.model).to.equal("tunedModels/my-model");
  });
  it("passes params through to generateContent", async () => {
    const genModel = new GenerativeModel(
      "apiKey",
      {
        model: "my-model",
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
          responseSchema: {
            type: FunctionDeclarationSchemaType.OBJECT,
            properties: {
              testField: {
                type: FunctionDeclarationSchemaType.STRING,
                properties: {},
              },
            },
          },
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
        ],
        tools: [{ functionDeclarations: [{ name: "myfunc" }] }],
        toolConfig: {
          functionCallingConfig: { mode: FunctionCallingMode.NONE },
        },
        systemInstruction: { role: "system", parts: [{ text: "be friendly" }] },
      },
      {
        apiVersion: "v6",
      },
    );
    expect(genModel.generationConfig?.temperature).to.equal(0);
    expect(genModel.generationConfig?.responseMimeType).to.equal(
      "application/json",
    );
    expect(genModel.generationConfig?.responseSchema.type).to.equal(
      FunctionDeclarationSchemaType.OBJECT,
    );
    expect(
      genModel.generationConfig?.responseSchema.properties.testField.type,
    ).to.equal(FunctionDeclarationSchemaType.STRING);
    expect(genModel.safetySettings?.length).to.equal(1);
    expect(genModel.tools?.length).to.equal(1);
    expect(genModel.toolConfig?.functionCallingConfig.mode).to.equal(
      FunctionCallingMode.NONE,
    );
    expect(genModel.systemInstruction?.parts[0].text).to.equal("be friendly");
    const mockResponse = getMockResponse(
      "unary-success-basic-reply-short.json",
    );
    const makeRequestStub = stub(request, "makeModelRequest").resolves(
      mockResponse as Response,
    );
    await genModel.generateContent("hello");
    expect(makeRequestStub).to.be.calledWith(
      "models/my-model",
      request.Task.GENERATE_CONTENT,
      match.any,
      false,
      match((value: string) => {
        return (
          value.includes("myfunc") &&
          value.includes(FunctionCallingMode.NONE) &&
          value.includes("be friendly") &&
          value.includes("temperature") &&
          value.includes("testField") &&
          value.includes(HarmBlockThreshold.BLOCK_LOW_AND_ABOVE)
        );
      }),
      match((value) => {
        return value.apiVersion === "v6";
      }),
    );
    restore();
  });
  it("passes text-only systemInstruction through to generateContent", async () => {
    const genModel = new GenerativeModel("apiKey", {
      model: "my-model",
      systemInstruction: "be friendly",
    });
    expect(genModel.systemInstruction?.parts[0].text).to.equal("be friendly");
    const mockResponse = getMockResponse(
      "unary-success-basic-reply-short.json",
    );
    const makeRequestStub = stub(request, "makeModelRequest").resolves(
      mockResponse as Response,
    );
    await genModel.generateContent("hello");
    expect(makeRequestStub).to.be.calledWith(
      "models/my-model",
      request.Task.GENERATE_CONTENT,
      match.any,
      false,
      match((value: string) => {
        return value.includes("be friendly");
      }),
      match.any,
    );
    restore();
  });
  it("generateContent overrides model values", async () => {
    const genModel = new GenerativeModel("apiKey", {
      model: "my-model",
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            testField: {
              type: FunctionDeclarationSchemaType.STRING,
              properties: {},
            },
          },
        },
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
      ],
      tools: [{ functionDeclarations: [{ name: "myfunc" }] }],
      toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.NONE } },
      systemInstruction: { role: "system", parts: [{ text: "be friendly" }] },
    });
    expect(genModel.tools?.length).to.equal(1);
    expect(genModel.toolConfig?.functionCallingConfig.mode).to.equal(
      FunctionCallingMode.NONE,
    );
    expect(genModel.systemInstruction?.parts[0].text).to.equal("be friendly");
    const mockResponse = getMockResponse(
      "unary-success-basic-reply-short.json",
    );
    const makeRequestStub = stub(request, "makeModelRequest").resolves(
      mockResponse as Response,
    );
    await genModel.generateContent({
      generationConfig: {
        topK: 1,
        responseSchema: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            newTestField: {
              type: FunctionDeclarationSchemaType.STRING,
              properties: {},
            },
          },
        },
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
      contents: [{ role: "user", parts: [{ text: "hello" }] }],
      tools: [{ functionDeclarations: [{ name: "otherfunc" }] }],
      toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.AUTO } },
      systemInstruction: { role: "system", parts: [{ text: "be formal" }] },
    });
    expect(makeRequestStub).to.be.calledWith(
      "models/my-model",
      request.Task.GENERATE_CONTENT,
      match.any,
      false,
      match((value: string) => {
        return (
          value.includes("otherfunc") &&
          value.includes(FunctionCallingMode.AUTO) &&
          value.includes("be formal") &&
          value.includes("topK") &&
          value.includes("newTestField") &&
          !value.includes("testField") &&
          value.includes(HarmCategory.HARM_CATEGORY_HARASSMENT)
        );
      }),
      {},
    );
    restore();
  });
  it("passes requestOptions through to countTokens", async () => {
    const genModel = new GenerativeModel(
      "apiKey",
      {
        model: "my-model",
      },
      {
        apiVersion: "v2000",
      },
    );
    const mockResponse = getMockResponse(
      "unary-success-basic-reply-short.json",
    );
    const makeRequestStub = stub(request, "makeModelRequest").resolves(
      mockResponse as Response,
    );
    await genModel.countTokens("hello");
    expect(makeRequestStub).to.be.calledWith(
      "models/my-model",
      request.Task.COUNT_TOKENS,
      match.any,
      false,
      match.any,
      match((value) => {
        return value.apiVersion === "v2000";
      }),
    );
    restore();
  });
  it("passes params through to chat.sendMessage", async () => {
    const genModel = new GenerativeModel("apiKey", {
      model: "my-model",
      tools: [{ functionDeclarations: [{ name: "myfunc" }] }],
      toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.NONE } },
      systemInstruction: { role: "system", parts: [{ text: "be friendly" }] },
    });
    expect(genModel.tools?.length).to.equal(1);
    expect(genModel.toolConfig?.functionCallingConfig.mode).to.equal(
      FunctionCallingMode.NONE,
    );
    expect(genModel.systemInstruction?.parts[0].text).to.equal("be friendly");
    const mockResponse = getMockResponse(
      "unary-success-basic-reply-short.json",
    );
    const makeRequestStub = stub(request, "makeModelRequest").resolves(
      mockResponse as Response,
    );
    await genModel.startChat().sendMessage("hello");
    expect(makeRequestStub).to.be.calledWith(
      "models/my-model",
      request.Task.GENERATE_CONTENT,
      match.any,
      false,
      match((value: string) => {
        return (
          value.includes("myfunc") &&
          value.includes(FunctionCallingMode.NONE) &&
          value.includes("be friendly")
        );
      }),
      {},
    );
    restore();
  });
  it("passes params through to chat.sendMessage", async () => {
    const genModel = new GenerativeModel("apiKey", {
      model: "my-model",
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            testField: {
              type: FunctionDeclarationSchemaType.STRING,
              properties: {},
            },
          },
        },
      },
      systemInstruction: { role: "system", parts: [{ text: "be friendly" }] },
    });
    expect(genModel.systemInstruction?.parts[0].text).to.equal("be friendly");
    expect(genModel.generationConfig.responseSchema.properties.testField).to
      .exist;
    const mockResponse = getMockResponse(
      "unary-success-basic-reply-short.json",
    );
    const makeRequestStub = stub(request, "makeModelRequest").resolves(
      mockResponse as Response,
    );
    await genModel.startChat().sendMessage("hello");
    expect(makeRequestStub).to.be.calledWith(
      "models/my-model",
      request.Task.GENERATE_CONTENT,
      match.any,
      false,
      match((value: string) => {
        return value.includes("be friendly") && value.includes("testField");
      }),
      {},
    );
    restore();
  });
  it("startChat overrides model values", async () => {
    const genModel = new GenerativeModel("apiKey", {
      model: "my-model",
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            testField: {
              type: FunctionDeclarationSchemaType.STRING,
              properties: {},
            },
          },
        },
      },
      tools: [{ functionDeclarations: [{ name: "myfunc" }] }],
      toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.NONE } },
      systemInstruction: { role: "system", parts: [{ text: "be friendly" }] },
    });
    expect(genModel.generationConfig.responseSchema.properties.testField).to
      .exist;
    expect(genModel.tools?.length).to.equal(1);
    expect(genModel.toolConfig?.functionCallingConfig.mode).to.equal(
      FunctionCallingMode.NONE,
    );
    expect(genModel.systemInstruction?.parts[0].text).to.equal("be friendly");
    const mockResponse = getMockResponse(
      "unary-success-basic-reply-short.json",
    );
    const makeRequestStub = stub(request, "makeModelRequest").resolves(
      mockResponse as Response,
    );
    await genModel
      .startChat({
        tools: [{ functionDeclarations: [{ name: "otherfunc" }] }],
        generationConfig: {
          responseSchema: {
            type: FunctionDeclarationSchemaType.OBJECT,
            properties: {
              newTestField: {
                type: FunctionDeclarationSchemaType.STRING,
                properties: {},
              },
            },
          },
        },
        toolConfig: {
          functionCallingConfig: { mode: FunctionCallingMode.AUTO },
        },
        systemInstruction: { role: "system", parts: [{ text: "be formal" }] },
      })
      .sendMessage("hello");
    expect(makeRequestStub).to.be.calledWith(
      "models/my-model",
      request.Task.GENERATE_CONTENT,
      match.any,
      false,
      match((value: string) => {
        return (
          value.includes("otherfunc") &&
          value.includes(FunctionCallingMode.AUTO) &&
          value.includes("be formal") &&
          value.includes("newTestField") &&
          !value.includes("testField")
        );
      }),
      {},
    );
    restore();
  });
  it("countTokens errors if contents and generateContentRequest are both defined", async () => {
    const genModel = new GenerativeModel(
      "apiKey",
      {
        model: "my-model",
      },
      {
        apiVersion: "v2000",
      },
    );
    const mockResponse = getMockResponse(
      "unary-success-basic-reply-short.json",
    );
    const makeRequestStub = stub(request, "makeModelRequest").resolves(
      mockResponse as Response,
    );
    const countTokensRequest: CountTokensRequest = {
      contents: [{ role: "user", parts: [{ text: "hello" }] }],
      generateContentRequest: {
        contents: [{ role: "user", parts: [{ text: "hello" }] }],
      },
    };
    await expect(
      genModel.countTokens(countTokensRequest),
    ).to.eventually.be.rejectedWith(
      "CountTokensRequest must have one of contents or generateContentRequest, not both.",
    );
    expect(makeRequestStub).to.not.be.called;
    restore();
  });
});
