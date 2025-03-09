---
"@google/generative-ai": minor
---

Added support for Application Default Credentials (ADC). This enables more secure authentication when running on Google Cloud environments like GKE or GCE, without the need to manage API keys.

To use ADC:
1. Install the google-auth-library package 
2. Initialize the SDK with `new GoogleGenerativeAI(undefined, { useAdc: true })`
3. Set up ADC through gcloud CLI or service account credentials

See documentation for more details. 