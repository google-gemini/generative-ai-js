import { GoogleGenerativeAI } from '../index';
import { ModelFallbackManager } from './model-fallback';

export class SmartGenerativeAI {
  private fallbackManager: ModelFallbackManager;

  constructor(apiKey: string) {
    this.fallbackManager = new ModelFallbackManager(apiKey);
  }

  async getGenerativeModel(params: any): Promise<any> {
    const modelName = typeof params === 'string' ? params : params.model;
    
    try {
      // Resolve model with fallback
      const resolvedModel = await this.fallbackManager.resolveModel(modelName);
      
      // Get the actual GenerativeAI instance
      const genAI = this.fallbackManager.getGenerativeAI();
      
      // Create model with resolved name
      if (typeof params === 'string') {
        return genAI.getGenerativeModel({ model: resolvedModel });
      } else {
        return genAI.getGenerativeModel({ ...params, model: resolvedModel });
      }
    } catch (error) {
      throw error;
    }
  }
}
