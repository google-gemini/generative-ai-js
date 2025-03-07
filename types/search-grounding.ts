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

import { GoogleAuth, JWT, OAuth2Client } from 'google-auth-library';
import { DynamicRetrievalMode } from "./enums";

/**
 * Retrieval tool that is powered by Google search.
 * @public
 */
export declare interface GoogleSearchRetrievalTool {
  /**
   * Google search retrieval tool config.
   */
  googleSearchRetrieval?: GoogleSearchRetrieval;
}

/**
 * Retrieval tool that is powered by Google search.
 * @public
 */
export declare interface GoogleSearchRetrieval {
  /**
   * Specifies the dynamic retrieval configuration for the given source.
   */
  dynamicRetrievalConfig?: DynamicRetrievalConfig;
}

/**
 * Specifies the dynamic retrieval configuration for the given source.
 * @public
 */
export declare interface DynamicRetrievalConfig {
  /**
   * The mode of the predictor to be used in dynamic retrieval.
   */
  mode?: DynamicRetrievalMode;
  /**
   * The threshold to be used in dynamic retrieval. If not set, a system default 
   * value is used.
   */
  dynamicThreshold?: number;
}

/**
 * Metadata returned to client when grounding is enabled.
 * @public
 */
export declare interface GroundingMetadata {
  /**
   * Google search entry for the following-up web searches.
   */
  searchEntryPoint?: SearchEntryPoint;
  /**
   * List of supporting references retrieved from specified grounding source.
   */
  groundingChunks?: GroundingChunk[];
  /**
   * List of grounding support.
   */
  groundingSupports?: GroundingSupport[];
  /**
   * Metadata related to retrieval in the grounding flow.
   */
  retrievalMetadata?: RetrievalMetadata;
  /**
   * Web search queries for the following-up web search.
   */
  webSearchQueries: string[];
}

/**
 * Google search entry point.
 * @public
 */
export declare interface SearchEntryPoint {
  /**
   * Web content snippet that can be embedded in a web page or an app webview.
   */
  renderedContent?: string;
  /**
   * Base64 encoded JSON representing array of <search term, search url> tuple.
   */
  sdkBlob?: string;
}

/**
 * Grounding chunk.
 * @public
 */
export declare interface GroundingChunk {
  /**
   * Chunk from the web.
   */
  web?: GroundingChunkWeb;
}

/**
 * Chunk from the web.
 * @public
 */
export declare interface GroundingChunkWeb {
  /**
   * URI reference of the chunk.
   */
  uri?: string;
  /**
   * Title of the chunk.
   */
  title?: string;
}

/**
 * Grounding support.
 * @public
 */
export declare interface GroundingSupport {
  /**
   * URI reference of the chunk.
   */
  segment?: string;
  /**
   * A list of indices (into 'grounding_chunk') specifying the citations 
   * associated with the claim. For instance [1,3,4] means that 
   * grounding_chunk[1], grounding_chunk[3], grounding_chunk[4] are the 
   * retrieved content attributed to the claim.
   */
  groundingChunckIndices?: number[];
  /**
   * Confidence score of the support references. Ranges from 0 to 1. 1 is the 
   * most confident. This list must have the same size as the 
   * grounding_chunk_indices.
   */
  confidenceScores?: number[];
}

/**
 * Segment of the content.
 * @public
 */
export declare interface GroundingSupportSegment {
  /**
   * The index of a Part object within its parent Content object.
   */
  partIndex?: number;
  /**
   * Start index in the given Part, measured in bytes. Offset from the start of 
   * the Part, inclusive, starting at zero.
   */
  startIndex?: number;
  /**
   * End index in the given Part, measured in bytes. Offset from the start of 
   * the Part, exclusive, starting at zero.
   */
  endIndex?: number;
  /**
   * The text corresponding to the segment from the response.
   */
  text?: string;
}

/**
 * Metadata related to retrieval in the grounding flow.
 * @public
 */
export declare interface RetrievalMetadata {
  /**
   * Score indicating how likely information from google search could help 
   * answer the prompt. The score is in the range [0, 1], where 0 is the least 
   * likely and 1 is the most likely. This score is only populated when google 
   * search grounding and dynamic retrieval is enabled. It will be compared to 
   * the threshold to determine whether to trigger google search.
   */
  googleSearchDynamicRetrievalScore?: number;
}

/**
 * Utility to fetch credentials using Application Default Credentials (ADC).
 * @returns {Promise<JWT | OAuth2Client>} - Authenticated client.
 */
async function getAuthenticatedClient(): Promise<JWT | OAuth2Client> {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  try {
    // Attempt to use ADC
    const client = await auth.getClient();
    if (client instanceof JWT || client instanceof OAuth2Client) {
      return client;
    }
    throw new Error('Unsupported client type');
  } catch (error) {
    console.warn('ADC not available. Falling back to environment variables or service account keys.');
    // Create a new JWT client as a fallback
    return new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }
}

/**
 * Service to interact with Google Search Retrieval API.
 */
export class GoogleSearchRetrievalService {
  private authClient: JWT | OAuth2Client | null = null;

  constructor() {
    // Initialize the authenticated client
    this.initializeAuth().catch((error) => {
      console.error('Failed to initialize authentication:', error);
    });
  }

  private async initializeAuth(): Promise<void> {
    this.authClient = await getAuthenticatedClient();
  }

  /**
   * Fetch data using Google Search Retrieval.
   * @param tool - GoogleSearchRetrievalTool configuration.
   * @returns {Promise<ApiResponse>} - Response from the API.
   */
  async fetchData(tool: GoogleSearchRetrievalTool): Promise<{ data: unknown; status: number }> {
    if (!this.authClient) {
      throw new Error('Authentication client not initialized.');
    }

    // Use the authenticated client to make API calls
    const response = await this.authClient.request({
      url: 'https://your-google-search-api-endpoint',
      method: 'POST',
      data: tool,
    });

    return {
      data: response.data,
      status: response.status,
    };
  }
}