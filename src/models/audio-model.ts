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

import {
    GenerateSpeechRequest,
    GenerateSpeechResponse,
    ModelParams,
    RequestOptions,
    SingleRequestOptions
} from "../../types";
import { generateSpeech } from "../methods/generate-speech";
import { formatGenerateSpeechInput } from "../requests/request-helpers";

/**
 * Class for speech generative model APIs.
 * @public
 */
export class SpeechGenerationModel {
    model: string;
    constructor(
        public apiKey: string,
        modelParams: ModelParams,
        private _requestOptions: RequestOptions = {},
    ) {
        if (modelParams.model.includes("/")) {
            // Models may be named "models/model-name" or "tunedModels/model-name"
            this.model = modelParams.model;
        } else {
            // If path is not included, assume it's a non-tuned model.
            this.model = `models/${modelParams.model}`;
        }
    }
    /**
     * Makes a single non-streaming call to the model
     * and returns an object containing a single {@link GenerateSpeechResponse}.
     *
     * Fields set in the optional {@link SingleRequestOptions} parameter will
     * take precedence over the {@link RequestOptions} values provided to
     * {@link GoogleGenerativeAI.getSpeechGenerationModel }.
     */
    async generateSpeech(
        request: GenerateSpeechRequest | string,
        requestOptions: SingleRequestOptions = {},
    ): Promise<GenerateSpeechResponse> {
        const generativeModelRequestOptions: SingleRequestOptions = {
            ...this._requestOptions,
            ...requestOptions,
        };
        return generateSpeech(
            this.apiKey,
            this.model,
            formatGenerateSpeechInput(request),
            generativeModelRequestOptions,
        );
    }
}