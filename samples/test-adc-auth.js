const { GoogleGenerativeAI } = require("../dist");

async function testApiKeyAuth() {
  console.log("===== Testing API Key Authentication =====");
  
  const API_KEY = process.env.API_KEY || "INVALID_KEY";
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log("API Key Authentication - Model initialized successfully");
    console.log("Attempting to generate content...");
    
    try {
      const result = await model.generateContent("Write a short greeting");
      console.log("Response:", result.response.text());
      console.log("API Key Authentication - SUCCESS");
    } catch (error) {
      console.error("Error during content generation:", error.message);
      console.log("API Key Authentication test completed with expected error - This is normal if using invalid key");
    }
  } catch (error) {
    console.error("Error initializing with API key:", error.message);
  }
}

async function testAdcAuth() {
  console.log("\n===== Testing ADC Authentication =====");
  
  try {
    const genAI = new GoogleGenerativeAI(undefined, { useAdc: true });
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log("ADC Authentication - Model initialized successfully");
    console.log("Attempting to generate content...");
    
    try {
      const result = await model.generateContent("Write a short greeting");
      console.log("Response:", result.response.text());
      console.log("ADC Authentication - SUCCESS");
    } catch (error) {
      if (error.message.includes("google-auth-library")) {
        console.error("Error: google-auth-library not installed. Run: npm install google-auth-library");
      } else if (error.message.includes("Failed to get ADC token")) {
        console.error("Error: ADC credentials not configured properly");
        console.error("For local development, run: gcloud auth application-default login");
        console.error("For Cloud environments, ensure service account has proper permissions");
      } else {
        console.error("Error during content generation:", error.message);
      }
      console.log("ADC Authentication test completed with expected error - This is normal if ADC is not configured");
    }
  } catch (error) {
    console.error("Error initializing with ADC:", error.message);
  }
}

async function testNoAuth() {
  console.log("\n===== Testing No Authentication =====");
  
  try {
    const genAI = new GoogleGenerativeAI(undefined, { useAdc: false });
    console.log("Model initialized without authentication - This should not happen");
  } catch (error) {
    console.log("Expected error when providing no authentication:", error.message);
    console.log("No Authentication test - SUCCESS (properly rejected)");
  }
}

async function runTests() {
  await testApiKeyAuth();
  await testAdcAuth();
  await testNoAuth();
  
  console.log("\n===== All Tests Completed =====");
}

runTests(); 