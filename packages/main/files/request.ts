import { DEFAULT_API_VERSION, DEFAULT_BASE_URL } from "../src/requests/request";
import { RequestOptions } from "../types";
import { FilesTask } from "./types";

const taskToMethod = {
  [FilesTask.UPLOAD]: "POST",
  [FilesTask.LIST]: "GET",
  [FilesTask.GET]: "GET",
  [FilesTask.DELETE]: "DELETE",
};

export class FilesRequestUrl {
  private _url: URL;

  constructor(
    public task: FilesTask,
    public apiKey: string,
    public requestOptions: RequestOptions,
  ) {
    const apiVersion = this.requestOptions?.apiVersion || DEFAULT_API_VERSION;
    const baseUrl = this.requestOptions?.baseUrl || DEFAULT_BASE_URL;
    let initialUrl = baseUrl;
    if (this.task === FilesTask.UPLOAD) {
      initialUrl += `/upload`;
    }
    initialUrl += `/${apiVersion}/files`;
    this._url = new URL(initialUrl);
  }

  appendPath(path: string): void {
    this._url.pathname = this._url.pathname + `/${path}`;
  }

  appendParam(key: string, value: string): void {
    this._url.searchParams.append(key, value);
  }

  toString(): string {
    return this._url.toString();
  }
}

export function getHeaders(url: FilesRequestUrl): Headers {
  const headers = new Headers();
  // headers.append("x-goog-api-client", getClientHeaders(url.requestOptions));
  headers.append("x-goog-api-key", url.apiKey);
  return headers;
}

export async function makeFilesRequest(
  url: FilesRequestUrl,
  headers: Headers,
  body?: string | Buffer,
): Promise<Response> {
  const requestInit: RequestInit = {
    method: taskToMethod[url.task],
    headers,
  };
  if (body) {
    requestInit.body = body;
  }
  const response = await fetch(url.toString(), requestInit);
  return response;
}
