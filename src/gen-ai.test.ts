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
import { ModelParams } from "../types";
import { GenerativeModel, GoogleGenerativeAI } from "./gen-ai";
import { expect } from "chai";

describe("GoogleGenerativeAI", () => {
  it("genGenerativeInstance throws if no model is provided", () => {
    const genAI = new GoogleGenerativeAI("apikey");
    expect(() => genAI.getGenerativeModel({} as ModelParams)).to.throw(
      "Must provide a model name",
    );
  });
  it("genGenerativeInstance gets a GenerativeModel", () => {
    const genAI = new GoogleGenerativeAI("apikey");
    const genModel = genAI.getGenerativeModel({ model: "my-model" });
    expect(genModel).to.be.an.instanceOf(GenerativeModel);
    expect(genModel.model).to.equal("models/my-model");
  });
});
