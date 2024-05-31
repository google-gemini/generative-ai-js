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
import { expect } from "@esm-bundle/chai";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "../../";

/**
 * Integration tests against live backend.
 */

describe("generateContent", function () {
  this.timeout(60e3);
  this.slow(10e3);
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

describe("startChat", function () {
  this.timeout(60e3);
  this.slow(10e3);
  it("stream false", async () => {
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
    const question1 = "What is the capital of Oregon?";
    const question2 = "How many people live in that city?";
    const chat = model.startChat();
    const result1 = await chat.sendMessage(question1);
    expect(result1.response.text()).to.not.be.empty;
    const result2 = await chat.sendMessage(question2);
    expect(result2.response.text()).to.not.be.empty;
    const history = await chat.getHistory();
    expect(history[0].parts[0].text).to.equal(question1);
    expect(history[2].parts[0].text).to.equal(question2);
    expect(history.length).to.equal(4);
  });
  it("stream true", async () => {
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
    const question1 = "What is the capital of Oregon?";
    const question2 = "How many people live in that city?";
    const question3 = "What is the closest river?";
    const chat = model.startChat();
    const result1 = await chat.sendMessageStream(question1);
    const response1 = await result1.response;
    expect(response1.text()).to.not.be.empty;
    const result2 = await chat.sendMessageStream(question2);
    for await (const response of result2.stream) {
      expect(response.text()).to.not.be.empty;
    }
    const response2 = await result2.response;
    expect(response2.text()).to.not.be.empty;
    const result3 = await chat.sendMessageStream(question3);
    for await (const response of result3.stream) {
      expect(response.text()).to.not.be.empty;
    }
    const response3 = await result3.response;
    expect(response3.text()).to.not.be.empty;
    const history = await chat.getHistory();
    expect(history[0].parts[0].text).to.equal(question1);
    expect(history[2].parts[0].text).to.equal(question2);
    expect(history[4].parts[0].text).to.equal(question3);
    expect(history.length).to.equal(6);
  });
  it("stream true, try to send message before previous stream is done", async () => {
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
    const question1 = "What are the most interesting cities in Oregon?";
    const question2 = "How many people live in that city?";
    const question3 = "What is the closest river?";
    const chat = model.startChat();
    const promise1 = chat.sendMessageStream(question1).then(async (result1) => {
      for await (const response of result1.stream) {
        expect(response.text()).to.not.be.empty;
      }
      const response1 = await result1.response;
      expect(response1.text()).to.not.be.empty;
    });
    const promise2 = chat.sendMessageStream(question2).then(async (result2) => {
      for await (const response of result2.stream) {
        expect(response.text()).to.not.be.empty;
      }
      const response2 = await result2.response;
      expect(response2.text()).to.not.be.empty;
    });
    const promise3 = chat
      .sendMessage(question3)
      .then(async (result3) => {
        const response3 = result3.response;
        expect(response3.text()).to.not.be.empty;
      })
      .catch((e) => console.error(e));
    await Promise.all([promise1, promise2, promise3]);
    const history = await chat.getHistory();
    expect(history[0].parts[0].text).to.equal(question1);
    expect(history[2].parts[0].text).to.equal(question2);
    expect(history[4].parts[0].text).to.equal(question3);
    expect(history.length).to.equal(6);
  });
});

describe("countTokens", function () {
  this.timeout(60e3);
  this.slow(10e3);
  it("counts tokens right", async () => {
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
    const response1 = await model.countTokens("count me");
    const response2 = await model.countTokens({
      contents: [{ role: "user", parts: [{ text: "count me" }] }],
    });
    expect(response1.totalTokens).to.equal(3);
    expect(response2.totalTokens).to.equal(3);
  });
});

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

describe("batchEmbedContents", () => {
  it("embeds multiple requests", async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "embedding-001",
    });
    const content1 = {
      content: { role: "user", parts: [{ text: "embed me" }] },
    };
    const content2 = {
      content: { role: "user", parts: [{ text: "embed me" }] },
    };
    const response = await model.batchEmbedContents({
      requests: [content1, content2],
    });
    expect(response.embeddings.length).to.equal(2);
  });
});
