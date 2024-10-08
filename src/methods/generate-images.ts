import {
  ImageGenerationRequest,
  ImageGenerationResponse,
  PredictResponse,
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
  const response = await makeModelRequest(
    model,
    Task.PREDICT,
    apiKey,
    /* stream */ false,
    JSON.stringify(convertFromImageGenerationRequest(model, params)),
    requestOptions,
  );
  const responseJson: PredictResponse = await response.json();
  return convertToImageGenerationResponse(responseJson);
}
