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

import {
  EnhancedGenerateContentResponse,
  GenerateContentCandidate,
  GenerateContentResponse,
  GenerateContentStreamResult,
} from "../../types";
import { GoogleGenerativeAIError } from "../errors";
import { addHelpers } from "./response-helpers";

const responseLineRE = /^data\: (.*)\r\n/;

/**
 * Process a response.body stream from the backend and return an
 * iterator that provides one complete GenerateContentResponse at a time
 * and a promise that resolves with a single aggregated
 * GenerateContentResponse.
 *
 * @param response - Response from a fetch call
 */
export function processStream(response: Response): GenerateContentStreamResult {
  const reader = response.body!.getReader();
  const responseStream = readFromReader(reader);
  const [stream1, stream2] = responseStream.tee();
  const reader1 = stream1.getReader();
  const reader2 = stream2.getReader();
  const allResponses: GenerateContentResponse[] = [];
  const responsePromise = new Promise<EnhancedGenerateContentResponse>(
    async (resolve) => {
      while (true) {
        const { value, done } = await reader1.read();
        if (done) {
          const aggregatedResponse = aggregateResponses(allResponses);
          resolve(addHelpers(aggregatedResponse));
          return;
        }
        allResponses.push(value);
      }
    },
  );
  async function* generateResponseSequence(): AsyncGenerator<EnhancedGenerateContentResponse> {
    while (true) {
      const { value, done } = await reader2.read();
      if (done) {
        break;
      }
      yield addHelpers(value);
    }
  }
  return {
    stream: generateResponseSequence(),
    response: responsePromise,
  };
}

/**
 * Reads a raw stream from the fetch response and join incomplete
 * chunks, returning a new stream that provides a single complete
 * GenerateContentResponse in each iteration.
 */
function readFromReader(
  bodyReader: ReadableStreamDefaultReader,
): ReadableStream<GenerateContentResponse> {
  let currentText = "";
  const reader = new ReadableStream<Uint8Array>({
    start(controller) {
      return pump();
      function pump(): Promise<(() => Promise<void>) | undefined> {
        return bodyReader.read().then(({ value, done }) => {
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(value);
          return pump();
        });
      }
    },
  })
    .pipeThrough(new TextDecoderStream())
    .getReader();

  const stream = new ReadableStream<GenerateContentResponse>({
    start(controller) {
      return pump();
      function pump(): Promise<(() => Promise<void>) | undefined> {
        return reader.read().then(({ value, done }) => {
          if (done) {
            controller.close();
            return;
          }
          currentText += value;
          const match = currentText.match(responseLineRE);
          // TODO: This needs to be refactored
          if (match) {
            let parsedResponse: GenerateContentResponse;
            try {
              parsedResponse = JSON.parse(match[1]);
              controller.enqueue(parsedResponse);
              currentText = "";
            } catch (e) {
              throw new GoogleGenerativeAIError(
                `Error parsing JSON response: "${match[1]}"`,
              );
            }
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
              parts: [{ text: "" }],
            };
          }
          for (const part of candidate.content.parts) {
            if (part.text) {
              aggregatedResponse.candidates[i].content.parts[0].text +=
                part.text;
            }
          }
        }
      }
    }
  }
  return aggregatedResponse;
}
