<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@google/generative-ai](./generative-ai.md) &gt; [GoogleAIFileManager](./generative-ai.googleaifilemanager.md) &gt; [listFiles](./generative-ai.googleaifilemanager.listfiles.md)

## GoogleAIFileManager.listFiles() method

List all uploaded files.

Any fields set in the optional [SingleRequestOptions](./generative-ai.singlerequestoptions.md) parameter will take precedence over the [RequestOptions](./generative-ai.requestoptions.md) values provided at the time of the [GoogleAIFileManager](./generative-ai.googleaifilemanager.md) initialization.

**Signature:**

```typescript
listFiles(listParams?: ListParams, requestOptions?: SingleRequestOptions): Promise<ListFilesResponse>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  listParams | [ListParams](./generative-ai.listparams.md) | _(Optional)_ |
|  requestOptions | [SingleRequestOptions](./generative-ai.singlerequestoptions.md) | _(Optional)_ |

**Returns:**

Promise&lt;[ListFilesResponse](./generative-ai.listfilesresponse.md)<!-- -->&gt;

