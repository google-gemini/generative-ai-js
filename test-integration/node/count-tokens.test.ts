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
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "../..";
import { CountTokensRequest } from "../../types";

use(chaiAsPromised);

/**
 * Integration tests against live backend.
 */

describe("countTokens", function () {
  this.timeout(60e3);
  this.slow(10e3);
  it("counts tokens right", async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });
    const response1 = await model.countTokens("count me");
    const response2 = await model.countTokens({
      contents: [{ role: "user", parts: [{ text: "count me" }] }],
    });
    expect(response1.totalTokens).to.equal(3);
    expect(response2.totalTokens).to.equal(3);
  });
  it("counts tokens with GenerateContentRequest", async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });
    const countTokensRequest: CountTokensRequest = {
      generateContentRequest: {
        contents: [{ role: "user", parts: [{ text: "count me" }] }],
      },
    };
    const response = await model.countTokens(countTokensRequest);
    expect(response.totalTokens).to.equal(3);
  });
  it("counts tokens with GenerateContentRequest", async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });
    const countTokensRequest: CountTokensRequest = {
      generateContentRequest: {
        contents: [
          {
            role: "user",
            parts: [{ text: "count me again with a different result" }],
          },
        ],
      },
    };
    const response = await model.countTokens(countTokensRequest);
    expect(response.totalTokens).to.equal(8);
  });
});
