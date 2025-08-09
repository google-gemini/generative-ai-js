import { BaseImageParams, GenerateImagesResult, ImageModelParams, SingleRequestOptions } from "../../types";
import { RequestOptions } from "../server";
import {generateImages} from "../methods/generate-image"
export class ImageModel{
    model:string;
    modelParams:ImageModelParams;
     
    constructor(
        public apiKey: string,
        modelParams: ImageModelParams,
        private _requestOptions: RequestOptions = {},
      ) 
      {
        if (modelParams.model.includes("/")) {
            // Models may be named "models/model-name" or "tunedModels/model-name"
            this.model = modelParams.model;
          } else {
            // If path is not included, assume it's a non-tuned model.
            this.model = `models/${modelParams.model}`;
          }
        this.modelParams=modelParams;
      }


 async generateImages(prompt:string,requestConfig?:BaseImageParams,requestOptions?:SingleRequestOptions
      ):Promise<GenerateImagesResult>{
        const Params: ImageModelParams={
            model:this.model,
            ...requestConfig,
        }

        const generativeModelRequestOptions: SingleRequestOptions = {
            ...this._requestOptions,
            ...requestOptions,
          };

        return generateImages(this.apiKey,this.model,{
            instances:[{prompt}],
            paramaters: {
                ...this.modelParams,
                ...Params, 
            }, 
        },generativeModelRequestOptions);
      }
}
