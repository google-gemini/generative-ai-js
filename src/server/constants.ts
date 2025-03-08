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
 * RPC task types for server requests.
 * @public
 */
export enum RpcTask {
  /**
   * File tasks
   */
  UPLOAD = "upload",
  GET_FILE = "get_file",
  LIST_FILES = "list_files",
  DELETE_FILE = "delete_file",
  UPDATE_FILE = "update_file",

  /**
   * CachedContent tasks
   */
  GET = "get",
  CREATE = "create",
  DELETE = "delete",
  LIST = "list",
  UPDATE = "update",
  
  /**
   * TunedModel tasks
   */
  LIST_TUNED_MODELS = "list_tuned_models",
  GET_TUNED_MODEL = "get_tuned_model",
  CREATE_TUNED_MODEL = "create_tuned_model",
  DELETE_TUNED_MODEL = "delete_tuned_model",
  GET_TUNING_OPERATION = "get_tuning_operation",
}
