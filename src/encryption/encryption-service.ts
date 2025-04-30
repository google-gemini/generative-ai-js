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

import { GoogleGenerativeAIError } from '../errors';
import { 
  generateKeyPair, 
  hybridEncrypt, 
  hybridDecrypt, 
  KeyPair 
} from './crypto-utils';

/**
 * Service that manages encryption keys and provides encryption functionality
 */
export class EncryptionService {
  private keyPair: KeyPair | null = null;
  private isInitialized = false;

  /**
   * Initialize the encryption service by generating a new key pair
   * @returns A promise that resolves when initialization is complete
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.keyPair = await generateKeyPair();
      this.isInitialized = true;
    } catch (error) {
      throw new GoogleGenerativeAIError(`Failed to initialize encryption service: ${error.message}`);
    }
  }

  /**
   * Get the public key for encryption
   * @returns The public key in PEM format
   * @throws Error if the service is not initialized
   */
  getPublicKey(): string {
    this.ensureInitialized();
    return this.keyPair!.publicKey;
  }

  /**
   * Encrypt data using the public key
   * @param data - The data to encrypt
   * @param publicKey - Optional public key to use (if not provided, uses the service's public key)
   * @returns The encrypted data
   */
  encryptData(data: string, publicKey?: string): string {
    const key = publicKey || this.getPublicKey();
    return hybridEncrypt(data, key);
  }

  /**
   * Decrypt data using the private key
   * @param encryptedData - The encrypted data
   * @returns The decrypted data
   * @throws Error if the service is not initialized
   */
  decryptData(encryptedData: string): string {
    this.ensureInitialized();
    return hybridDecrypt(encryptedData, this.keyPair!.privateKey);
  }

  /**
   * Check if the encryption service is initialized
   * @returns True if initialized, false otherwise
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Ensure the encryption service is initialized
   * @throws Error if the service is not initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized || !this.keyPair) {
      throw new GoogleGenerativeAIError(
        'Encryption service is not initialized. Call initialize() first.'
      );
    }
  }
} 