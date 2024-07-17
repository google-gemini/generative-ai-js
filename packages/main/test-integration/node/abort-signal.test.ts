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
  RequestOptions,
  SingleRequestOptions,
} from "../..";
import { GoogleAIFileManager } from "../../dist/server";

use(chaiAsPromised);

/**
 * Integration tests against live backend.
 */
describe("signal", function () {
  this.timeout(60e3);
  this.slow(10e3);
  /* GoogleAIFileManager */
  it("GoogleAIFileManager getFile() SingleRequestOption.timeout", async () => {
    // Ensure SingleRequestOptions.timeout takes precendence over the value of
    // RequestOptions.timeout configured at construction. Also, a control test
    // to ensure that timeout still works without an AbortSignal present.
    const requestOptions: RequestOptions = { timeout: 9000 };
    const fileManager = new GoogleAIFileManager(
      process.env.GEMINI_API_KEY,
      requestOptions,
    );
    // Ensure the file isn't hosted on the service.
    try {
      await fileManager.deleteFile("files/signal");
    } catch (error) {}
    const singleRequestOptions: SingleRequestOptions = { timeout: 1 };
    // Use getFile, which should fail with a fetch error since the file
    // doesn't exist. This should let us discern if the error was
    // a timeout abort, or the fetch failure in our expect() below.
    const promise = fileManager.getFile("signal.jpg", singleRequestOptions);
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });
  it("GoogleAIFileManager getFile() aborted", async () => {
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    const signal = AbortSignal.timeout(1);
    const requestOptions: SingleRequestOptions = { signal };
    const promise = fileManager.getFile("signal.jpg", requestOptions);
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });
  it("GoogleAIFileManager getFile() timeout before signal aborts", async () => {
    // Ensure the manually configured timeout works in conjunction with the
    // AbortSignal timeout.
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    // Ensure the file isn't hosted on the service.
    try {
      await fileManager.deleteFile("files/signal");
    } catch (error) {}
    const signal = AbortSignal.timeout(9000);
    const requestOptions: SingleRequestOptions = { timeout: 1, signal };
    const promise = fileManager.getFile("signal.jpg", requestOptions);
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });
  it("GoogleAIFileManager listFiles() aborted", async () => {
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    const signal = AbortSignal.timeout(1);
    const requestOptions: SingleRequestOptions = { signal };
    const promise = fileManager.listFiles(/* listParams= */ {}, requestOptions);
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });
  it("GoogleAIFileManager listFiles() timeout before signal aborts", async () => {
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    const signal = AbortSignal.timeout(9000);
    const requestOptions: SingleRequestOptions = { timeout: 1, signal };
    const promise = fileManager.listFiles(/* listParams= */ {}, requestOptions);
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });

  /* GenerativeModel */
  it("GenerativeModel generateContent() SingleRequestOption.timeout", async () => {
    // Ensure SingleRequestOptions.timeout takes precendence over the value of
    // RequestOptions.timeout configured at construction. Also, a control test
    // to ensure that timeout still works without an AbortSignal present.
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const requestOptions: RequestOptions = {
      timeout: 9000, // This is much longer than a generateContent request.
    };
    const model = genAI.getGenerativeModel(
      {
        model: "gemini-1.5-flash-latest",
      },
      requestOptions,
    );
    const singleRequestOptions: SingleRequestOptions = { timeout: 1 };
    const promise = model.generateContent(
      "This is not an image",
      singleRequestOptions,
    );
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });
  it("GenerativeModel generateContent() aborted", async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });
    const signal = AbortSignal.timeout(1);
    const requestOptions: SingleRequestOptions = { signal };
    const promise = model.generateContent(
      "This is not an image",
      requestOptions,
    );
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });
  it("GenerativeModel generateContent() timeout before signal aborts", async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });
    const signal = AbortSignal.timeout(9000);
    const requestOptions: SingleRequestOptions = { timeout: 1, signal };
    const promise = model.generateContent(
      "This is not an image",
      requestOptions,
    );
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });
  it("GenerativeModel countTokens() aborted", async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });
    const signal = AbortSignal.timeout(1);
    const requestOptions: SingleRequestOptions = { signal };
    const promise = model.countTokens("This is not an image", requestOptions);
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });
  it("GenerativeModel embedContent() aborted", async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });
    const signal = AbortSignal.timeout(1);
    const requestOptions: SingleRequestOptions = { signal };
    const promise = model.embedContent("This is not an image", requestOptions);
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });
  it("GenerativeModel batchEmbedContent() aborted", async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });
    const signal = AbortSignal.timeout(1);
    const requestOptions: SingleRequestOptions = { signal };
    const content1 = {
      content: { role: "user", parts: [{ text: "embed me" }] },
    };
    const content2 = {
      content: { role: "user", parts: [{ text: "embed me" }] },
    };
    const promise = model.batchEmbedContents(
      {
        requests: [content1, content2],
      },
      requestOptions,
    );
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });

  /* ChatSessionManager */
  it("ChatSessionManager sendMessage() SingleRequestOption.timeout", async () => {
    // Ensure SingleRequestOptions.timeout takes precendence over the value of
    // RequestOptions.timeout configured at construction. Also, a control test
    // to ensure that timeout still works without an AbortSignal present.
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const requestOptions: RequestOptions = {
      timeout: 9000, // This is much longer than a generateContent request.
    };
    const model = genAI.getGenerativeModel(
      {
        model: "gemini-1.5-flash-latest",
      },
      requestOptions,
    );
    const question1 = "What is the capital of Oregon?";
    const chat = model.startChat();
    const singleRequestOptions: SingleRequestOptions = { timeout: 1 };
    const promise = chat.sendMessage(question1, singleRequestOptions);
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });
  it("ChatSession sendMessage() aborted", async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });
    const question1 = "What is the capital of Oregon?";
    const chat = model.startChat();
    const signal = AbortSignal.timeout(1);
    const requestOptions: SingleRequestOptions = { signal };
    const promise = chat.sendMessage(question1, requestOptions);
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });
  it("ChatSession sendMessage() timeout before signal aborts", async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });
    const question1 = "What is the capital of Oregon?";
    const chat = model.startChat();
    const signal = AbortSignal.timeout(9000);
    const requestOptions: SingleRequestOptions = { timeout: 1, signal };
    const promise = chat.sendMessage(question1, requestOptions);
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });
  it("ChatSession sendMessageStream() aborted", async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });
    const question1 = "What is the capital of Oregon?";
    const chat = model.startChat();
    const signal = AbortSignal.timeout(1);
    const requestOptions: SingleRequestOptions = { signal };
    const promise = chat.sendMessageStream(question1, requestOptions);
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });
  it("ChatSession sendMessageStream() timeout before signal aborts", async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });
    const question1 = "What is the capital of Oregon?";
    const chat = model.startChat();
    const signal = AbortSignal.timeout(9000);
    const requestOptions: SingleRequestOptions = { timeout: 1, signal };
    const promise = chat.sendMessageStream(question1, requestOptions);
    await expect(promise).to.be.rejectedWith("This operation was aborted");
  });
});
