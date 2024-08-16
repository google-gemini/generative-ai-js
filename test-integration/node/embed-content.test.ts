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

describe("embedContent", function () {
  this.timeout(60e3);
  this.slow(10e3);
  it("embeds a single Content object", async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "embedding-001",
    });
    const response1 = await model.embedContent("embed me");
    const response2 = await model.embedContent({
      content: { role: "user", parts: [{ text: "embed me" }] },
    });
    expect(response1.embedding).to.not.be.empty;
    expect(response1).to.eql(response2);
  });
});
