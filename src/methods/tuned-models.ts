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

import {  ListTunedModelsResponse, SingleRequestOptions } from "../../types";
import {  Task, constructBackwardCompatibleRequest, makeRequest } from "../requests/request";

export async function makeRequests(task: Task, apiKey: string, stream:boolean, body: string, requestOptions: SingleRequestOptions = {}, queryParams: Record<string, string | number>={}): Promise<Response>{

    const {url, fetchOptions}  = await constructBackwardCompatibleRequest(task, apiKey, stream, body, requestOptions, queryParams);
    const response = await makeRequest(url, fetchOptions);
    return response;
}

export async function listTunedModels(
    apiKey: string,
    pageSize: number = 50
): Promise<ListTunedModelsResponse> {
    const response = await makeRequests(Task.TUNED_MODELS, apiKey, false, "", {} , {pageSize});
    return response.json();
}