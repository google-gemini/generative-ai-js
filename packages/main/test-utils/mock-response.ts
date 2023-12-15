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

import * as fs from "fs";
import { join } from "path";

const mockResponseDir = join(__dirname, "mock-responses");

/**
 * Mock native Response.getReader().read()
 * Streams contents of json file in 20 character chunks
 */
export function getMockResponseStreaming(
  filename: string,
  chunkLength: number = 20,
): Partial<Response> {
  const fullText = fs
    .readFileSync(join(mockResponseDir, filename), "utf-8")
    .replace(/\r\n\r\n/g, "\r\n");
  const encoder = new TextEncoder();
  let currentChunkStart = 0;

  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      return pump();
      function pump(): Promise<(() => Promise<void>) | undefined> {
        if (currentChunkStart >= fullText.length) {
          controller.close();
          return;
        }
        const substring = fullText.slice(
          currentChunkStart,
          currentChunkStart + chunkLength,
        );
        currentChunkStart += substring.length;
        const chunk = encoder.encode(substring);
        controller.enqueue(chunk);
        return pump();
      }
    },
  });

  return {
    body,
  };
}

export function getMockResponse(filename: string): Partial<Response> {
  const fullText = fs.readFileSync(join(mockResponseDir, filename), "utf-8");
  return {
    ok: true,
    json: () => Promise.resolve(JSON.parse(fullText)),
  };
}
