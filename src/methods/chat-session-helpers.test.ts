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

import { isValidResponse, validateChatHistory } from "./chat-session-helpers";
import { expect } from "chai";
import { Content, GenerateContentResponse } from "../../types";
import { GoogleGenerativeAIError } from "../errors";

describe("chat-session-helpers", () => {
  describe("validateChatHistory", () => {
    const TCS: Array<{ history: Content[]; isValid: boolean }> = [
      {
        history: [{ role: "user", parts: [{ text: "hi" }] }],
        isValid: true,
      },
      {
        history: [
          {
            role: "user",
            parts: [
              { text: "hi" },
              { inlineData: { mimeType: "image/jpeg", data: "base64==" } },
            ],
          },
        ],
        isValid: true,
      },
      {
        history: [
          { role: "user", parts: [{ text: "hi" }] },
          { role: "model", parts: [{ text: "hi" }, { text: "hi" }] },
        ],
        isValid: true,
      },
      {
        history: [
          { role: "user", parts: [{ text: "hi" }] },
          {
            role: "model",
            parts: [
              { functionCall: { name: "greet", args: { name: "user" } } },
            ],
          },
        ],
        isValid: true,
      },
      {
        history: [
          { role: "user", parts: [{ text: "hi" }] },
          {
            role: "model",
            parts: [
              { functionCall: { name: "greet", args: { name: "user" } } },
            ],
          },
          {
            role: "function",
            parts: [
              {
                functionResponse: { name: "greet", response: { name: "user" } },
              },
            ],
          },
        ],
        isValid: true,
      },
      {
        history: [
          { role: "user", parts: [{ text: "hi" }] },
          {
            role: "model",
            parts: [
              { functionCall: { name: "greet", args: { name: "user" } } },
            ],
          },
          {
            role: "function",
            parts: [
              {
                functionResponse: { name: "greet", response: { name: "user" } },
              },
            ],
          },
          {
            role: "model",
            parts: [{ text: "hi name" }],
          },
        ],
        isValid: true,
      },
      {
        //@ts-expect-error
        history: [{ role: "user", parts: "" }],
        isValid: false,
      },
      {
        //@ts-expect-error
        history: [{ role: "user" }],
        isValid: false,
      },
      {
        history: [{ role: "user", parts: [] }],
        isValid: false,
      },
      {
        history: [{ role: "model", parts: [{ text: "hi" }] }],
        isValid: false,
      },
      {
        history: [
          {
            role: "function",
            parts: [
              {
                functionResponse: { name: "greet", response: { name: "user" } },
              },
            ],
          },
        ],
        isValid: false,
      },
      {
        history: [
          { role: "user", parts: [{ text: "hi" }] },
          { role: "user", parts: [{ text: "hi" }] },
        ],
        isValid: true,
      },
      {
        history: [
          { role: "user", parts: [{ text: "hi" }] },
          { role: "model", parts: [{ text: "hi" }] },
          { role: "model", parts: [{ text: "hi" }] },
        ],
        isValid: true,
      },
      {
        history: [
          { role: "model", parts: [{ text: "hi" }] },
          { role: "user", parts: [{ text: "hi" }] },
        ],
        isValid: false,
      },
    ];
    TCS.forEach((tc, index) => {
      it(`case ${index}`, () => {
        const fn = (): void => validateChatHistory(tc.history);
        if (tc.isValid) {
          expect(fn).to.not.throw();
        } else {
          expect(fn).to.throw(GoogleGenerativeAIError);
        }
      });
    });
  });
  describe("isValidResponse", () => {
    const testCases = [
      { name: "default response", response: {}, isValid: false },
      {
        name: "empty candidates",
        response: { candidates: [] } as GenerateContentResponse,
        isValid: false,
      },
      {
        name: "default candidates",
        response: { candidates: [{}] } as GenerateContentResponse,
        isValid: false,
      },
      {
        name: "default content",
        response: { candidates: [{ content: {} }] } as GenerateContentResponse,
        isValid: false,
      },
      {
        name: "empty parts",
        response: {
          candidates: [{ content: { parts: [] } }],
        } as GenerateContentResponse,
        isValid: false,
      },
      {
        name: "default part",
        response: {
          candidates: [{ content: { parts: [{}] } }],
        } as GenerateContentResponse,
        isValid: false,
      },
      {
        name: "part with empty text",
        response: {
          candidates: [{ content: { parts: [{ text: "" }] } }],
        } as GenerateContentResponse,
        isValid: false,
      },
      {
        name: "part with text",
        response: {
          candidates: [{ content: { parts: [{ text: "hello" }] } }],
        } as GenerateContentResponse,
        isValid: true,
      },
      {
        name: "part with function call",
        response: {
          candidates: [
            {
              content: {
                parts: [
                  { functionCall: { name: "foo", args: { input: "bar" } } },
                ],
              },
            },
          ],
        } as GenerateContentResponse,
        isValid: true,
      },
      {
        name: "part with function response",
        response: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    functionResponse: {
                      name: "foo",
                      response: { output: "bar" },
                    },
                  },
                ],
              },
            },
          ],
        } as GenerateContentResponse,
        isValid: true,
      },
    ];

    testCases.forEach((testCase) => {
      it(testCase.name, () => {
        expect(isValidResponse(testCase.response)).to.eq(testCase.isValid);
      });
    });
  });
});
