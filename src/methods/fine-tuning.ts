/**
 * Example interfaces for your fine-tuning API responses.
 * Adjust the fields to match the real API responses.
 */
export interface ListTunedModelsResponse {
    tunedModels: Array<{ name: string }>;
  }
  
  export interface CreateTunedModelResponse {
    name: string;
  }
  
  export interface CheckTuningStatusResponse {
    metadata: {
      completedPercent: number;
      // Add more fields if needed
    };
  }
  
  export interface DeleteTunedModelResponse {
    success: boolean;
  }
  
  /**
   * A simple fetchWithRetry helper. (No changes needed here)
   */
  export async function fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = 3,
    delay = 1000
  ): Promise<Response> {
    let lastError: unknown;
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw lastError;
  }
  
  /**
   * Lists tuned models.
   */
  export async function listTunedModels(
    apiKey: string,
    pageSize = 5
  ): Promise<ListTunedModelsResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/tunedModels?page_size=${pageSize}&key=${apiKey}`;
    const response = await fetchWithRetry(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response.json() as Promise<ListTunedModelsResponse>;
  }
  
  /**
   * Creates a tuned model.
   */
  export async function createTunedModel(
    apiKey: string,
    displayName: string,
    trainingData: unknown
  ): Promise<CreateTunedModelResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/tunedModels?key=${apiKey}`;
    const payload = {
      display_name: displayName,
      base_model: "models/gemini-1.5-flash-001-tuning",
      tuning_task: {
        hyperparameters: {
          batch_size: 2,
          learning_rate: 0.001,
          epoch_count: 5,
        },
        training_data: {
          examples: trainingData,
        },
      },
    };
  
    const response = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json() as Promise<CreateTunedModelResponse>;
  }
  
  /**
   * Checks the tuning status of a fine-tuning operation.
   */
  export async function checkTuningStatus(
    apiKey: string,
    operationName: string
  ): Promise<CheckTuningStatusResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`;
    const response = await fetchWithRetry(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response.json() as Promise<CheckTuningStatusResponse>;
  }
  
  /**
   * Deletes a tuned model.
   */
  export async function deleteTunedModel(
    apiKey: string,
    modelName: string
  ): Promise<DeleteTunedModelResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/tunedModels/${modelName}?key=${apiKey}`;
    const response = await fetchWithRetry(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    return response.json() as Promise<DeleteTunedModelResponse>;
  }
  