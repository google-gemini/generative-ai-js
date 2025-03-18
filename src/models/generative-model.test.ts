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
  HarmBlockThreshold,
  HarmCategory,
  ObjectSchema,
  SchemaType,
} from "../../types";
import {
  CreateTunedModelParams,
  ListTunedModelsParams,
  TunedModelState,
} from "../../types/tune-model";
import { getMockResponse } from "../../test-utils/mock-response";
import { match, restore, stub } from "sinon";
import * as request from "../requests/request";
import * as finetune from "../methods/finetune";
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
            type: SchemaType.OBJECT,
            properties: {
              testField: {
                type: SchemaType.STRING,
              },
            },
          },
          presencePenalty: 0.6,
          frequencyPenalty: 0.5,
          responseLogprobs: true,
          logprobs: 2,
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
      SchemaType.OBJECT,
    );
    expect(
      (genModel.generationConfig?.responseSchema as ObjectSchema).properties
        .testField.type,
    ).to.equal(SchemaType.STRING);
    expect(genModel.generationConfig?.presencePenalty).to.equal(0.6);
    expect(genModel.generationConfig?.frequencyPenalty).to.equal(0.5);
    expect(genModel.generationConfig?.responseLogprobs).to.equal(true);
    expect(genModel.generationConfig?.logprobs).to.equal(2);
    expect(genModel.safetySettings?.length).to.equal(1);
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
    expect(makeRequestStub).to.have.been.calledWith(
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
          value.includes(HarmBlockThreshold.BLOCK_LOW_AND_ABOVE) &&
          value.includes("presencePenalty") &&
          value.includes("frequencyPenalty") &&
          value.includes("responseLogprobs") &&
          value.includes("logprobs")
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
    expect(makeRequestStub).to.have.been.calledWith(
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
          type: SchemaType.OBJECT,
          properties: {
            testField: {
              type: SchemaType.STRING,
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
          type: SchemaType.OBJECT,
          properties: {
            newTestField: {
              type: SchemaType.STRING,
            },
          },
        },
        presencePenalty: 0.6,
        frequencyPenalty: 0.5,
        responseLogprobs: true,
        logprobs: 2,
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
    expect(makeRequestStub).to.have.been.calledWith(
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
          value.includes(HarmCategory.HARM_CATEGORY_HARASSMENT) &&
          value.includes("presencePenalty") &&
          value.includes("frequencyPenalty") &&
          value.includes("responseLogprobs") &&
          value.includes("logprobs")
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
        systemInstruction: "you are a cat",
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
    expect(makeRequestStub).to.have.been.calledWith(
      "models/my-model",
      request.Task.COUNT_TOKENS,
      match.any,
      false,
      match((value: string) => {
        return value.includes("hello") && value.includes("you are a cat");
      }),
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
    expect(makeRequestStub).to.have.been.calledWith(
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
          type: SchemaType.OBJECT,
          properties: {
            testField: {
              type: SchemaType.STRING,
            },
          },
        },
      },
      systemInstruction: { role: "system", parts: [{ text: "be friendly" }] },
    });
    expect(genModel.systemInstruction?.parts[0].text).to.equal("be friendly");
    expect(
      (genModel.generationConfig.responseSchema as ObjectSchema).properties
        .testField,
    ).to.exist;
    const mockResponse = getMockResponse(
      "unary-success-basic-reply-short.json",
    );
    const makeRequestStub = stub(request, "makeModelRequest").resolves(
      mockResponse as Response,
    );
    await genModel.startChat().sendMessage("hello");
    expect(makeRequestStub).to.have.been.calledWith(
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
          type: SchemaType.OBJECT,
          properties: {
            testField: {
              type: SchemaType.STRING,
            },
          },
        },
      },
      tools: [{ functionDeclarations: [{ name: "myfunc" }] }],
      toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.NONE } },
      systemInstruction: { role: "system", parts: [{ text: "be friendly" }] },
    });
    expect(
      (genModel.generationConfig.responseSchema as ObjectSchema).properties
        .testField,
    ).to.exist;
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
            type: SchemaType.OBJECT,
            properties: {
              newTestField: {
                type: SchemaType.STRING,
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
    expect(makeRequestStub).to.have.been.calledWith(
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
    expect(makeRequestStub).to.not.have.been.called;
    restore();
  });

  // Tests for fine-tuning methods
  describe("fine-tuning methods", () => {
    const apiKey = "test-api-key";

    // Sample data for fine-tuning tests
    const mockListResponse = {
      tunedModels: [
        {
          name: "tunedModels/model1",
          displayName: "Model 1",
          state: TunedModelState.ACTIVE,
          baseModel: "gemini-1.5-flash-001",
          createTime: "2023-01-01T00:00:00Z",
          updateTime: "2023-01-02T00:00:00Z",
        },
        {
          name: "tunedModels/model2",
          displayName: "Model 2",
          state: TunedModelState.CREATING,
          baseModel: "gemini-1.5-flash-001",
          createTime: "2023-01-01T00:00:00Z",
          updateTime: "2023-01-02T00:00:00Z",
        },
      ],
      nextPageToken: "next-page-token",
    };

    const mockModelResponse = {
      name: "tunedModels/test-model",
      displayName: "Test Model",
      baseModel: "gemini-1.5-flash-001",
      state: TunedModelState.ACTIVE,
      createTime: "2023-01-01T00:00:00Z",
      updateTime: "2023-01-02T00:00:00Z",
    };

    const mockCreateResponse = {
      name: "operations/test-operation",
      metadata: {
        completedPercent: 0,
        tunedModel: "tunedModels/new-model",
      },
      done: false,
    };

    const mockOperationResponse = {
      done: true,
      metadata: {
        completedPercent: 100,
        tunedModel: "tunedModels/completed-model",
      },
    };

    it("listTunedModels calls the finetune method with correct parameters", async () => {
      // Arrange
      const genModel = new GenerativeModel("test-api-key", {
        model: "my-model",
      });
      const listStub = stub(finetune, "listTunedModels").resolves(
        mockListResponse,
      );
      const listParams: ListTunedModelsParams = {
        pageSize: 10,
        pageToken: "token",
      };
      const requestOptions = { timeout: 5000 };

      // Act
      const result = await genModel.listTunedModels(listParams, requestOptions);

      // Assert
      expect(listStub).to.have.been.calledWith(
        apiKey,
        listParams,
        requestOptions,
      );
      expect(result).to.equal(mockListResponse);
      expect(result.tunedModels.length).to.equal(2);
      expect(result.nextPageToken).to.equal("next-page-token");
      restore();
    });

    it("listTunedModels works with default parameters", async () => {
      // Arrange
      const genModel = new GenerativeModel("test-api-key", {
        model: "my-model",
      });
      const listStub = stub(finetune, "listTunedModels").resolves(
        mockListResponse,
      );

      // Act
      const result = await genModel.listTunedModels();

      // Assert
      expect(listStub).to.have.been.calledWith(apiKey, undefined, {});
      expect(result).to.equal(mockListResponse);
      restore();
    });

    it("listTunedModels combines requestOptions correctly", async () => {
      // Arrange
      const genModel = new GenerativeModel(
        "test-api-key",
        { model: "my-model" },
        { apiVersion: "v2000" },
      );
      const listStub = stub(finetune, "listTunedModels").resolves(
        mockListResponse,
      );
      const requestOptions = { timeout: 5000 };

      // Act
      await genModel.listTunedModels(undefined, requestOptions);

      // Assert
      expect(listStub).to.have.been.calledWith(
        apiKey,
        undefined,
        match((value) => {
          return value.apiVersion === "v2000" && value.timeout === 5000;
        }),
      );
      restore();
    });

    it("getTunedModel calls the finetune method with correct parameters", async () => {
      // Arrange
      const genModel = new GenerativeModel("test-api-key", {
        model: "my-model",
      });
      const getStub = stub(finetune, "getTunedModel").resolves(
        mockModelResponse,
      );
      const modelName = "test-model";
      const requestOptions = { timeout: 5000 };

      // Act
      const result = await genModel.getTunedModel(modelName, requestOptions);

      // Assert
      expect(getStub).to.have.been.calledWith(
        apiKey,
        modelName,
        requestOptions,
      );
      expect(result).to.equal(mockModelResponse);
      expect(result.name).to.equal("tunedModels/test-model");
      restore();
    });

    it("createTunedModel calls the finetune method with correct parameters", async () => {
      // Arrange
      const genModel = new GenerativeModel("test-api-key", {
        model: "my-model",
      });
      const createStub = stub(finetune, "createTunedModel").resolves(
        mockCreateResponse,
      );
      const requestOptions = { timeout: 15000 };

      const tunedModelParams: CreateTunedModelParams = {
        display_name: "Test Model",
        base_model: "models/gemini-1.5-flash-001",
        tuning_task: {
          hyperparameters: {
            batch_size: 4,
            learning_rate: 0.001,
            epoch_count: 3,
          },
          training_data: {
            examples: {
              examples: [{ text_input: "Hello", output: "Hi there" }],
            },
          },
        },
      };

      // Act
      const result = await genModel.createTunedModel(
        tunedModelParams,
        requestOptions,
      );

      // Assert
      expect(createStub).to.have.been.calledWith(
        apiKey,
        tunedModelParams,
        requestOptions,
      );
      expect(result).to.equal(mockCreateResponse);
      expect(result.name).to.equal("operations/test-operation");
      restore();
    });

    it("deleteTunedModel calls the finetune method with correct parameters", async () => {
      // Arrange
      const genModel = new GenerativeModel("test-api-key", {
        model: "my-model",
      });
      const deleteStub = stub(finetune, "deleteTunedModel").resolves();
      const modelName = "test-model";
      const requestOptions = { timeout: 5000 };

      // Act
      await genModel.deleteTunedModel(modelName, requestOptions);

      // Assert
      expect(deleteStub).to.have.been.calledWith(
        apiKey,
        modelName,
        requestOptions,
      );
      restore();
    });

    it("getTuningOperation calls the finetune method with correct parameters", async () => {
      // Arrange
      const genModel = new GenerativeModel("test-api-key", {
        model: "my-model",
      });
      const getOpStub = stub(finetune, "getTuningOperation").resolves(
        mockOperationResponse,
      );
      const operationName = "test-operation";
      const requestOptions = { timeout: 5000 };

      // Act
      const result = await genModel.getTuningOperation(
        operationName,
        requestOptions,
      );

      // Assert
      expect(getOpStub).to.have.been.calledWith(
        apiKey,
        operationName,
        requestOptions,
      );
      expect(result).to.equal(mockOperationResponse);
      expect(result.done).to.be.true;
      restore();
    });
  });
});
