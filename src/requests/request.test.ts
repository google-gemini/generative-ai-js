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
import {
  DEFAULT_API_VERSION,
  DEFAULT_BASE_URL,
  RequestUrl,
  Task,
  constructBackwardCompatibleRequest,
  constructModelRequest,
  makeModelRequest,
} from "./request";
import {
  GoogleGenerativeAIAbortError,
  GoogleGenerativeAIFetchError,
  GoogleGenerativeAIRequestInputError,
} from "../errors";
import { RequestMethodType } from "../../types";

use(sinonChai);
use(chaiAsPromised);

describe("request methods", () => {
  afterEach(() => {
    restore();
  });
  describe("RequestUrl", () => {
    it("stream", async () => {
      const url = new RequestUrl(
        "models/model-name",
        Task.GENERATE_CONTENT,
        "key",
        true,
        {},
      );
      expect(url.toString()).to.include("models/model-name:generateContent");
      expect(url.toString()).to.not.include("key");
      expect(url.toString()).to.include("alt=sse");
    });
    it("non-stream", async () => {
      const url = new RequestUrl(
        "models/model-name",
        Task.GENERATE_CONTENT,
        "key",
        false,
        {},
      );
      expect(url.toString()).to.include("models/model-name:generateContent");
      expect(url.toString()).to.not.include("key");
      expect(url.toString()).to.not.include("alt=sse");
    });
    it("default apiVersion and baseUrl", async () => {
      const url = new RequestUrl(
        "models/model-name",
        Task.GENERATE_CONTENT,
        "key",
        false,
        {},
      );
      expect(url.toString()).to.include(DEFAULT_API_VERSION);
      expect(url.toString()).to.include(DEFAULT_BASE_URL);
    });
    it("custom apiVersion", async () => {
      const url = new RequestUrl(
        "models/model-name",
        Task.GENERATE_CONTENT,
        "key",
        false,
        { apiVersion: "v2beta" },
      );
      expect(url.toString()).to.include("/v2beta/models/model-name");
    });
    it("custom baseUrl", async () => {
      const url = new RequestUrl(
        "models/model-name",
        Task.GENERATE_CONTENT,
        "key",
        false,
        { baseUrl: "http://my.staging.website" },
      );
      expect(url.toString()).to.include("http://my.staging.website");
    });
    it("non-stream - tunedModels/", async () => {
      const url = new RequestUrl(
        "tunedModels/model-name",
        Task.GENERATE_CONTENT,
        "key",
        false,
        {},
      );
      expect(url.toString()).to.include(
        "tunedModels/model-name:generateContent",
      );
      expect(url.toString()).to.not.include("key");
      expect(url.toString()).to.not.include("alt=sse");
    });
  });
  describe("constructRequest", () => {
    it("handles basic request", async () => {
      const request = await constructModelRequest(
        "model-name",
        Task.GENERATE_CONTENT,
        "key",
        true,
        "",
        {},
      );
      expect(
        (request.fetchOptions.headers as Headers).get("x-goog-api-client"),
      ).to.equal("genai-js/__PACKAGE_VERSION__");
      expect(
        (request.fetchOptions.headers as Headers).get("x-goog-api-key"),
      ).to.equal("key");
      expect(
        (request.fetchOptions.headers as Headers).get("Content-Type"),
      ).to.equal("application/json");
    });
    it("passes apiClient", async () => {
      const request = await constructModelRequest(
        "model-name",
        Task.GENERATE_CONTENT,
        "key",
        true,
        "",
        {
          apiClient: "client/version",
        },
      );
      expect(
        (request.fetchOptions.headers as Headers).get("x-goog-api-client"),
      ).to.equal("client/version genai-js/__PACKAGE_VERSION__");
    });
    it("passes timeout", async () => {
      const request = await constructModelRequest(
        "model-name",
        Task.GENERATE_CONTENT,
        "key",
        true,
        "",
        {
          timeout: 5000,
        },
      );
      expect(request.fetchOptions.signal).to.be.instanceOf(AbortSignal);
    });
    it("passes custom headers", async () => {
      const request = await constructModelRequest(
        "model-name",
        Task.GENERATE_CONTENT,
        "key",
        true,
        "",
        {
          customHeaders: new Headers({ customerHeader: "customerHeaderValue" }),
        },
      );
      expect(
        (request.fetchOptions.headers as Headers).get("customerHeader"),
      ).to.equal("customerHeaderValue");
    });
    it("passes custom x-goog-api-client header", async () => {
      await expect(
        constructModelRequest(
          "model-name",
          Task.GENERATE_CONTENT,
          "key",
          true,
          "",
          {
            customHeaders: new Headers({
              "x-goog-api-client": "client/version",
            }),
          },
        ),
      ).to.be.rejectedWith(GoogleGenerativeAIRequestInputError);
    });
    it("passes apiClient and custom x-goog-api-client header", async () => {
      await expect(
        constructModelRequest(
          "model-name",
          Task.GENERATE_CONTENT,
          "key",
          true,
          "",
          {
            apiClient: "client/version",
            customHeaders: new Headers({
              "x-goog-api-client": "client/version2",
            }),
          },
        ),
      ).to.be.rejectedWith(GoogleGenerativeAIRequestInputError);
    });
  });
  describe("makeModelRequest", () => {
    it("no error", async () => {
      const fetchStub = stub().resolves({
        ok: true,
      } as Response);
      const response = await makeModelRequest(
        "model-name",
        Task.GENERATE_CONTENT,
        "key",
        true,
        "",
        {},
        fetchStub as typeof fetch,
      );
      expect(fetchStub).to.be.calledWith(match.string, {
        method: "POST",
        headers: match.instanceOf(Headers),
        body: "",
      });
      expect(response.ok).to.be.true;
    });
    it("error with local timeout", async () => {
      const abortError = new DOMException("Request timeout.", "AbortError");
      const fetchStub = stub().rejects(abortError);

      try {
        await makeModelRequest(
          "model-name",
          Task.GENERATE_CONTENT,
          "key",
          true,
          "",
          {
            timeout: 100,
          },
          fetchStub as typeof fetch,
        );
      } catch (e) {
        expect((e as GoogleGenerativeAIAbortError).message).to.include(
          "Request aborted",
        );
      }
      expect(fetchStub).to.be.calledOnce;
    });
    it("error with server timeout", async () => {
      const fetchStub = stub().resolves({
        ok: false,
        status: 500,
        statusText: "AbortError",
      } as Response);

      try {
        await makeModelRequest(
          "model-name",
          Task.GENERATE_CONTENT,
          "key",
          true,
          "",
          {
            timeout: 0,
          },
          fetchStub as typeof fetch,
        );
      } catch (e) {
        expect((e as GoogleGenerativeAIFetchError).status).to.equal(500);
        expect((e as GoogleGenerativeAIFetchError).statusText).to.equal(
          "AbortError",
        );
        expect((e as GoogleGenerativeAIFetchError).message).to.include(
          "500 AbortError",
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
      try {
        await makeModelRequest(
          "model-name",
          Task.GENERATE_CONTENT,
          "key",
          true,
          "",
          {},
          fetchStub as typeof fetch,
        );
      } catch (e) {
        expect((e as GoogleGenerativeAIFetchError).status).to.equal(500);
        expect((e as GoogleGenerativeAIFetchError).statusText).to.equal(
          "Server Error",
        );
        expect((e as GoogleGenerativeAIFetchError).message).to.include(
          "500 Server Error",
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

      try {
        await makeModelRequest(
          "model-name",
          Task.GENERATE_CONTENT,
          "key",
          true,
          "",
          {},
          fetchStub as typeof fetch,
        );
      } catch (e) {
        expect((e as GoogleGenerativeAIFetchError).status).to.equal(500);
        expect((e as GoogleGenerativeAIFetchError).statusText).to.equal(
          "Server Error",
        );
        expect((e as GoogleGenerativeAIFetchError).message).to.match(
          /500 Server Error.*extra info/,
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

      try {
        await makeModelRequest(
          "model-name",
          Task.GENERATE_CONTENT,
          "key",
          true,
          "",
          {},
          fetchStub as typeof fetch,
        );
      } catch (e) {
        expect((e as GoogleGenerativeAIFetchError).status).to.equal(500);
        expect((e as GoogleGenerativeAIFetchError).statusText).to.equal(
          "Server Error",
        );
        expect(
          (e as GoogleGenerativeAIFetchError).errorDetails[0].detail,
        ).to.equal(
          "[ORIGINAL ERROR] generic::invalid_argument: invalid status photos.thumbnailer.Status.Code::5: Source image 0 too short",
        );
        expect((e as GoogleGenerativeAIFetchError).message).to.match(
          /500 Server Error.*extra info.*generic::invalid_argument/,
        );
      }
      expect(fetchStub).to.be.calledOnce;
    });
    it("has invalid custom header", async () => {
      const fetchStub = stub();
      await expect(
        makeModelRequest(
          "model-name",
          Task.GENERATE_CONTENT,
          "key",
          true,
          "",
          {
            customHeaders: new Headers({
              "x-goog-api-client": "client/version",
            }),
          },
          fetchStub as typeof fetch,
        ),
      ).to.be.rejectedWith(GoogleGenerativeAIRequestInputError);
    });
  });

  describe("constructBackwardCompatibleRequest", () => {

    it("should use toString() when model is provided", async () => {
      const task = Task.GENERATE_CONTENT;
      const apiKey = "test-key";
      const stream = true;
      const body = '{"input": "test"}';
      const requestOptions = {};
      const queryParams = { q: "value" };
      const model = "models/model-name";
  
      const { url, fetchOptions } = await constructBackwardCompatibleRequest(
        task,
        apiKey,
        stream,
        body,
        requestOptions,
        queryParams,
        model
      );
  
      // Since a model is provided, URL should include the model segment and task
      expect(url).to.include("models/model-name:generateContent");
  
      // As method defaults to POST if not set, queryParams should not be appended.
      expect(url).to.not.include("q=value");
  
      // The body is attached for non-GET (POST) requests.
      expect(fetchOptions.body).to.equal(body);
    });
  
    it("should use toStringWithoutModel() when model is omitted", async () => {
      const task = Task.GENERATE_CONTENT;
      const apiKey = "test-key";
      const stream = false;
      const body = '{"input": "test"}';
      const requestOptions = {};
      const queryParams = { foo: "bar" };
  
      // Call without a model.
      const { url, fetchOptions } = await constructBackwardCompatibleRequest(
        task,
        apiKey,
        stream,
        body,
        requestOptions,
        queryParams,
        undefined
      );
  
      // The URL should not include a model segment.
      expect(url).to.not.match(/\/models\//);
      // But should include the API version and baseUrl.
      expect(url).to.include("v1beta");
      expect(url).to.include("https://generativelanguage.googleapis.com");
  
      // Since no method is provided, defaults to POST and thus query parameters are not appended.
      expect(url).to.not.include("foo=bar");
  
      // The body should be attached.
      expect(fetchOptions.body).to.equal(body);
    });
  
    it("should append query parameters for GET requests", async () => {
      const task = Task.COUNT_TOKENS;
      const apiKey = "test-key";
      const stream = false;
      const body = '{"input": "test"}';
      const requestOptions = { method:RequestMethodType.GET };
      const queryParams = { limit: 10, offset: 0 };
      const model = "models/count-model";
  
      const { url, fetchOptions } = await constructBackwardCompatibleRequest(
        task,
        apiKey,
        stream,
        body,
        requestOptions,
        queryParams,
        model
      );
  
      // For GET requests, query parameters should be appended to the URL.
      console.log(url);
      expect(url).to.include("limit=10");
      expect(url).to.include("offset=0");
      
      // For GET requests, no body is attached.
      expect(fetchOptions.body).to.be.undefined;
      expect(fetchOptions.method).to.equal("GET");
    });
  
    it("should not append query parameters if none are provided for GET", async () => {
      const task = Task.EMBED_CONTENT;
      const apiKey = "test-key";
      const stream = false;
      const body = '{"input": "test"}';
      const requestOptions = { method: RequestMethodType.GET };
      const model = "models/embed-model";
  
      const { url, fetchOptions } = await constructBackwardCompatibleRequest(
        task,
        apiKey,
        stream,
        body,
        requestOptions,
        undefined,
        model
      );
  
      // URL should not have a query string added beyond what toString() returns.
      expect(url).to.not.include("?");
      // GET request should not attach a body.
      expect(fetchOptions.body).to.be.undefined;
      expect(fetchOptions.method).to.equal("GET");
    });
  
    it("should attach body for non-GET requests even if query parameters are provided", async () => {
      const task = Task.EMBED_CONTENT;
      const apiKey = "test-key";
      const stream = false;
      const body = '{"input": "test"}';
      // Explicitly using POST method
      const requestOptions = { method: RequestMethodType.POST };
      const queryParams = { extra: "param" };
      const model = "models/embed-model";
  
      const { url, fetchOptions } = await constructBackwardCompatibleRequest(
        task,
        apiKey,
        stream,
        body,
        requestOptions,
        queryParams,
        model
      );
  
      // For non-GET methods, query parameters should not be appended to the URL.
      expect(url).to.not.include("extra=param");
  
      // The body should be attached.
      expect(fetchOptions.body).to.equal(body);
      expect(fetchOptions.method).to.equal("POST");
    });
  
    it("should merge custom headers and standard headers", async () => {
      const task = Task.GENERATE_CONTENT;
      const apiKey = "test-key";
      const stream = false;
      const body = '{"input": "test"}';
      const requestOptions = {
        customHeaders: new Headers({ "custom-header": "customValue" }),
      };
      const model = "models/model-name";
  
      const { fetchOptions } = await constructBackwardCompatibleRequest(
        task,
        apiKey,
        stream,
        body,
        requestOptions,
        undefined,
        model
      );
  
      const headers = fetchOptions.headers as Headers;
      expect(headers.get("Content-Type")).to.equal("application/json");
      expect(headers.get("x-goog-api-key")).to.equal(apiKey);
      expect(headers.get("custom-header")).to.equal("customValue");
    });
  });  
});
