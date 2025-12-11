# Smart Model Fallback for Gemini API

## Problem

New Google Cloud accounts may not have access to Gemini 1.5 models (gemini-1.5-flash, gemini-1.5-pro), resulting in `404 Not Found` errors. Instead, they have access to newer Gemini 2.x models.

## Solution

Use the `SmartGenerativeAI` client that automatically discovers available models and falls back to compatible alternatives.

## Usage

```typescript
import { SmartGenerativeAI } from '@google/generative-ai';

const smartAI = new SmartGenerativeAI(process.env.API_KEY);

// Automatically resolves to available model
const model = await smartAI.getGenerativeModel('gemini-1.5-flash');
// If gemini-1.5-flash is unavailable, falls back to:
// 1. gemini-2.5-flash
// 2. gemini-2.0-flash
// 3. gemini-flash-latest
```

## Fallback Priority

| Requested Model | Fallback Chain |
|----------------|----------------|
| gemini-1.5-flash | gemini-2.5-flash → gemini-2.0-flash → gemini-flash-latest |
| gemini-1.5-pro | gemini-2.0-flash → gemini-2.5-flash → gemini-flash-latest |
| gemini-pro | gemini-2.0-flash → gemini-2.5-flash → gemini-flash-latest |

## Benefits

- **No code changes needed**: Drop-in replacement for `GoogleGenerativeAI`
- **Automatic discovery**: Caches available models on first use
- **Clear error messages**: Helpful hints when no models are available
- **Console warnings**: Notifies when fallback is used

## Note for New Accounts

If you created your Google Cloud account after 2024, you likely only have access to Gemini 2.x models. This is expected behavior, not a bug.
