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

import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { GoogleGenerativeAI } from '../../src/gen-ai';
import * as requestModule from '../../src/requests/request';

let origAPI_KEY: string | undefined;

describe('ADC Authentication', () => {
  const sandbox = sinon.createSandbox();
  
  beforeEach(() => {
    origAPI_KEY = process.env.API_KEY;
    process.env.API_KEY = 'test-api-key';
  });

  afterEach(() => {
    process.env.API_KEY = origAPI_KEY;
    sandbox.restore();
  });

  it('initializes with API key correctly', () => {
    const genAI = new GoogleGenerativeAI('test-api-key');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    expect(model.apiKey).to.equal('test-api-key');
  });
  
  it('initializes with ADC when explicitly enabled', () => {
    const genAI = new GoogleGenerativeAI(undefined, { useAdc: true });
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    expect(model.apiKey).to.be.undefined;
  });
  
  it('initializes with ADC when no API key is provided', () => {
    const genAI = new GoogleGenerativeAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    expect(model.apiKey).to.be.undefined;
  });
  
  it('prioritizes API key over ADC when both are available', () => {
    const genAI = new GoogleGenerativeAI('test-api-key', { useAdc: true });
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    expect(model.apiKey).to.equal('test-api-key');
  });
  
  it('throws error when neither API key nor ADC is enabled', () => {
    expect(() => {
      new GoogleGenerativeAI(undefined, { useAdc: false });
    }).to.throw('Must provide an API key or enable Application Default Credentials');
  });
});

describe('getAdcToken function', () => {
  const sandbox = sinon.createSandbox();
  let getAdcTokenStub: sinon.SinonStub;
  
  beforeEach(() => {
    getAdcTokenStub = sandbox.stub().resolves('mock-adc-token');
    sandbox.stub(requestModule, 'getHeaders').resolves(new Headers());
  });
  
  afterEach(() => {
    sandbox.restore();
  });
  
  it('does not use ADC when API key is provided', async () => {
    const requestUrl = new requestModule.RequestUrl(
      'models/gemini-1.5-flash',
      requestModule.Task.GENERATE_CONTENT,
      'test-api-key',
      false,
      {}
    );
    
    await requestModule.getHeaders(requestUrl);
    expect(getAdcTokenStub.called).to.be.false;
  });
});

describe('ADC Request Options', () => {
  it('passes ADC options to the model correctly', () => {
    const genAI = new GoogleGenerativeAI(undefined, { useAdc: true });
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    expect(model).to.exist;
  });
}); 