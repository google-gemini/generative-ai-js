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

import { assert, expect, use } from "chai";
import { match, restore, stub } from "sinon";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { getMockResponse } from "../../test-utils/mock-response";
import * as request from "../requests/request";
import {
  ImageGenerationRequest,
  ImageWatermarkVerificationRequest,
  ImageWatermarkVerificationResponse,
} from "../../types";
import { generateImages, verifyImage } from "./generate-images";

use(sinonChai);
use(chaiAsPromised);

describe("generateImages()", () => {
  afterEach(() => {
    restore();
  });

  const fakeRequestParams: ImageGenerationRequest = {
    prompt: "Create a cat",
    numberOfImages: 1,
    negativePrompt: "Not a dog",
    guidanceScale: 5,
    outputMimeType: "image/png",
    compressionQuality: 12,
    language: "ko",
    safetyFilterLevel: "block_medium_and_above",
    aspectRatio: "1:1",
    width: 512,
    height: 1024,
  };

  it("Unary success", async () => {
    const mockResponse = getMockResponse("unary-generate-images-success.json");
    const makeRequestStub = stub(request, "makeModelRequest").resolves(
      mockResponse as Response,
    );
    const expectedImageGenerationResponse = {
      images: [
        {
          imageBytes: "test-content",
        },
      ],
    };
    const result = await generateImages("key", "model", fakeRequestParams, {});
    expect(makeRequestStub).to.be.calledWith(
      "model",
      request.Task.PREDICT,
      "key",
      false,
      match.any,
    );
    assert.equal(
      JSON.stringify(result),
      JSON.stringify(expectedImageGenerationResponse),
    );
  });
});

describe("verifyImage", () => {
  afterEach(() => {
    restore();
  });
  const fakeRequestParams: ImageWatermarkVerificationRequest = {
    imageBytes: "123",
  };
  it("Accept", async () => {
    const mockResponse = getMockResponse(
      "unary-image-watermark-verification-accept.json",
    );
    const makeRequestStub = stub(request, "makeModelRequest").resolves(
      mockResponse as Response,
    );
    const expectedWatermarkVerificationResponse: ImageWatermarkVerificationResponse =
      {
        decision: "ACCEPT",
      };
    const result = await verifyImage("key", "model", fakeRequestParams, {});
    expect(makeRequestStub).to.be.calledWith(
      "model",
      request.Task.PREDICT,
      "key",
      false,
      match.any,
    );
    assert.equal(
      JSON.stringify(result),
      JSON.stringify(expectedWatermarkVerificationResponse),
    );
  });
});
