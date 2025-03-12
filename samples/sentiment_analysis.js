import { 
    GoogleGenerativeAI 
} from "@google/generative-ai";

async function runSentimentAnalysis(text) {
    // [START runSentimentAnalysis]
    // Make sure to include these imports:
    // import { GoogleGenerativeAI } from "@google/generative-ai";
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" },  {apiVersion: "v1alpha"},);

  try {
    // Define the prompt for sentiment analysis
    const prompt = `Analyze the sentiment of the following text and classify it as "positive", "negative", or "neutral". Provide a brief explanation.

Text: "${text}"`;

    // Generate content using the model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const sentimentAnalysis = await response.text();

    // Output the result
    console.log("Sentiment Analysis Result:");
    console.log(sentimentAnalysis);
  } catch (error) {
    console.error("Error performing sentiment analysis:", error);
  }
  // [runSentimentAnalysis]
}

// Example usage
const sampleText = "I absolutely love this product! It's amazing and works perfectly.";
runSentimentAnalysis(sampleText);