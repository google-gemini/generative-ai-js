/**
 * @license
 * Copyright 2023 Google LLC
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
import { restore, stub } from "sinon";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { Task, getUrl, makeRequest } from "./request";

use(sinonChai);
use(chaiAsPromised);

describe("request methods", () => {
  afterEach(() => {
    restore();
  });
  describe("getUrl", () => {
    it("stream", async () => {
      const url = getUrl("model-name", Task.GENERATE_CONTENT, "key", true);
      expect(url).to.include("generateContent");
      expect(url).to.include("alt=sse");
    });
    it("non-stream", async () => {
      const url = getUrl("model-name", Task.GENERATE_CONTENT, "key", false);
      expect(url).to.include("generateContent");
      expect(url).to.not.include("alt=sse");
    });
  });
  describe("makeRequest", () => {
    it("no error", async () => {
      const fetchStub = stub(globalThis, "fetch").resolves({
        ok: true,
      } as Response);
      const response = await makeRequest("url", "");
      expect(fetchStub).to.be.calledOnce;
      expect(response.ok).to.be.true;
    });
    it("Network error, no response.json()", async () => {
      const fetchStub = stub(globalThis, "fetch").resolves({
        ok: false,
        status: 500,
        statusText: "Server Error",
      } as Response);
      await expect(makeRequest("url", "")).to.be.rejectedWith(
        "500 Server Error",
      );
      expect(fetchStub).to.be.calledOnce;
    });
    it("Network error, includes response.json()", async () => {
      const fetchStub = stub(globalThis, "fetch").resolves({
        ok: false,
        status: 500,
        statusText: "Server Error",
        json: () => Promise.resolve({ error: { message: "extra info" } }),
      } as Response);
      await expect(makeRequest("url", "")).to.be.rejectedWith(
        /500 Server Error.*extra info/,
      );
      expect(fetchStub).to.be.calledOnce;
    });
    it("Network error, includes response.json() and details", async () => {
      const fetchStub = stub(globalThis, "fetch").resolves({
        ok: false,
        status: 500,
        statusText: "Server Error",
        json: () =>
          Promise.resolve({
            error: {
              message: "extra info",
              details: [
                {
                  "@type": "type.googleapis.com/google.rpc.DebugInfo",
                  detail:
                    "[ORIGINAL ERROR] generic::invalid_argument: invalid status photos.thumbnailer.Status.Code::5: Source image 0 too short",
                },
              ],
            },
          }),
      } as Response);
      await expect(makeRequest("url", "")).to.be.rejectedWith(
        /500 Server Error.*extra info.*generic::invalid_argument/,
      );
      expect(fetchStub).to.be.calledOnce;
    });
  });
});
