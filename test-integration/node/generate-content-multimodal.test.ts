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

import * as fs from "fs";
import { join } from "path";

import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "../..";

use(chaiAsPromised);

/**
 * Integration tests against live backend.
 */

describe("generateContent - multimodal", function () {
  this.timeout(60e3);
  this.slow(10e3);
  it("non-streaming, image buffer provided", async () => {
    const imageBuffer = fs.readFileSync(
      join(__dirname, "../../test-utils/cat.png"),
    );
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const base64Image = imageBuffer.toString("base64");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: "Is it a cat?" },
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Image,
              },
            },
          ],
        },
      ],
    });
    const response = result.response;
    expect(response.text()).to.not.be.empty;
  });
});
