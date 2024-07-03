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

import {
  EnhancedGenerateContentResponse,
  FinishReason,
  FunctionCall,
  GenerateContentCandidate,
  GenerateContentResponse,
} from "../../types";
import { GoogleGenerativeAIResponseError } from "../errors";

/**
 * Adds convenience helper methods to a response object, including stream
 * chunks (as long as each chunk is a complete GenerateContentResponse JSON).
 */
export function addHelpers(
  response: GenerateContentResponse,
): EnhancedGenerateContentResponse {
  (response as EnhancedGenerateContentResponse).text = () => {
    if (response.candidates && response.candidates.length > 0) {
      if (response.candidates.length > 1) {
        console.warn(
          `This response had ${response.candidates.length} ` +
            `candidates. Returning text from the first candidate only. ` +
            `Access response.candidates directly to use the other candidates.`,
        );
      }
      if (hadBadFinishReason(response.candidates[0])) {
        throw new GoogleGenerativeAIResponseError<GenerateContentResponse>(
          `${formatBlockErrorMessage(response)}`,
          response,
        );
      }
      return getText(response);
    } else if (response.promptFeedback) {
      throw new GoogleGenerativeAIResponseError<GenerateContentResponse>(
        `Text not available. ${formatBlockErrorMessage(response)}`,
        response,
      );
    }
    return "";
  };
  /**
   * TODO: remove at next major version
   */
  (response as EnhancedGenerateContentResponse).functionCall = () => {
    if (response.candidates && response.candidates.length > 0) {
      if (response.candidates.length > 1) {
        console.warn(
          `This response had ${response.candidates.length} ` +
            `candidates. Returning function calls from the first candidate only. ` +
            `Access response.candidates directly to use the other candidates.`,
        );
      }
      if (hadBadFinishReason(response.candidates[0])) {
        throw new GoogleGenerativeAIResponseError<GenerateContentResponse>(
          `${formatBlockErrorMessage(response)}`,
          response,
        );
      }
      console.warn(
        `response.functionCall() is deprecated. ` +
          `Use response.functionCalls() instead.`,
      );
      return getFunctionCalls(response)[0];
    } else if (response.promptFeedback) {
      throw new GoogleGenerativeAIResponseError<GenerateContentResponse>(
        `Function call not available. ${formatBlockErrorMessage(response)}`,
        response,
      );
    }
    return undefined;
  };
  (response as EnhancedGenerateContentResponse).functionCalls = () => {
    if (response.candidates && response.candidates.length > 0) {
      if (response.candidates.length > 1) {
        console.warn(
          `This response had ${response.candidates.length} ` +
            `candidates. Returning function calls from the first candidate only. ` +
            `Access response.candidates directly to use the other candidates.`,
        );
      }
      if (hadBadFinishReason(response.candidates[0])) {
        throw new GoogleGenerativeAIResponseError<GenerateContentResponse>(
          `${formatBlockErrorMessage(response)}`,
          response,
        );
      }
      return getFunctionCalls(response);
    } else if (response.promptFeedback) {
      throw new GoogleGenerativeAIResponseError<GenerateContentResponse>(
        `Function call not available. ${formatBlockErrorMessage(response)}`,
        response,
      );
    }
    return undefined;
  };
  return response as EnhancedGenerateContentResponse;
}

/**
 * Returns all text found in all parts of first candidate.
 */
export function getText(response: GenerateContentResponse): string {
  const textStrings = [];
  if (response.candidates?.[0].content?.parts) {
    for (const part of response.candidates?.[0].content?.parts) {
      if (part.text) {
        textStrings.push(part.text);
      }
      if (part.executableCode) {
        textStrings.push(
          "\n```python\n" + part.executableCode.code + "\n```\n",
        );
      }
      if (part.codeExecutionResult) {
        textStrings.push(
          "\n```\n" + part.codeExecutionResult.output + "\n```\n",
        );
      }
    }
  }
  if (textStrings.length > 0) {
    return textStrings.join("");
  } else {
    return "";
  }
}

/**
 * Returns functionCall of first candidate.
 */
export function getFunctionCalls(
  response: GenerateContentResponse,
): FunctionCall[] {
  const functionCalls: FunctionCall[] = [];
  if (response.candidates?.[0].content?.parts) {
    for (const part of response.candidates?.[0].content?.parts) {
      if (part.functionCall) {
        functionCalls.push(part.functionCall);
      }
    }
  }
  if (functionCalls.length > 0) {
    return functionCalls;
  } else {
    return undefined;
  }
}

const badFinishReasons = [
  FinishReason.RECITATION,
  FinishReason.SAFETY,
  FinishReason.LANGUAGE,
];

function hadBadFinishReason(candidate: GenerateContentCandidate): boolean {
  return (
    !!candidate.finishReason &&
    badFinishReasons.includes(candidate.finishReason)
  );
}

export function formatBlockErrorMessage(
  response: GenerateContentResponse,
): string {
  let message = "";
  if (
    (!response.candidates || response.candidates.length === 0) &&
    response.promptFeedback
  ) {
    message += "Response was blocked";
    if (response.promptFeedback?.blockReason) {
      message += ` due to ${response.promptFeedback.blockReason}`;
    }
    if (response.promptFeedback?.blockReasonMessage) {
      message += `: ${response.promptFeedback.blockReasonMessage}`;
    }
  } else if (response.candidates?.[0]) {
    const firstCandidate = response.candidates[0];
    if (hadBadFinishReason(firstCandidate)) {
      message += `Candidate was blocked due to ${firstCandidate.finishReason}`;
      if (firstCandidate.finishMessage) {
        message += `: ${firstCandidate.finishMessage}`;
      }
    }
  }
  return message;
}
