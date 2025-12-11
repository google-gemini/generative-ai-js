// Try one of these import patterns:
// Option 1: From main index
import { GoogleGenerativeAI } from '../index';

// Known model mappings based on Google's Gemini model availability
interface ModelInfo {
  name: string;
  [key: string]: any;
}

class ModelFallbackManager {
  private genAI: GoogleGenerativeAI;
  private testedModels: Map<string, boolean> = new Map();
  
  // Model fallback priority map
  private readonly fallbackMap: Record<string, string[]> = {
    'gemini-1.5-flash': ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'],
    'gemini-1.5-pro': ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-flash-latest'],
    'gemini-pro': ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-flash-latest'],
  };

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  private async isModelAvailable(modelName: string): Promise<boolean> {
    // Check cache first
    if (this.testedModels.has(modelName)) {
      return this.testedModels.get(modelName)!;
    }

    try {
      // Try to create a model instance - if it fails, model is not available
      const model = this.genAI.getGenerativeModel({ model: modelName });
      // Make a minimal test call to verify availability
      await model.generateContent('test');
      this.testedModels.set(modelName, true);
      return true;
    } catch (error: any) {
      // 404 or model not found errors indicate unavailability
      const isNotFound = error?.message?.includes('404') || 
                        error?.message?.includes('not found') ||
                        error?.status === 404;
      this.testedModels.set(modelName, !isNotFound);
      return !isNotFound;
    }
  }

  async resolveModel(requestedModel: string): Promise<string> {
    const cleanModelName = requestedModel.replace('models/', '');

    // Try requested model first
    if (await this.isModelAvailable(cleanModelName)) {
      return cleanModelName;
    }

    // Try fallbacks
    const fallbacks = this.fallbackMap[cleanModelName] || [];
    for (const fallback of fallbacks) {
      if (await this.isModelAvailable(fallback)) {
        return fallback;
      }
    }

    // No fallback found
    const triedModels = [cleanModelName, ...fallbacks].join(', ');
    throw new Error(
      `Model '${cleanModelName}' not found and no suitable fallback available.\n` +
      `Tried models: ${triedModels}\n` +
      `Tip: New Google Cloud accounts may only have access to Gemini 2.x models.`
    );
  }

  getGenerativeAI(): GoogleGenerativeAI {
    return this.genAI;
  }
}

export { ModelFallbackManager };
