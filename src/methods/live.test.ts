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

import * as sinonChai from "sinon-chai";
import { expect, use } from "chai";
import { spy } from "sinon";
import { LiveClient } from "./live";
import { GoogleGenerativeAIRequestInputError } from "../errors";
import { LiveReceivingMessage } from "../../types/live";

use(sinonChai);

class WebSocketForTest extends EventTarget implements WebSocket {
  binaryType: BinaryType = 'blob';
  bufferedAmount: number = 0;
  extensions: string = '';
  protocol: string = '';
  readyState: number = 0;
  url: string = '';
  CONNECTING: 0 = 0;
  OPEN: 1 = 1;
  CLOSING: 2 = 2;
  CLOSED: 3;

  constructor(init: {
    send(this: WebSocketForTest, data: string | ArrayBufferLike | Blob | ArrayBufferView): void
    close(this: WebSocketForTest, code?: number, reason?: string): void
  }) {
    super();
    this.send = init.send.bind(this);
    this.close = init.close.bind(this);

    this.addEventListener('open', (evt) => {
      this.onopen?.call(this, evt);
    });
    this.addEventListener('message', (evt) => {
      this.onmessage?.call(this, evt as MessageEvent);
    });
    this.addEventListener('close', (evt) => {
        this.onclose?.call(this, evt as CloseEvent);
    });
    this.addEventListener('error', (evt) => {
        this.onerror?.call(this, evt);
    });
  }

  send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
  close: (code?: number, reason?: string) => void;

  onclose: (this: WebSocketForTest, ev: CloseEvent) => any = () => null;
  onmessage: (this: WebSocketForTest, ev: MessageEvent) => any = () => null;
  onerror: (this: WebSocketForTest, ev: Event) => any = () => null;
  onopen: (this: WebSocketForTest, ev: Event) => any = () => null;
}

describe("LiveClient", () => {
  it("sendRealtimeContent can only send image/jpeg or audio/pcm", () => {
    const sendSpy = spy();
    const client = new LiveClient(new WebSocketForTest({
      send(data) {
        sendSpy(data);
      },
      close() {},
    }));

    expect(() => client.sendRealtimeContent([{
      mimeType: 'audio/mp3',
      data: ''
    }])).to.throw(GoogleGenerativeAIRequestInputError);
    expect(sendSpy.notCalled).to.is.true;

    client.sendRealtimeContent([{
      mimeType: 'audio/pcm',
      data: ''
    }]);
    expect(sendSpy.calledOnce).to.is.true;

    client.sendRealtimeContent([{
      mimeType: 'image/jpeg',
      data: ''
    }]);
    expect(sendSpy.calledTwice).to.is.true;
  });
  it("listen() should handle messages", async () => {
    const ws = new WebSocketForTest({
      send(data) {
        this.dispatchEvent(new MessageEvent('message', {
          data
        }));
      },
      close() {}
    });
    const client = new LiveClient(ws);
    const generator = client.listen();

    const message: LiveReceivingMessage = {
      serverContent: {
        turnComplete: true
      }
    };
    ws.send(JSON.stringify(message));

    const { value } = await generator.next();

    expect(value).to.be.deep.equals(message);
  });
  it("dissconnect() should make done listen() and close WebSocket", async () => {
    const closeSpy = spy();
    const ws = new WebSocketForTest({
      send() {},
      close() {
        closeSpy();
      }
    });
    const client = new LiveClient(ws);
    const generator = client.listen();
    await client.disconnect();
    const { done } = await generator.next();
    expect(done).to.be.true;
    expect(closeSpy).have.been.called;
  });
});
