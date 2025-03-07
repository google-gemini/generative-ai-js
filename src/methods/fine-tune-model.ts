import {  ListTunedModelsResponse, SingleRequestOptions } from "../../types";
import {  Task, constructBackwardCompatibleRequest, makeRequest } from "../requests/request";

export async function makeRequests(task: Task, apiKey: string, stream:boolean, body: string, requestOptions: SingleRequestOptions = {}, queryParams: Record<string, string | number>={}): Promise<Response>{

    const {url, fetchOptions}  = await constructBackwardCompatibleRequest(task, apiKey, stream, body, requestOptions, queryParams);
    const response = await makeRequest(url, fetchOptions);
    return response;
}

export async function listTunedModels(
    apiKey: string,
    pageSize: number = 50
): Promise<ListTunedModelsResponse> {
    const response = await makeRequests(Task.TUNED_MODELS, apiKey, false, "", {} , {pageSize});
    return response.json();
}