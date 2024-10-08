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
  GenerateContentCandidate,
  GenerateContentResponse,
  GenerateContentStreamResult,
  Part,
} from "../../types";
import { GoogleGenerativeAIError } from "../errors";
import { addHelpers } from "./response-helpers";

const responseLineRE = /^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;

/**
 * Process a response.body stream from the backend and return an
 * iterator that provides one complete GenerateContentResponse at a time
 * and a promise that resolves with a single aggregated
 * GenerateContentResponse.
 *
 * @param response - Response from a fetch call
 */
export function processStream(response: Response): GenerateContentStreamResult {
  const inputStream = response.body!.pipeThrough(
    new TextDecoderStream("utf8", { fatal: true }),
  );
  const responseStream =
    getResponseStream<GenerateContentResponse>(inputStream);
  const [stream1, stream2] = responseStream.tee();
  return {
    stream: generateResponseSequence(stream1),
    response: getResponsePromise(stream2),
  };
}

async function getResponsePromise(
  stream: ReadableStream<GenerateContentResponse>,
): Promise<EnhancedGenerateContentResponse> {
  const allResponses: GenerateContentResponse[] = [];
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      return addHelpers(aggregateResponses(allResponses));
    }
    allResponses.push(value);
  }
}

async function* generateResponseSequence(
  stream: ReadableStream<GenerateContentResponse>,
): AsyncGenerator<EnhancedGenerateContentResponse> {
  const reader = stream.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    yield addHelpers(value);
  }
}

/**
 * Reads a raw stream from the fetch response and join incomplete
 * chunks, returning a new stream that provides a single complete
 * GenerateContentResponse in each iteration.
 */
export function getResponseStream<T>(
  inputStream: ReadableStream<string>,
): ReadableStream<T> {
  const reader = inputStream.getReader();
  const stream = new ReadableStream<T>({
    start(controller) {
      let currentText = "";
      return pump();
      function pump(): Promise<(() => Promise<void>) | undefined> {
        return reader.read().then(({ value, done }) => {
          if (done) {
            if (currentText.trim()) {
              controller.error(
                new GoogleGenerativeAIError("Failed to parse stream"),
              );
              return;
            }
            controller.close();
            return;
          }

          currentText += value;
          let match = currentText.match(responseLineRE);
          let parsedResponse: T;
          while (match) {
            try {
              parsedResponse = JSON.parse(match[1]);
            } catch (e) {
              controller.error(
                new GoogleGenerativeAIError(
                  `Error parsing JSON response: "${match[1]}"`,
                ),
              );
              return;
            }
            controller.enqueue(parsedResponse);
            currentText = currentText.substring(match[0].length);
            match = currentText.match(responseLineRE);
          }
          return pump();
        });
      }
    },
  });
  return stream;
}

/**
 * Aggregates an array of `GenerateContentResponse`s into a single
 * GenerateContentResponse.
 */
export function aggregateResponses(
  responses: GenerateContentResponse[],
): GenerateContentResponse {
  const lastResponse = responses[responses.length - 1];
  const aggregatedResponse: GenerateContentResponse = {
    promptFeedback: lastResponse?.promptFeedback,
  };
  for (const response of responses) {
    if (response.candidates) {
      for (const candidate of response.candidates) {
        const i = candidate.index;
        if (!aggregatedResponse.candidates) {
          aggregatedResponse.candidates = [];
        }
        if (!aggregatedResponse.candidates[i]) {
          aggregatedResponse.candidates[i] = {
            index: candidate.index,
          } as GenerateContentCandidate;
        }
        // Keep overwriting, the last one will be final
        aggregatedResponse.candidates[i].citationMetadata =
          candidate.citationMetadata;
        aggregatedResponse.candidates[i].groundingMetadata =
          candidate.groundingMetadata;
        aggregatedResponse.candidates[i].finishReason = candidate.finishReason;
        aggregatedResponse.candidates[i].finishMessage =
          candidate.finishMessage;
        aggregatedResponse.candidates[i].safetyRatings =
          candidate.safetyRatings;

        /**
         * Candidates should always have content and parts, but this handles
         * possible malformed responses.
         */
        if (candidate.content && candidate.content.parts) {
          if (!aggregatedResponse.candidates[i].content) {
            aggregatedResponse.candidates[i].content = {
              role: candidate.content.role || "user",
              parts: [],
            };
          }
          const newPart: Partial<Part> = {};
          for (const part of candidate.content.parts) {
            if (part.text) {
              newPart.text = part.text;
            }
            if (part.functionCall) {
              newPart.functionCall = part.functionCall;
            }
            if (part.executableCode) {
              newPart.executableCode = part.executableCode;
            }
            if (part.codeExecutionResult) {
              newPart.codeExecutionResult = part.codeExecutionResult;
            }
            if (Object.keys(newPart).length === 0) {
              newPart.text = "";
            }
            aggregatedResponse.candidates[i].content.parts.push(
              newPart as Part,
            );
          }
        }
      }
    }
    if (response.usageMetadata) {
      aggregatedResponse.usageMetadata = response.usageMetadata;
    }
  }
  return aggregatedResponse;
}
