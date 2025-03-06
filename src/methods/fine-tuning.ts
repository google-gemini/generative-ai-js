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

import { GoogleGenerativeAIError } from "../errors";
import { RequestOptions } from "../../types";
import { makeRequest } from "../transport/fetch";

/**
 * Interface for fine-tuning job configuration
 */
export interface FineTuningConfig {
  baseModelId: string;
  trainingDataPath: string;
  validationDataPath?: string;
  hyperParameters?: {
    batchSize?: number;
    learningRate?: number;
    epochCount?: number;
  };
  outputModelName?: string;
}

/**
 * Interface for fine-tuning job status
 */
export interface FineTuningJobStatus {
  jobId: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
  createTime: string;
  updateTime: string;
  baseModelId: string;
  tunedModelId?: string;
  error?: string;
}

/**
 * Class for managing fine-tuning operations
 */
export class FineTuning {
  private apiKey: string;
  private requestOptions?: RequestOptions;
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta";

  constructor(apiKey: string, requestOptions?: RequestOptions) {
    this.apiKey = apiKey;
    this.requestOptions = requestOptions;
  }

  /**
   * Create a new fine-tuning job
   * @param config Configuration for the fine-tuning job
   * @returns The created fine-tuning job status
   */
  async createFineTuningJob(config: FineTuningConfig): Promise<FineTuningJobStatus> {
    const url = `${this.baseUrl}/tuningJobs?key=${this.apiKey}`;
    
    const body = {
      baseModelId: config.baseModelId,
      trainingData: {
        gcsSource: {
          uris: [config.trainingDataPath]
        }
      },
      hyperParameters: config.hyperParameters || {},
      tuningJobName: config.outputModelName
    };

    if (config.validationDataPath) {
      body["validationData"] = {
        gcsSource: {
          uris: [config.validationDataPath]
        }
      };
    }

    try {
      const response = await makeRequest(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        ...this.requestOptions
      });

      return response as FineTuningJobStatus;
    } catch (error) {
      throw new GoogleGenerativeAIError(
        `Failed to create fine-tuning job: ${error.message}`
      );
    }
  }

  /**
   * Get the status of a fine-tuning job
   * @param jobId The ID of the fine-tuning job
   * @returns The status of the fine-tuning job
   */
  async getFineTuningJob(jobId: string): Promise<FineTuningJobStatus> {
    const url = `${this.baseUrl}/tuningJobs/${jobId}?key=${this.apiKey}`;

    try {
      const response = await makeRequest(url, {
        method: "GET",
        ...this.requestOptions
      });

      return response as FineTuningJobStatus;
    } catch (error) {
      throw new GoogleGenerativeAIError(
        `Failed to get fine-tuning job: ${error.message}`
      );
    }
  }

  /**
   * List all fine-tuning jobs
   * @param pageSize Number of jobs to return per page
   * @param pageToken Token for pagination
   * @returns List of fine-tuning jobs
   */
  async listFineTuningJobs(pageSize = 10, pageToken?: string): Promise<{
    tuningJobs: FineTuningJobStatus[];
    nextPageToken?: string;
  }> {
    let url = `${this.baseUrl}/tuningJobs?key=${this.apiKey}&pageSize=${pageSize}`;
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }

    try {
      const response = await makeRequest(url, {
        method: "GET",
        ...this.requestOptions
      });

      return response as {
        tuningJobs: FineTuningJobStatus[];
        nextPageToken?: string;
      };
    } catch (error) {
      throw new GoogleGenerativeAIError(
        `Failed to list fine-tuning jobs: ${error.message}`
      );
    }
  }

  /**
   * Cancel a fine-tuning job
   * @param jobId The ID of the fine-tuning job to cancel
   * @returns The updated fine-tuning job status
   */
  async cancelFineTuningJob(jobId: string): Promise<FineTuningJobStatus> {
    const url = `${this.baseUrl}/tuningJobs/${jobId}:cancel?key=${this.apiKey}`;

    try {
      const response = await makeRequest(url, {
        method: "POST",
        ...this.requestOptions
      });

      return response as FineTuningJobStatus;
    } catch (error) {
      throw new GoogleGenerativeAIError(
        `Failed to cancel fine-tuning job: ${error.message}`
      );
    }
  }
} 