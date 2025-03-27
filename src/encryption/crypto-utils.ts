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

import * as forge from 'node-forge';
import { GoogleGenerativeAIError } from '../errors';

// Default key size for RSA key generation
const DEFAULT_KEY_SIZE = 2048;

// Default exponent for RSA key generation
const DEFAULT_EXPONENT = 0x10001;

/**
 * Interface for key pair containing public and private keys
 */
export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

/**
 * Generate a new RSA key pair for encryption
 * @param keySize - Size of the key in bits (default: 2048)
 * @param exponent - Public exponent (default: 0x10001)
 * @returns A promise that resolves to a KeyPair object
 */
export function generateKeyPair(
  keySize: number = DEFAULT_KEY_SIZE,
  exponent: number = DEFAULT_EXPONENT
): Promise<KeyPair> {
  return new Promise((resolve, reject) => {
    try {
      const keypair = forge.pki.rsa.generateKeyPair({ bits: keySize, e: exponent });
      
      // Convert to PEM format
      const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
      const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);
      
      resolve({ publicKey, privateKey });
    } catch (error) {
      reject(new GoogleGenerativeAIError(`Failed to generate key pair: ${error.message}`));
    }
  });
}

/**
 * Encrypt data using a public key
 * @param data - The data to encrypt
 * @param publicKeyPem - The public key in PEM format
 * @returns The encrypted data as a base64 string
 */
export function encryptWithPublicKey(data: string, publicKeyPem: string): string {
  try {
    // Convert PEM to public key
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    
    // Encrypt data
    const encrypted = publicKey.encrypt(data, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
    });
    
    // Convert to base64
    return forge.util.encode64(encrypted);
  } catch (error) {
    throw new GoogleGenerativeAIError(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt data using a private key
 * @param encryptedData - The encrypted data as a base64 string
 * @param privateKeyPem - The private key in PEM format
 * @returns The decrypted data
 */
export function decryptWithPrivateKey(encryptedData: string, privateKeyPem: string): string {
  try {
    // Convert PEM to private key
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    
    // Decode base64
    const encrypted = forge.util.decode64(encryptedData);
    
    // Decrypt data
    return privateKey.decrypt(encrypted, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
    });
  } catch (error) {
    throw new GoogleGenerativeAIError(`Decryption failed: ${error.message}`);
  }
}

/**
 * Hybrid encryption for larger data using RSA for key exchange and AES for data
 * @param data - The data to encrypt
 * @param publicKeyPem - The public key in PEM format
 * @returns The encrypted data and key as a base64 string
 */
export function hybridEncrypt(data: string, publicKeyPem: string): string {
  try {
    // Generate a random AES key
    const aesKey = forge.random.getBytesSync(32); // 256 bits
    const iv = forge.random.getBytesSync(16); // 128 bits
    
    // Encrypt the data with AES
    const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(data, 'utf8'));
    cipher.finish();
    const encryptedData = cipher.output.getBytes();
    
    // Encrypt the AES key with the RSA public key
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    const encryptedKey = publicKey.encrypt(aesKey + iv, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
    });
    
    // Combine the encrypted key and data
    const result = {
      encryptedKey: forge.util.encode64(encryptedKey),
      encryptedData: forge.util.encode64(encryptedData)
    };
    
    return JSON.stringify(result);
  } catch (error) {
    throw new GoogleGenerativeAIError(`Hybrid encryption failed: ${error.message}`);
  }
}

/**
 * Hybrid decryption for larger data using RSA for key exchange and AES for data
 * @param encryptedPackage - The encrypted data and key as a JSON string
 * @param privateKeyPem - The private key in PEM format
 * @returns The decrypted data
 */
export function hybridDecrypt(encryptedPackage: string, privateKeyPem: string): string {
  try {
    // Parse the encrypted package
    const { encryptedKey, encryptedData } = JSON.parse(encryptedPackage);
    
    // Decrypt the AES key with the RSA private key
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const keyAndIv = privateKey.decrypt(forge.util.decode64(encryptedKey), 'RSA-OAEP', {
      md: forge.md.sha256.create(),
    });
    
    // Extract the AES key and IV
    const aesKey = keyAndIv.substring(0, 32);
    const iv = keyAndIv.substring(32);
    
    // Decrypt the data with AES
    const decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
    decipher.start({iv: iv});
    decipher.update(forge.util.createBuffer(forge.util.decode64(encryptedData)));
    decipher.finish();
    
    return decipher.output.toString();
  } catch (error) {
    throw new GoogleGenerativeAIError(`Hybrid decryption failed: ${error.message}`);
  }
} 