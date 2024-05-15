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

import { Content, POSSIBLE_ROLES, Part } from "../../types";
import { GoogleGenerativeAIError } from "../errors";

type Role = (typeof POSSIBLE_ROLES)[number];

// https://ai.google.dev/api/rest/v1beta/Content#part

const VALID_PART_FIELDS: Array<keyof Part> = [
  "text",
  "inlineData",
  "functionCall",
  "functionResponse",
];

const VALID_PARTS_PER_ROLE: { [key in Role]: Array<keyof Part> } = {
  user: ["text", "inlineData"],
  function: ["functionResponse"],
  model: ["text", "functionCall"],
  // System instructions shouldn't be in history anyway.
  system: ["text"],
};

export function validateChatHistory(history: Content[]): void {
  let prevContent = false;
  for (const currContent of history) {
    const { role, parts } = currContent as { role: Role; parts: Part[] };
    if (!prevContent && role !== "user") {
      throw new GoogleGenerativeAIError(
        `First content should be with role 'user', got ${role}`,
      );
    }
    if (!POSSIBLE_ROLES.includes(role)) {
      throw new GoogleGenerativeAIError(
        `Each item should include role field. Got ${role} but valid roles are: ${JSON.stringify(
          POSSIBLE_ROLES,
        )}`,
      );
    }

    if (!Array.isArray(parts)) {
      throw new GoogleGenerativeAIError(
        "Content should have 'parts' property with an array of Parts",
      );
    }

    if (parts.length === 0) {
      throw new GoogleGenerativeAIError(
        "Each Content should have at least one part",
      );
    }

    const countFields: Record<keyof Part, number> = {
      text: 0,
      inlineData: 0,
      functionCall: 0,
      functionResponse: 0,
      fileData: 0,
    };

    for (const part of parts) {
      for (const key of VALID_PART_FIELDS) {
        if (key in part) {
          countFields[key] += 1;
        }
      }
    }
    const validParts = VALID_PARTS_PER_ROLE[role];
    for (const key of VALID_PART_FIELDS) {
      if (!validParts.includes(key) && countFields[key] > 0) {
        throw new GoogleGenerativeAIError(
          `Content with role '${role}' can't contain '${key}' part`,
        );
      }
    }

    prevContent = true;
  }
}
