export type PredictServiceBasicValueType =
  | string
  | number
  | boolean;

export type PredictServiceValueType =
  | PredictServiceBasicValueType
  | Record<string, PredictServiceBasicValueType>;

/**
 * Request message for [PredictionService.Predict][].
 * This is an internal class. Please do not depend on it.
 */
export interface PredictRequest {
  /**
   * The name of the model for prediction.
   */
  model?: string;
  /**
   * The instances that are the input to the prediction call.
   */
  instances?: PredictServiceValueType[];
  /**
   * The parameters that govern the prediction call.
   */
  parameters?: PredictServiceValueType;
}


/**
 * Each image data for response of [PredictionService.Predict].
 * This is an internal class. Please do not depend on it.
 */
export interface ImageGenerationPredictResponseImageData {
  bytesBase64Encoded: string
  mimeType: string
}

/**
 * Response message for [PredictionService.Predict].
 * This is an internal class. Please do not depend on it.
 */
export interface ImageGenerationPredictResponse {
  /**
   * The outputs of the prediction call.
   */
  predictions?: ImageGenerationPredictResponseImageData[];
}
