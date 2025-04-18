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
import { GoogleGenerativeAI } from "../..";

use(chaiAsPromised);

/**
 * Integration tests against live backend.
 */

describe("generateImage", function () {
  this.timeout(60e3);
  this.slow(20e3);
  it("non-streaming, simple interface", async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getImageGenerationModel({
      model: "imagen-3.0-generate-001",
    });
    const result = await model.generateImages("A fluffy cat");
    expect(result.images.length).equals(1);
  });
});
