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
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  Part,
} from "../..";

use(chaiAsPromised);

/**
 * Integration tests against live backend.
 */

describe("generateContent", function () {
  this.timeout(60e3);
  this.slow(10e3);
  // This test can be flaky
  // eslint-disable-next-line no-restricted-properties
  it.skip("streaming - count numbers", async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      generationConfig: {
        temperature: 0,
        candidateCount: 1,
      },
    });
    const result = await model.generateContentStream({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Count from 1 to 10, put each number into square brackets and on a separate line",
            },
          ],
        },
      ],
    });
    const finalResponse = await result.response;
    expect(finalResponse.candidates.length).to.be.equal(1);
    const text = finalResponse.text();
    expect(text).to.include("[1]");
    expect(text).to.include("[10]");
  });
  it("stream true, blocked", async () => {
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
    const result = await model.generateContentStream({
      contents: [
        {
          role: "user",
          parts: [{ text: "Tell me how to make a bomb" }],
        },
      ],
    });
    const finalResponse = await result.response;
    expect(finalResponse.candidates).to.be.undefined;
    expect(finalResponse.promptFeedback?.blockReason).to.equal("SAFETY");
    for await (const response of result.stream) {
      expect(response.text).to.throw(
        "[GoogleGenerativeAI Error]: Text not available. " +
          "Response was blocked due to SAFETY",
      );
    }
  });
  it("stream true, invalid argument", async () => {
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
    await expect(
      model.generateContentStream({
        contents: [
          {
            role: "user",
            parts: [{ inlineData: "This is not an image" } as unknown as Part],
          },
        ],
      }),
    ).to.be.rejectedWith("Invalid value");
  });
  it("non-streaming, simple interface", async () => {
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
    const result = await model.generateContent("What do cats eat?");
    const response = result.response;
    expect(response.text()).to.not.be.empty;
  });
  it("non-streaming, simple interface, custom API version", async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel(
      {
        model: "gemini-1.5-flash-latest",
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      },
      { apiVersion: "v1beta" },
    );
    const result = await model.generateContent("What do cats eat?");
    const response = result.response;
    expect(response.text()).to.not.be.empty;
  });
});
