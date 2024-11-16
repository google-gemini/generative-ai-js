---
"@google/generative-ai": patch
---

Make sure chat api do not send empty text request after encounter any server error that returns empty response. This fixes issue #124 and issue #286.
