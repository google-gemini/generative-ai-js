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

/**
 * This sample demonstrates how to use encrypted prompts to protect intellectual property.
 * 
 * To run this sample:
 * 1. Set your API key as an environment variable: export API_KEY=your_api_key
 * 2. Run: node encrypted_prompts.js
 */

const {
  GoogleGenerativeAI,
  createEncryptedTextPart,
} = require('@google/generative-ai');

// Initialize the API with encryption enabled
const genAI = new GoogleGenerativeAI(process.env.API_KEY, {
  enableEncryption: true,
});

// The model to use
const modelName = 'gemini-1.5-flash';

async function encryptedPromptExample() {
  try {
    console.log('Initializing encryption...');
    // Initialize the encryption service (generates key pair)
    await genAI.initializeEncryption();
    
    console.log('Encryption initialized successfully.');
    console.log('Public key for encryption:');
    console.log(genAI.getPublicKey());
    
    // Create a model instance
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // A proprietary prompt that contains intellectual property you want to protect
    const proprietaryPrompt = 'This is a proprietary prompt that contains intellectual property. ' +
      'It includes a special technique for generating high-quality responses that I want to keep secret.';
    
    console.log('\nOriginal prompt:');
    console.log(proprietaryPrompt);
    
    // Encrypt the prompt
    const encryptedPrompt = genAI.encryptText(proprietaryPrompt);
    console.log('\nEncrypted prompt:');
    console.log(encryptedPrompt);
    
    // Create an encrypted text part
    const encryptedPart = createEncryptedTextPart(encryptedPrompt);
    
    console.log('\nSending encrypted prompt to the model...');
    // Send the encrypted prompt to the model
    const result = await model.generateContent([
      'Hello, please respond to the following instructions:',
      encryptedPart,
      'Thank you!'
    ]);
    
    console.log('\nResponse:');
    console.log(result.response.text());
    
    // Example of using a public key from elsewhere
    console.log('\nExample of encrypting with a specific public key:');
    const publicKey = genAI.getPublicKey();
    const encryptedWithPublicKey = genAI.encryptText('Another secret prompt', publicKey);
    console.log(encryptedWithPublicKey);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
encryptedPromptExample(); 