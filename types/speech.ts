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

/**
 * A turn in a multi-turn conversation.
 * @public
 */
export interface SpeechTurn {
    /**
     * The text to speak.
     */
    text?: string;

    /**
     * The voice to speak.
     */
    voice?: string;
}

/**
 * Configurations for the audio to be generated.
 * @public
 */
export interface AudioConfig {
    /** 
     * MIME type of the generated audio.
     */
    responseMimeType?: 'audio/wav';
    /**
     * Number of the speed.
     */
    speed?: number;
}
