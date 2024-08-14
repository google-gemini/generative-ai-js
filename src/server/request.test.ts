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
import { match, restore, stub } from "sinon";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { DEFAULT_API_VERSION, DEFAULT_BASE_URL } from "../requests/request";
import { FilesRequestUrl, makeServerRequest } from "./request";
import { RpcTask } from "./constants";
import { GoogleGenerativeAIFetchError } from "../errors";

use(sinonChai);
use(chaiAsPromised);

describe("Files API - request methods", () => {
  afterEach(() => {
    restore();
  });
  describe("FilesRequestUrl", () => {
    it("includes task, apiVersion, baseURL, upload if upload task", async () => {
      const url = new FilesRequestUrl(RpcTask.UPLOAD, "key", {});
      expect(url.toString()).to.include("/upload");
      expect(url.toString()).to.not.include("key");
      expect(url.toString()).to.include(DEFAULT_API_VERSION);
      expect(url.toString()).to.include(DEFAULT_BASE_URL);
    });
    it("includes task, apiVersion, baseURL, no upload if non-upload task", async () => {
      const url = new FilesRequestUrl(RpcTask.GET, "key", {});
      expect(url.toString()).to.not.include("/upload");
      expect(url.toString()).to.not.include("key");
      expect(url.toString()).to.include(DEFAULT_API_VERSION);
      expect(url.toString()).to.include(DEFAULT_BASE_URL);
    });
    it("gets custom apiVersion", async () => {
      const url = new FilesRequestUrl(RpcTask.GET, "key", {
        apiVersion: "v2beta",
      });
      expect(url.toString()).to.include("/v2beta/files");
    });
    it("custom baseUrl", async () => {
      const url = new FilesRequestUrl(RpcTask.GET, "key", {
        baseUrl: "http://my.staging.website",
      });
      expect(url.toString()).to.include("http://my.staging.website");
    });
    it("adds params", async () => {
      const url = new FilesRequestUrl(RpcTask.GET, "key", {});
      url.appendParam("param1", "value1");
      expect(url.toString()).to.include("?param1=value1");
    });
    it("adds path segments", async () => {
      const url = new FilesRequestUrl(RpcTask.GET, "key", {});
      url.appendPath("newpath");
      expect(url.toString()).to.match(/\/newpath$/);
    });
  });
  describe("makeFilesRequest", () => {
    it("upload - ok", async () => {
      const fetchStub = stub().resolves({
        ok: true,
      } as Response);
      const url = new FilesRequestUrl(RpcTask.UPLOAD, "key");
      const headers = new Headers();
      const response = await makeServerRequest(
        url,
        headers,
        new Blob(),
        fetchStub as typeof fetch,
      );
      expect(fetchStub).to.be.calledWith(match.string, {
        method: "POST",
        headers: match.instanceOf(Headers),
        body: match.instanceOf(Blob),
      });
      expect(response.ok).to.be.true;
    });
    it("error with timeout", async () => {
      const fetchStub = stub().resolves({
        ok: false,
        status: 500,
        statusText: "AbortError",
      } as Response);

      const url = new FilesRequestUrl(RpcTask.GET, "key", { timeout: 0 });
      const headers = new Headers();
      try {
        await makeServerRequest(
          url,
          headers,
          new Blob(),
          fetchStub as typeof fetch,
        );
      } catch (e) {
        expect((e as GoogleGenerativeAIFetchError).message).to.include(
          "500 AbortError",
        );
        expect((e as GoogleGenerativeAIFetchError).status).to.equal(500);
        expect((e as GoogleGenerativeAIFetchError).statusText).to.equal(
          "AbortError",
        );
      }
      expect(fetchStub).to.be.calledOnce;
    });
    it("Network error, no response.json()", async () => {
      const fetchStub = stub().resolves({
        ok: false,
        status: 500,
        statusText: "Server Error",
      } as Response);
      const url = new FilesRequestUrl(RpcTask.GET, "key");
      const headers = new Headers();
      try {
        await makeServerRequest(
          url,
          headers,
          new Blob(),
          fetchStub as typeof fetch,
        );
      } catch (e) {
        expect((e as GoogleGenerativeAIFetchError).message).to.include(
          "500 Server Error",
        );
        expect((e as GoogleGenerativeAIFetchError).status).to.equal(500);
        expect((e as GoogleGenerativeAIFetchError).statusText).to.equal(
          "Server Error",
        );
      }
      expect(fetchStub).to.be.calledOnce;
    });
    it("Network error, includes response.json()", async () => {
      const fetchStub = stub().resolves({
        ok: false,
        status: 500,
        statusText: "Server Error",
        json: () => Promise.resolve({ error: { message: "extra info" } }),
      } as Response);
      const url = new FilesRequestUrl(RpcTask.GET, "key");
      const headers = new Headers();
      try {
        await makeServerRequest(
          url,
          headers,
          new Blob(),
          fetchStub as typeof fetch,
        );
      } catch (e) {
        expect((e as GoogleGenerativeAIFetchError).message).to.match(
          /500 Server Error.+extra info/,
        );
        expect((e as GoogleGenerativeAIFetchError).status).to.equal(500);
        expect((e as GoogleGenerativeAIFetchError).statusText).to.equal(
          "Server Error",
        );
      }
      expect(fetchStub).to.be.calledOnce;
    });
    it("Network error, includes response.json() and details", async () => {
      const fetchStub = stub().resolves({
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
      const url = new FilesRequestUrl(RpcTask.GET, "key");
      const headers = new Headers();
      try {
        await makeServerRequest(
          url,
          headers,
          new Blob(),
          fetchStub as typeof fetch,
        );
      } catch (e) {
        expect((e as GoogleGenerativeAIFetchError).message).to.match(
          /500 Server Error.*extra info.*generic::invalid_argument/,
        );
        expect((e as GoogleGenerativeAIFetchError).status).to.equal(500);
        expect((e as GoogleGenerativeAIFetchError).statusText).to.equal(
          "Server Error",
        );
        expect(
          (e as GoogleGenerativeAIFetchError).errorDetails[0].detail,
        ).to.include("generic::invalid_argument");
      }
      expect(fetchStub).to.be.calledOnce;
    });
  });
});
