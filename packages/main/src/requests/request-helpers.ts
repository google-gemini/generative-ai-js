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
  Content,
  EmbedContentRequest,
  GenerateContentRequest,
  Part,
} from "../../types";

export function formatNewContent(
  request: string | Array<string | Part>,
  role: string,
): Content {
  let newParts: Part[] = [];
  if (typeof request === "string") {
    newParts = [{ text: request }];
  } else {
    for (const partOrString of request) {
      if (typeof partOrString === "string") {
        newParts.push({ text: partOrString });
      } else {
        newParts.push(partOrString);
      }
    }
  }
  return { role, parts: newParts };
}

export function formatGenerateContentInput(
  params: GenerateContentRequest | string | Array<string | Part>,
): GenerateContentRequest {
  if ((params as GenerateContentRequest).contents) {
    return params as GenerateContentRequest;
  } else {
    const content = formatNewContent(
      params as string | Array<string | Part>,
      "user",
    );
    return { contents: [content] };
  }
}

export function formatEmbedContentInput(
  params: EmbedContentRequest | string | Array<string | Part>,
): EmbedContentRequest {
  if (typeof params === "string" || Array.isArray(params)) {
    const content = formatNewContent(params, "user");
    return { content };
  }
  return params;
}
