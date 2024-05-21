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
import { SingleRequestOptions } from "../..";
import { GoogleAIFileManager } from "../../dist/files";

use(chaiAsPromised);

/**
 * Integration tests against live backend.
 */
describe("signal", function () {
  this.timeout(60e3);
  this.slow(10e3);
  it("file manager uploadFile abort test", async () => {
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    const filePathInService = "signal.jpg";

    // This delete step should cleanup the state of the service for this and
    // future executions.
    try {
      await fileManager.deleteFile("files/signal");
    } catch (error) {}

    const signal = AbortSignal.timeout(1);
    const promise = fileManager.uploadFile(
      "test-utils/cat.jpeg",
      {
        mimeType: "image/jpeg",
        name: filePathInService,
      },
      {
        signal,
      },
    );
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });
  it("file manager listFiles abort test", async () => {
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    const signal = AbortSignal.timeout(1);
    const requestOptions: SingleRequestOptions = { signal };
    const promise = fileManager.listFiles(/* listParams= */ {}, requestOptions);
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });
  it("file manager getFile abort test", async () => {
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    const signal = AbortSignal.timeout(1);
    const requestOptions: SingleRequestOptions = { signal };
    const promise = fileManager.getFile("signal.jpg", requestOptions);
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });
  it("file manager deleteFile abort test", async () => {
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    const signal = AbortSignal.timeout(1);
    const requestOptions: SingleRequestOptions = { signal };
    const promise = fileManager.deleteFile("signal.jpg", requestOptions);
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });
});
