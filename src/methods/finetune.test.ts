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
import { restore, stub } from "sinon";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import {
  createTunedModel,
  deleteTunedModel,
  getTunedModel,
  getTuningOperation,
  listTunedModels,
} from "./finetune";
import { GoogleAITunedModelManager } from "../server/tuned-model-manager";
import { TunedModelState } from "../../types/tune-model";

use(sinonChai);
use(chaiAsPromised);

describe("finetune", () => {
  const apiKey = "test-api-key";
  const modelName = "test-model";
  const operationName = "test-operation";

  // Sample data for testing
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

  afterEach(() => {
    restore();
  });

  describe("listTunedModels", () => {
    it("calls the TunedModelManager with correct parameters", async () => {
      // Arrange
      const listStub = stub(
        GoogleAITunedModelManager.prototype,
        "listTunedModels",
      ).resolves(mockListResponse);
      const listParams = { pageSize: 10, pageToken: "token" };
      const requestOptions = { timeout: 5000 };

      // Act
      const result = await listTunedModels(apiKey, listParams, requestOptions);

      // Assert
      expect(listStub).to.have.been.calledWith(listParams, requestOptions);
      expect(result).to.equal(mockListResponse);
      expect(result.tunedModels.length).to.equal(2);
      expect(result.nextPageToken).to.equal("next-page-token");
    });

    it("works with default parameters", async () => {
      // Arrange
      const listStub = stub(
        GoogleAITunedModelManager.prototype,
        "listTunedModels",
      ).resolves(mockListResponse);

      // Act
      const result = await listTunedModels(apiKey);

      // Assert
      expect(listStub).to.have.been.calledWith(undefined, {});
      expect(result).to.equal(mockListResponse);
    });
  });

  describe("getTunedModel", () => {
    it("calls the TunedModelManager with correct parameters", async () => {
      // Arrange
      const getStub = stub(
        GoogleAITunedModelManager.prototype,
        "getTunedModel",
      ).resolves(mockModelResponse);
      const requestOptions = { timeout: 5000 };

      // Act
      const result = await getTunedModel(apiKey, modelName, requestOptions);

      // Assert
      expect(getStub).to.have.been.calledWith(modelName, requestOptions);
      expect(result).to.equal(mockModelResponse);
      expect(result.name).to.equal("tunedModels/test-model");
    });

    it("works with default parameters", async () => {
      // Arrange
      const getStub = stub(
        GoogleAITunedModelManager.prototype,
        "getTunedModel",
      ).resolves(mockModelResponse);

      // Act
      const result = await getTunedModel(apiKey, modelName);

      // Assert
      expect(getStub).to.have.been.calledWith(modelName, {});
      expect(result).to.equal(mockModelResponse);
    });
  });

  describe("createTunedModel", () => {
    it("calls the TunedModelManager with correct parameters", async () => {
      // Arrange
      const createStub = stub(
        GoogleAITunedModelManager.prototype,
        "createTunedModel",
      ).resolves(mockCreateResponse);
      const requestOptions = { timeout: 15000 };

      const tunedModelParams = {
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
      const result = await createTunedModel(
        apiKey,
        tunedModelParams,
        requestOptions,
      );

      // Assert
      expect(createStub).to.have.been.calledWith(
        tunedModelParams,
        requestOptions,
      );
      expect(result).to.equal(mockCreateResponse);
      expect(result.name).to.equal("operations/test-operation");
    });

    it("works with default parameters", async () => {
      // Arrange
      const createStub = stub(
        GoogleAITunedModelManager.prototype,
        "createTunedModel",
      ).resolves(mockCreateResponse);

      const tunedModelParams = {
        display_name: "Test Model",
        base_model: "models/gemini-1.5-flash-001",
        tuning_task: {
          training_data: {
            examples: {
              examples: [{ text_input: "Input", output: "Output" }],
            },
          },
        },
      };

      // Act
      const result = await createTunedModel(apiKey, tunedModelParams);

      // Assert
      expect(createStub).to.have.been.calledWith(tunedModelParams, {});
      expect(result).to.equal(mockCreateResponse);
    });
  });

  describe("deleteTunedModel", () => {
    it("calls the TunedModelManager with correct parameters", async () => {
      // Arrange
      const deleteStub = stub(
        GoogleAITunedModelManager.prototype,
        "deleteTunedModel",
      ).resolves();
      const requestOptions = { timeout: 5000 };

      // Act
      await deleteTunedModel(apiKey, modelName, requestOptions);

      // Assert
      expect(deleteStub).to.have.been.calledWith(modelName, requestOptions);
    });

    it("works with default parameters", async () => {
      // Arrange
      const deleteStub = stub(
        GoogleAITunedModelManager.prototype,
        "deleteTunedModel",
      ).resolves();

      // Act
      await deleteTunedModel(apiKey, modelName);

      // Assert
      expect(deleteStub).to.have.been.calledWith(modelName, {});
    });
  });

  describe("getTuningOperation", () => {
    it("calls the TunedModelManager with correct parameters", async () => {
      // Arrange
      const getOpStub = stub(
        GoogleAITunedModelManager.prototype,
        "getOperation",
      ).resolves(mockOperationResponse);
      const requestOptions = { timeout: 5000 };

      // Act
      const result = await getTuningOperation(
        apiKey,
        operationName,
        requestOptions,
      );

      // Assert
      expect(getOpStub).to.have.been.calledWith(operationName, requestOptions);
      expect(result).to.equal(mockOperationResponse);
      expect(result.done).to.equal(true);
    });

    it("works with default parameters", async () => {
      // Arrange
      const getOpStub = stub(
        GoogleAITunedModelManager.prototype,
        "getOperation",
      ).resolves(mockOperationResponse);

      // Act
      const result = await getTuningOperation(apiKey, operationName);

      // Assert
      expect(getOpStub).to.have.been.calledWith(operationName, {});
      expect(result).to.equal(mockOperationResponse);
    });
  });
});
