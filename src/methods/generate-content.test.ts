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
import { generateContent } from "./generate-content";
import {
  GenerateContentRequest,
  HarmBlockThreshold,
  HarmCategory,
} from "../../types";

use(sinonChai);
use(chaiAsPromised);

const fakeRequestParams: GenerateContentRequest = {
  contents: [{ parts: [{ text: "hello" }], role: "user" }],
  generationConfig: {
    topK: 16,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
  ],
};

describe("generateContent()", () => {
  afterEach(() => {
    restore();
  });
  it("short response", async () => {
    const mockResponse = getMockResponse(
      "unary-success-basic-reply-short.json",
    );
    const makeRequestStub = stub(request, "makeModelRequest").resolves(
      mockResponse as Response,
    );
    const result = await generateContent("key", "model", fakeRequestParams);
    expect(result.response.text()).to.include("Helena");
    expect(makeRequestStub).to.be.calledWith(
      "model",
      request.Task.GENERATE_CONTENT,
      "key",
      false,
      match((value: string) => {
        return value.includes("contents");
      }),
    );
  });
  it("long response", async () => {
    const mockResponse = getMockResponse("unary-success-basic-reply-long.json");
    const makeRequestStub = stub(request, "makeModelRequest").resolves(
      mockResponse as Response,
    );
    const result = await generateContent("key", "model", fakeRequestParams);
    expect(result.response.text()).to.include("Use Freshly Ground Coffee");
    expect(result.response.text()).to.include("30 minutes of brewing");
    expect(makeRequestStub).to.be.calledWith(
      "model",
      request.Task.GENERATE_CONTENT,
      "key",
      false,
      match.any,
    );
  });
  it("citations", async () => {
    const mockResponse = getMockResponse("unary-success-citations.json");
    const makeRequestStub = stub(request, "makeModelRequest").resolves(
      mockResponse as Response,
    );
    const result = await generateContent("key", "model", fakeRequestParams);
    expect(result.response.text()).to.include("Quantum mechanics is");
    expect(
      result.response.candidates[0].citationMetadata.citationSources.length,
    ).to.equal(1);
    expect(makeRequestStub).to.be.calledWith(
      "model",
      request.Task.GENERATE_CONTENT,
      "key",
      false,
      match.any,
    );
  });
  it("logprobs", async () => {
    const mockResponse = getMockResponse("unary-success-logprobs.json");
    const makeRequestStub = stub(request, "makeModelRequest").resolves(
      mockResponse as Response,
    );
    const result = await generateContent("key", "model", fakeRequestParams);
    expect(result.response.text()).to.include("Quantum mechanics is");
    expect(result.response.candidates[0].avgLogprobs).to.equal(7.5);
    expect(
      result.response.candidates[0].logprobsResult.topCandidates[0].candidates
        .length,
    ).to.equal(1);
    expect(
      result.response.candidates[0].logprobsResult.chosenCandidates[0]
        .logProbability,
    ).to.equal(0.75);
    expect(
      result.response.candidates[0].citationMetadata.citationSources.length,
    ).to.equal(1);
    expect(makeRequestStub).to.be.calledWith(
      "model",
      request.Task.GENERATE_CONTENT,
      "key",
      false,
      match.any,
    );
  });
  it("blocked prompt", async () => {
    const mockResponse = getMockResponse(
      "unary-failure-prompt-blocked-safety.json",
    );
    const makeRequestStub = stub(request, "makeModelRequest").resolves(
      mockResponse as Response,
    );
    const result = await generateContent("key", "model", fakeRequestParams);
    expect(result.response.text).to.throw("SAFETY");
    expect(makeRequestStub).to.be.calledWith(
      "model",
      request.Task.GENERATE_CONTENT,
      "key",
      false,
      match.any,
    );
  });
  it("finishReason safety", async () => {
    const mockResponse = getMockResponse(
      "unary-failure-finish-reason-safety.json",
    );
    const makeRequestStub = stub(request, "makeModelRequest").resolves(
      mockResponse as Response,
    );
    const result = await generateContent("key", "model", fakeRequestParams);
    expect(result.response.text).to.throw("SAFETY");
    expect(makeRequestStub).to.be.calledWith(
      "model",
      request.Task.GENERATE_CONTENT,
      "key",
      false,
      match.any,
    );
  });
  it("empty content", async () => {
    const mockResponse = getMockResponse("unary-failure-empty-content.json");
    const makeRequestStub = stub(request, "makeModelRequest").resolves(
      mockResponse as Response,
    );
    const result = await generateContent("key", "model", fakeRequestParams);
    expect(result.response.text()).to.equal("");
    expect(makeRequestStub).to.be.calledWith(
      "model",
      request.Task.GENERATE_CONTENT,
      "key",
      false,
      match.any,
    );
  });
  it("unknown enum - should ignore", async () => {
    const mockResponse = getMockResponse("unary-unknown-enum.json");
    const makeRequestStub = stub(request, "makeModelRequest").resolves(
      mockResponse as Response,
    );
    const result = await generateContent("key", "model", fakeRequestParams);
    expect(result.response.text()).to.include("30 minutes of brewing");
    expect(makeRequestStub).to.be.calledWith(
      "model",
      request.Task.GENERATE_CONTENT,
      "key",
      false,
      match.any,
    );
  });
  it("image rejected (400)", async () => {
    const mockResponse = getMockResponse("unary-failure-image-rejected.json");
    const errorJson = await mockResponse.json();
    const makeRequestStub = stub(request, "makeModelRequest").rejects(
      new Error(`[400 ] ${errorJson.error.message}`),
    );
    await expect(
      generateContent("key", "model", fakeRequestParams),
    ).to.be.rejectedWith(/400.*invalid argument/);
    expect(makeRequestStub).to.be.called;
  });
  it("search-grounding", async () => {
    const mockResponse = getMockResponse("unary-success-search-grounding.json");
    const makeRequestStub = stub(request, "makeModelRequest").resolves(
      mockResponse as Response,
    );
    const expectedGroundingMetadata = {
      searchEntryPoint: {
        renderedContent: "test_rendered_content",
      },
      groundingChunks: [
        {
          web: {
            uri: "test_uri_1",
            title: "test_title_1",
          },
        },
        {
          web: {
            uri: "test_uri_2",
            title: "test_title_2",
          },
        },
      ],
      groundingSupports: [
        {
          segment: {
            endIndex: 76,
            text: "The current stock price for Alphabet Inc (Google) Class C (GOOG) is $166.94.",
          },
          groundingChunkIndices: [0, 1],
          confidenceScores: [0.9863024, 0.9863024],
        },
        {
          segment: {
            startIndex: 77,
            endIndex: 135,
            text: "This represents a decrease of -0.88% in the past 24 hours.",
          },
          groundingChunkIndices: [0, 1],
          confidenceScores: [0.98734087, 0.98734087],
        },
        {
          segment: {
            startIndex: 136,
            endIndex: 239,
            text: "Please note that stock prices can fluctuate frequently and this price is valid as of October 2nd, 2024.",
          },
          groundingChunkIndices: [0],
          confidenceScores: [0.6393517],
        },
      ],
      webSearchQueries: ["what is the current google stock price"],
    };
    const result = await generateContent("key", "model", fakeRequestParams);
    expect(makeRequestStub).to.be.calledWith(
      "model",
      request.Task.GENERATE_CONTENT,
      "key",
      false,
      match.any,
    );
    assert.equal(
      JSON.stringify(result.response.candidates[0].groundingMetadata),
      JSON.stringify(expectedGroundingMetadata),
    );
  });
});
