require('dotenv').config();
const { GoogleGenerativeAI } = require('./gen-ai');

// Get API key from environment variable
const API_KEY = process.env.GOOGLE_API_KEY;

async function run() {
  // Initialize the Generative AI SDK
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  // Get a generative model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  // Make a simple text generation request
  const result = await model.generateContent("Hello, what can you do?");
  const response = await result.response;
  const text = response.text();
  
  console.log(text);
}

run().catch(console.error); 