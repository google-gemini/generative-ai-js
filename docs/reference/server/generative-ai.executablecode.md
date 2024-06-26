<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@google/generative-ai](./generative-ai.md) &gt; [ExecutableCode](./generative-ai.executablecode.md)

## ExecutableCode interface

Code generated by the model that is meant to be executed, where the result is returned to the model. Only generated when using the code execution tool, in which the code will be automatically executed, and a corresponding `CodeExecutionResult` will also be generated.

**Signature:**

```typescript
export interface ExecutableCode 
```

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [code](./generative-ai.executablecode.code.md) |  | string | The code to be executed. |
|  [language](./generative-ai.executablecode.language.md) |  | [ExecutableCodeLanguage](./generative-ai.executablecodelanguage.md) | Programming language of the <code>code</code>. |

