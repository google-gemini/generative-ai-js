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

import { expect } from "chai";
import { describe, it, beforeEach, afterEach } from "mocha";
import { SinonStub, stub, useFakeTimers, SinonFakeTimers } from "sinon";
import * as generateContentModule from "../methods/generate-content";
import { GenerativeModel } from "./generative-model";
import { StreamCallbacks } from "../../types";

describe("GenerativeModel streamCallbacks", () => {
  let generateContentStreamStub: SinonStub;
  let mockStream: AsyncGenerator<any, void, unknown>;
  let mockResponse: Promise<any>;
  let clock: SinonFakeTimers;
  
  beforeEach(() => {
    clock = useFakeTimers();
    
    // Mock the response and stream
    const mockText = "This is a test response";
    const textChunks = ["This ", "is ", "a ", "test ", "response"];
    
    mockStream = (async function* () {
      for (const chunk of textChunks) {
        yield {
          text: () => chunk,
          candidates: [{ content: { parts: [{ text: chunk }] } }]
        };
      }
    })();
    
    mockResponse = Promise.resolve({
      text: () => mockText,
      candidates: [{ content: { parts: [{ text: mockText }] } }]
    });
    
    // Stub the generateContentStream method
    generateContentStreamStub = stub(
      generateContentModule,
      "generateContentStream"
    ).resolves({
      stream: mockStream,
      response: mockResponse
    });
  });
  
  afterEach(() => {
    generateContentStreamStub.restore();
    clock.restore();
  });
  
  it("should call onData for each chunk", async () => {
    const model = new GenerativeModel({
      model: "gemini-pro",
      apiKey: "test-api-key"
    });
    
    const chunks: string[] = [];
    const streamCallbacks: StreamCallbacks = {
      onData: (chunk) => chunks.push(chunk)
    };
    
    const result = await model.generateContentStream(
      "Test prompt",
      {},
      streamCallbacks
    );
    
    // Consume the stream
    for await (const _ of result.stream) {
      // Do nothing, just consume
    }
    
    expect(chunks).to.deep.equal(["This ", "is ", "a ", "test ", "response"]);
  });
  
  it("should call onDone with full text when streaming completes", async () => {
    const model = new GenerativeModel({
      model: "gemini-pro",
      apiKey: "test-api-key"
    });
    
    let doneText = "";
    const streamCallbacks: StreamCallbacks = {
      onData: () => {},
      onDone: (fullText) => { doneText = fullText; }
    };
    
    const result = await model.generateContentStream(
      "Test prompt",
      {},
      streamCallbacks
    );
    
    // Consume the stream
    for await (const _ of result.stream) {
      // Do nothing, just consume
    }
    
    expect(doneText).to.equal("This is a test response");
  });
  
  it("should call only onDone when onData is not provided", async () => {
    const model = new GenerativeModel({
      model: "gemini-pro",
      apiKey: "test-api-key"
    });
    
    let doneText = "";
    const streamCallbacks: StreamCallbacks = {
      onDone: (fullText) => { doneText = fullText; }
    };
    
    await model.generateContentStream(
      "Test prompt",
      {},
      streamCallbacks
    );
    
    // Resolve the response promise
    await mockResponse;
    
    expect(doneText).to.equal("This is a test response");
  });
  
  it("should not modify the result when streamCallbacks are not provided", async () => {
    const model = new GenerativeModel({
      model: "gemini-pro",
      apiKey: "test-api-key"
    });
    
    const result = await model.generateContentStream("Test prompt");
    
    // Verify that the result has the expected structure
    expect(result).to.have.property("stream");
    expect(result).to.have.property("response");
    
    // Verify that the generateContentStream was called with expected parameters
    expect(generateContentStreamStub.callCount).to.equal(1);
    expect(generateContentStreamStub.firstCall.args[2]).to.deep.include({
      contents: [{ role: "user", parts: [{ text: "Test prompt" }] }]
    });
  });
}); 