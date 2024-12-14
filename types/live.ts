/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Content, GenerativeContentBlob, Part } from "./content";
import type { GenerationConfig, Tool } from "./requests";

/**
 * An options for setting a connection way.
 */
export interface LiveConnectionOptions {
  /** Custom WebSocket class used by Live client. */
  WebSocket?: typeof WebSocket;
  /** A function which can provide custom WebSocket instance. */
  createWebSocket?: (url: URL) => WebSocket;
}

// Config

/** Config for speech */
export interface LiveSpeechConfig {
  voiceConfig: {
    prebuiltVoiceConfig: {
      /**
       * The type of voice the model speaks.
       */
      voiceName: string;
    }
  }
}

/**
 * Configrations for live streaming.
 */
export interface LiveConfig {
  /** model name */
  model: string;

  /** Generation config */
  generationConfig?: GenerationConfig & {
    /**
     * Multimodal Part format returned by Gemini.
     * If you specify text, the model will return the text.
     * @default ["AUDIO"]
     */
    responseModalities?: Array<"MODALITY_UNSPECIFIED" | "TEXT" | "IMAGE" | "AUDIO">;

    /** Speech Config. For example, you can change voice style. */
    speechConfig?: LiveSpeechConfig;
  }

  /** System instruction provided by user. */
  systemInstruction?: string | Part | Content;

  /**
   * User provided tools.
   */
  tools?: Tool[];
}

// CLIENT -> SERVER messages

export interface LiveClientContentMessage {
  clientContent: {
    turns: Content[];
    turnComplete: boolean;
  };
}

/** The message which is sended when client is connected. */
export interface LiveSetupMessage {
  setup: LiveConfig;
}

export interface LiveRealtimeInputMessage {
  realtimeInput: {
    /**
     * Chunks a server receives. Only image/jpeg or audio/pcm are supported.
     */
    mediaChunks: GenerativeContentBlob[];
  }
}

/** The messages client sends. */
export type LiveSendingMessage = LiveClientContentMessage | LiveSetupMessage | LiveRealtimeInputMessage;

// SERVER -> CLIENT messages

/**
 * A server sends this content when generating real-time content.
 * Parts may include audio or image, not only text. You can change the format using {@link LiveConfig.generationConfig.responseModalities}.
 */
export interface LiveServerContentGenerating {
  modelTurn: {
    parts: Part[];
  }
}
/**
 * A content server sends when model a turn is completed.
 */
export interface LiveServerContentCompleted {
  turnComplete: true;
}

export type ServerContent = LiveServerContentGenerating | LiveServerContentCompleted;

/**
 * A message server sends when a model generated content or a model stops a model turn.
 */
export interface LiveServerContentMessage {
  serverContent: ServerContent;
}

/** The message that is sended from server. */
export type LiveReceivingMessage = LiveServerContentMessage;
