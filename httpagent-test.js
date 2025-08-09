const mockHttpAgent = {
  name: 'MockHttpAgent',
  protocol: 'https:',
  defaultPort: 443,
  createConnection: () => {}
};

const mockFetch = async (url, options) => {
  console.log('[TEST] Mock fetch called with URL:', url);
  console.log('[TEST] Agent in options:', options.agent ? 'present' : 'absent');
  if (options.agent) {
    console.log('[TEST] Agent name:', options.agent.name);
  }
  
  return { 
    ok: true, 
    status: 200,
    headers: new Map(),
    json: async () => ({ candidates: [{ content: { parts: [{ text: 'Success' }] } }] })
  };
};

function buildFetchOptionsForTest(requestOptions) {
  const fetchOptions = {};
  
  if (requestOptions?.timeout >= 0) {
    fetchOptions.signal = {};
  }
  
  if (requestOptions?.httpAgent) {
    console.log('[TEST] Adding httpAgent to fetchOptions');
    fetchOptions.agent = requestOptions.httpAgent;
  }
  
  return fetchOptions;
}

function makeRequestWithAgent(requestOptions, fetchFn) {
  const fetchOptions = buildFetchOptionsForTest(requestOptions);
  console.log('[TEST] fetchOptions has agent:', fetchOptions.agent ? 'yes' : 'no');
  
  if (requestOptions?.fetch) {
    console.log('[TEST] Using custom fetch from requestOptions');
    return requestOptions.fetch('https://example.com/test', fetchOptions);
  } else {
    return fetchFn('https://example.com/test', fetchOptions);
  }
}

console.log('TEST 1: Options with httpAgent');
const testOptions1 = {
  httpAgent: mockHttpAgent,
  timeout: 1000
};
const fetchOptions1 = buildFetchOptionsForTest(testOptions1);
console.log('Agent property in options:', fetchOptions1.agent ? 'present' : 'absent');
console.log('Agent matches input:', fetchOptions1.agent === mockHttpAgent ? 'yes' : 'no');

console.log('\nTEST 2: Options without httpAgent');
const testOptions2 = {
  timeout: 1000
};
const fetchOptions2 = buildFetchOptionsForTest(testOptions2);
console.log('Agent property in options:', fetchOptions2.agent ? 'present' : 'absent');

console.log('\nTEST 3: Making request with httpAgent');
const testOptions3 = {
  httpAgent: mockHttpAgent,
  fetch: mockFetch,
  timeout: 1000
};
makeRequestWithAgent(testOptions3, mockFetch);

console.log('\nTEST 4: Making request without httpAgent');
const testOptions4 = {
  fetch: mockFetch,
  timeout: 1000
};
makeRequestWithAgent(testOptions4, mockFetch);

console.log('\nAll httpAgent tests completed.'); 