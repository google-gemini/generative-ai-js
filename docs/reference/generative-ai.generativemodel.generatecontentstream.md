<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@google/generative-ai](./generative-ai.md) &gt; [GenerativeModel](./generative-ai.generativemodel.md) &gt; [generateContentStream](./generative-ai.generativemodel.generatecontentstream.md)

## GenerativeModel.generateContentStream() method

Makes a single streaming call to the model and returns an object containing an iterable stream that iterates over all chunks in the streaming response as well as a promise that returns the final aggregated response.

**Signature:**

```typescript
generateContentStream(request: GenerateContentRequest | string | Array<string | Part>): Promise<GenerateContentStreamResult>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  request | [GenerateContentRequest](./generative-ai.generatecontentrequest.md) \| string \| Array&lt;string \| [Part](./generative-ai.part.md)<!-- -->&gt; |  |

**Returns:**

Promise&lt;[GenerateContentStreamResult](./generative-ai.generatecontentstreamresult.md)<!-- -->&gt;
