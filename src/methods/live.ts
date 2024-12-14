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

import type {
  LiveConnectionOptions,
  BidiGenerateContentSetup,
  LiveReceivingMessage,
  LiveSendingMessage,
} from "../../types/live";
import { GoogleGenerativeAIFetchError, GoogleGenerativeAIRequestInputError, GoogleGenerativeAIResponseError } from "../errors";
import type { Content, GenerativeContentBlob, Part, RequestOptions } from "../server";

const getWebSocketUrl = (apiKey: string, baseUrl?: string | URL): URL => {
  const url = new URL(baseUrl ?? 'https://generativelanguage.googleapis.com/');
  url.protocol = url.protocol === 'http:' ? 'ws:' : 'wss:';
  url.pathname = '/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent';
  url.searchParams.set('key', apiKey);
  return url;
};

/**
 * Gemini Live Stream API Client.
 */
export class LiveClient {
  #ws: WebSocket;

  #responseReadable: ReadableStream<LiveReceivingMessage>;
  #responseWriter: WritableStreamDefaultWriter<LiveReceivingMessage>;

  constructor(connectedWS: WebSocket) {
    connectedWS.onmessage = (evt) => {
      return this.#onMessage(evt);
    };
    connectedWS.onclose = async (evt) => {
      if (evt.reason.includes('error')) {
        throw new GoogleGenerativeAIResponseError(`Closed WebSocket connection due to ${evt.reason}`);
      }
      await this.disconnect();
    };

    this.#ws = connectedWS;
    
    const transformStream = new TransformStream<LiveReceivingMessage>();
    this.#responseReadable = transformStream.readable;
    this.#responseWriter = transformStream.writable.getWriter();
  }

  /**
   * Listens messages from server. You can call this function only once.
   * @returns AsyncGenerator that yields messages from server.
   */
  async * listen(): AsyncGenerator<LiveReceivingMessage>{
    const reader = this.#responseReadable.getReader();
    while (true) {
      const read = await reader.read();
      if (read.done) {
        return;
      }
      if (read.value) {
        yield read.value;
      }
    }
  }

  /**
   * Sending parts, which don't include audio.
   * @param parts Text Parts.
   * @param endOfTurn Is the part end of turn.
   */
  send(parts: Part | Part[], endOfTurn: boolean = true): void {
    const content: Content = {
      role: 'user',
      parts: Array.isArray(parts) ? parts : [parts]
    };
    const message: LiveSendingMessage = {
      clientContent: {
        turns: [content],
        turnComplete: endOfTurn
      },
    };
    this.#sendJSON(message);
  }

  /**
   * Sending video/audio to a model.
   * @param chunks Chunks to send a model. Only image/jpeg or audio/pcm is supported.
   */
  sendRealtimeContent(chunks: GenerativeContentBlob[]): void {
    for (const chunk of chunks) {
      if (!chunk.mimeType.startsWith('image/jpeg') && !chunk.mimeType.startsWith('audio/pcm')) {
        throw new GoogleGenerativeAIRequestInputError(`mimetype ${chunk.mimeType} is not supported.`);
      }
    }
    this.#sendJSON({
      realtimeInput: {
        mediaChunks: chunks
      }
    });
  }

  /**
   * Disconnect the connection. WebSocket connection and {@link LiveClient.listen} will be closed.
   */
  async disconnect(): Promise<void> {
    await this.#responseWriter.close();
    await this.#responseReadable.cancel();
    this.#ws.close();
  }

  /** Send data with JSON */
  #sendJSON(data: LiveSendingMessage): void {
    const json = JSON.stringify(data);
    this.#ws.send(json);
  }

  #receiveJSON(data: LiveReceivingMessage): Promise<void> {
    return this.#responseWriter.write(data);
  }
  async #receiveBlob(blob: Blob): Promise<void> {
    await this.#responseWriter.write(JSON.parse(await blob.text()));
  }
  async #onMessage(evt: MessageEvent<string | ArrayBuffer | Blob>): Promise<void> {
    if (evt.data instanceof Blob) {
      // Blob data
      // Process audio.
      await this.#receiveBlob(evt.data);
    } else if (evt.data instanceof ArrayBuffer) {
      await this.#receiveBlob(new Blob([evt.data]));
    } else {
      // JSON data
      const parsed = JSON.parse(evt.data);
      await this.#receiveJSON(parsed);
    }
  }
}

export interface ConnectOptions {
  requestOptions: RequestOptions
  apiKey: string
  setup: BidiGenerateContentSetup
}

/**
 * Connect to WebSocket server.
 */
export const connect = async (options: ConnectOptions, connectionOptions: LiveConnectionOptions): Promise<LiveClient> => {
  const createWebSocket = connectionOptions.createWebSocket ?? ((url) => {
    return new (globalThis.WebSocket ?? connectionOptions.WebSocket)(url);
  });

  const websocketUrl = getWebSocketUrl(options.apiKey, options.requestOptions.baseUrl);
  const ws = createWebSocket(websocketUrl);

  ws.onerror = () => {
    throw new GoogleGenerativeAIFetchError('Connecting to WebSocket server failed.');
  };

  // Wait for connecting
  await new Promise(resolve => {
    ws.onopen = resolve;
  });

  // setup
  await new Promise((resolve, reject) => {
    ws.send(JSON.stringify({
      setup: options.setup
    } satisfies LiveSendingMessage));
    ws.onclose = (evt) => reject(new GoogleGenerativeAIRequestInputError(`Live connection setup failed: ${evt.reason}`));
    ws.onmessage = (evt) => {
      const json = JSON.parse(evt.data);
      if ((json !== null) && typeof json === 'object' && ('setupComplete' in json)) {
        resolve(null);
      }
    };
  });
  ws.onmessage = null;
  ws.onclose = null;

  return new LiveClient(ws);
};
