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
 * State of a tuned model.
 * @public
 */
export enum TunedModelState {
  STATE_UNSPECIFIED = "STATE_UNSPECIFIED",
  CREATING = "CREATING",
  ACTIVE = "ACTIVE",
  FAILED = "FAILED",
}

/**
 * Represents a training example with input and output pair.
 * @public
 */
export interface TrainingExample {
  /**
   * The input text for training.
   */
  text_input: string;
  /**
   * The expected output for the given input.
   */
  output: string;
}

/**
 * Nested examples wrapper matching the API's exact structure
 * @public
 */
export interface ExamplesWrapper {
  /**
   * Collection of training examples.
   */
  examples: TrainingExample[];
}

/**
 * Represents a collection of training examples.
 * @public
 */
export interface TrainingData {
  /**
   * Examples wrapper for the exact API structure.
   */
  examples: ExamplesWrapper;
}

/**
 * Hyperparameters for model tuning.
 * @public
 */
export interface TuningHyperparameters {
  /**
   * The size of the batch used for training.
   */
  batch_size?: number;
  /**
   * The learning rate for training.
   */
  learning_rate?: number;
  /**
   * The number of epochs to train for.
   */
  epoch_count?: number;
}

/**
 * API response hyperparameters format (camelCase)
 * @public
 */
export interface ApiTuningHyperparameters {
  /**
   * The size of the batch used for training.
   */
  batchSize?: number;
  /**
   * The learning rate for training.
   */
  learningRate?: number;
  /**
   * The number of epochs to train for.
   */
  epochCount?: number;
}

/**
 * Snapshot detail value type that can be a string, number, boolean, or object
 */
export type SnapshotDetailValue = string | number | boolean | Record<string, unknown>;

/**
 * Snapshot of tuning task progress
 * @public
 */
export interface TuningSnapshot {
  /**
   * Snapshot details
   */
  [key: string]: SnapshotDetailValue;
}

/**
 * Tuning task details in API response
 * @public
 */
export interface TuningTaskDetails {
  /**
   * When tuning started
   */
  startTime?: string;
  /**
   * When tuning completed
   */
  completeTime?: string;
  /**
   * Training snapshots
   */
  snapshots?: TuningSnapshot[];
  /**
   * Hyperparameters used for tuning (in camelCase)
   */
  hyperparameters?: ApiTuningHyperparameters;
}

/**
 * Configuration for the tuning task.
 * @public
 */
export interface TuningTaskConfig {
  /**
   * Hyperparameters for the tuning process.
   */
  hyperparameters?: TuningHyperparameters;
  /**
   * The training data with the exact nested structure required by the API.
   */
  training_data: TrainingData;
}

/**
 * Parameters for creating a tuned model.
 * @public
 */
export interface CreateTunedModelParams {
  /**
   * Display name for the tuned model.
   */
  display_name: string;
  /**
   * The base model to tune.
   */
  base_model: string;
  /**
   * The tuning task configuration.
   */
  tuning_task: TuningTaskConfig;
}

/**
 * Response for tuned model creation operation.
 * @public 
 */
export interface CreateTunedModelResponse {
  /**
   * The name of the operation.
   */
  name: string;
  /**
   * Optional metadata about the operation.
   */
  metadata?: {
    completedPercent?: number;
    tunedModel?: string;
  };
  /**
   * Whether the operation is done.
   */
  done?: boolean;
}

/**
 * Parameters for listing tuned models.
 * @public
 */
export interface ListTunedModelsParams {
  /**
   * Maximum number of models to return. Default and maximum is 50.
   */
  pageSize?: number;
  /**
   * Token for pagination.
   */
  pageToken?: string;
  /**
   * Filter for the list operation.
   */
  filter?: string;
}

/**
 * Result of listing tuned models.
 * @public
 */
export interface ListTunedModelsResponse {
  /**
   * The list of tuned models.
   */
  tunedModels: TunedModelResponse[];
  /**
   * Token for the next page of results.
   */
  nextPageToken?: string;
}

/**
 * Snake-case version of tuning task details for backward compatibility
 */
export interface SnakeCaseTuningTaskDetails {
  /**
   * When tuning started
   */
  start_time?: string;
  /**
   * When tuning completed
   */
  complete_time?: string;
  /**
   * Training snapshots
   */
  snapshots?: TuningSnapshot[];
  /**
   * Hyperparameters used for tuning (in snake_case)
   */
  hyperparameters?: {
    batch_size?: number;
    learning_rate?: number;
    epoch_count?: number;
  };
}

/**
 * Response for getting a tuned model.
 * @public
 */
export interface TunedModelResponse {
  /**
   * The name of the tuned model.
   */
  name: string;
  
  /**
   * Base model used (camelCase in API response).
   */
  baseModel: string;
  
  /**
   * Display name for the tuned model (camelCase in API response).
   */
  displayName: string;
  
  /**
   * The state of the tuned model.
   */
  state: TunedModelState;
  
  /**
   * The creation time in ISO format (camelCase in API response).
   */
  createTime: string;
  
  /**
   * The update time in ISO format (camelCase in API response).
   */
  updateTime: string;
  
  /**
   * Tuning task details (camelCase in API response).
   */
  tuningTask?: TuningTaskDetails;
  
  /**
   * Optional model generation parameters
   */
  temperature?: number;
  topP?: number;
  topK?: number;
  
  /**
   * For backward compatibility - snake_case versions of properties
   */
  base_model?: string;
  display_name?: string;
  create_time?: string;
  update_time?: string;
  tuning_task?: SnakeCaseTuningTaskDetails;
}

/**
 * Metadata about the tuned model.
 * @public
 */
export interface TunedModelMetadata {
  /**
   * The tuned model name.
   */
  tunedModel?: string;
  /**
   * The percentage of completion.
   */
  completedPercent?: number;
}

/**
 * Error detail type for operation responses
 */
export interface ErrorDetail {
  /**
   * Type information for the error detail
   */
  type?: string;
  /**
   * Additional error detail information
   */
  detail?: string;
  /**
   * Any other fields in the error detail
   */
  [key: string]: unknown;
}

/**
 * Response for a tuning operation.
 * @public
 */
export interface TuningOperationResponse {
  /**
   * Whether the operation is done.
   */
  done: boolean;
  /**
   * Metadata about the operation.
   */
  metadata?: TunedModelMetadata;
  /**
   * Error details if the operation failed.
   */
  error?: {
    code: number;
    message: string;
    details?: ErrorDetail[];
  };
}