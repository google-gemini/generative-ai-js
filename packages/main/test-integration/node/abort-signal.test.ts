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
import { RequestOptions } from "../..";
import { GoogleAIFileManager } from "../../dist/files";

use(chaiAsPromised);

/**
 * Integration tests against live backend.
 */
describe("abortSignal", function () {
  this.timeout(60e3);
  this.slow(10e3);
  it("file manager uploadFile abort test", async () => {
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    const filePathInService = "abortsignal.jpg";

    // This delete step should cleanup the state of the service for this and
    // future executions.
    try {
      await fileManager.deleteFile("files/abortsignal");
    } catch (error) {}

    const abortSignal = AbortSignal.timeout(1);
    const promise = fileManager.uploadFile(
      "test-integration/resources/cat.jpg",
      {
        mimeType: "image/jpeg",
        name: filePathInService,
      },
      {
        abortSignal,
      },
    );
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });
  it("file manager listFiles abort test", async () => {
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    const abortSignal = AbortSignal.timeout(1);
    const requestOptions: RequestOptions = { abortSignal };
    const promise = fileManager.listFiles(/* listParams= */ {}, requestOptions);
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });
  it("file manager getFile abort test", async () => {
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    const abortSignal = AbortSignal.timeout(1);
    const requestOptions: RequestOptions = { abortSignal };
    const promise = fileManager.getFile("abortSignal.jpg", requestOptions);
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });
  it("file manager deleteFile abort test", async () => {
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    const abortSignal = AbortSignal.timeout(1);
    const requestOptions: RequestOptions = { abortSignal };
    const promise = fileManager.deleteFile("abortSignal.jpg", requestOptions);
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });
});
