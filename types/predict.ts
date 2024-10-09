export type PredictServiceBasicValueType =
  | string
  | number
  | boolean;

export type PredictServiceValueType =
  | PredictServiceBasicValueType
  | Record<string, PredictServiceBasicValueType>;
