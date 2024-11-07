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
import { GenerateSpeechRequest, GenerateSpeechResponse } from "../../types";
import { generateSpeech } from "./generate-speech";

use(sinonChai);
use(chaiAsPromised);

const fakeRequestParams: GenerateSpeechRequest = {
    turns: [
        {text: "abc"}
    ],
    audioConfig: {
        responseMimeType: 'audio/wav',
        speed: 2
    }
};

describe("generateSpeech()", () => {
  afterEach(() => {
    restore();
  });
  it("Unary success", async () => {
    const mockResponse = getMockResponse("unary-success-generate-speech.json");
    const makeRequestStub = stub(request, "makeModelRequest").resolves(
      mockResponse as Response,
    );
    const expectedSpeechGenerationResponse: GenerateSpeechResponse = {
        inlineData: {
            data: "123",
            mimeType: "audio/wav"
        }
    };
    const result = await generateSpeech("key", "model", fakeRequestParams, {});
    expect(makeRequestStub).to.be.calledWith(
      "model",
      request.Task.GENERATE_SPEECH,
      "key",
      false,
      match.any,
    );
    assert.equal(
      JSON.stringify(result),
      JSON.stringify(expectedSpeechGenerationResponse),
    );
  });
});
