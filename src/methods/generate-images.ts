/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License ats
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  ImageGenerationPredictResponse,
  ImageGenerationRequest,
  ImageGenerationResponse,
  SingleRequestOptions,
} from "../../types";
import { Task, makeModelRequest } from "../requests/request";
import { convertFromImageGenerationRequest } from "../requests/request-helpers";

import { convertToImageGenerationResponse } from "../requests/response-helpers";

export async function generateImages(
  apiKey: string,
  model: string,
  params: ImageGenerationRequest,
  requestOptions: SingleRequestOptions,
): Promise<ImageGenerationResponse> {
  const predictRequest = convertFromImageGenerationRequest(model, params);
  const response = await makeModelRequest(
    model,
    Task.PREDICT,
    apiKey,
    /* stream */ false,
    JSON.stringify(predictRequest),
    requestOptions,
  );
  const responseJson: ImageGenerationPredictResponse = await response.json();
  return convertToImageGenerationResponse(
    predictRequest.parameters,
    responseJson,
  );
}
