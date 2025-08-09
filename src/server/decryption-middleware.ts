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

import { Content, Part } from '../../types';
import { GoogleGenerativeAIError } from '../errors';
import { hybridDecrypt } from '../encryption/crypto-utils';

/**
 * Options for the decryption middleware
 */
export interface DecryptionMiddlewareOptions {
  /**
   * The private key in PEM format
   */
  privateKey: string;
}

/**
 * Middleware for decrypting encrypted content on the server side
 */
export class DecryptionMiddleware {
  constructor(private options: DecryptionMiddlewareOptions) {
    if (!options.privateKey) {
      throw new GoogleGenerativeAIError('Private key is required for decryption middleware');
    }
  }

  /**
   * Process a request body to decrypt any encrypted content
   * @param body - The request body
   * @returns The processed request body with decrypted content
   */
  processRequestBody(body: any): any {
    if (!body) {
      return body;
    }

    // Handle contents array
    if (body.contents && Array.isArray(body.contents)) {
      body.contents = body.contents.map((content: any) => this.processContent(content));
    }

    // Handle single content object
    if (body.content && typeof body.content === 'object') {
      body.content = this.processContent(body.content);
    }

    // Handle system instruction
    if (body.systemInstruction && typeof body.systemInstruction === 'object') {
      body.systemInstruction = this.processContent(body.systemInstruction);
    }

    return body;
  }

  /**
   * Process a content object to decrypt any encrypted parts
   * @param content - The content object
   * @returns The processed content with decrypted parts
   */
  private processContent(content: Content): Content {
    if (!content || !content.parts || !Array.isArray(content.parts)) {
      return content;
    }

    const processedParts: Part[] = content.parts.map((part) => this.processPart(part));
    
    return {
      ...content,
      parts: processedParts,
    };
  }

  /**
   * Process a part to decrypt it if it's encrypted
   * @param part - The part object
   * @returns The processed part
   */
  private processPart(part: Part): Part {
    if (!part) {
      return part;
    }

    // Check if this is an encrypted text part
    if ('encryptedText' in part && part.encryptedText) {
      try {
        // Decrypt the text
        const decryptedText = hybridDecrypt(part.encryptedText, this.options.privateKey);
        
        // Return a text part with the decrypted content
        return { text: decryptedText };
      } catch (error) {
        throw new GoogleGenerativeAIError(`Failed to decrypt content: ${error.message}`);
      }
    }

    return part;
  }
} 