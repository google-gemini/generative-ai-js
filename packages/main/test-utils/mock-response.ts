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
export function getMockResponseStreaming(filename: string): Partial<Response> {
  let fullText = fs.readFileSync(join(mockResponseDir, filename), "utf-8");
  fullText = fullText.replace(/\r\n\r\n/g, "\r\n");
  let currentChunkStart = 0;
  const encoder = new TextEncoder();

  async function mockRead(): Promise<ReadableStreamReadResult<Uint8Array>> {
    if (currentChunkStart >= fullText.length) {
      return { done: true };
    }
    let substring = fullText.slice(currentChunkStart, currentChunkStart + 20);
    if (substring.endsWith("\r")) {
      substring = fullText.slice(currentChunkStart, currentChunkStart + 21);
    }
    if (substring.includes("\r\n")) {
      substring = substring.split("\r\n")[0] + "\r\n";
    }
    const chunk = encoder.encode(substring);
    currentChunkStart += substring.length;
    return {
      value: chunk,
      done: false,
    };
  }

  return {
    body: {
      // @ts-ignore This mock isn't a perfect match for getReader()
      getReader: () => ({ read: mockRead }),
    },
  };
}

export function getMockResponse(filename: string): Partial<Response> {
  const fullText = fs.readFileSync(join(mockResponseDir, filename), "utf-8");
  return {
    ok: true,
    json: () => Promise.resolve(JSON.parse(fullText)),
  };
}
