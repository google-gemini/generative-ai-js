

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getStreamedResponse, getStreamedChatResponse } = require("./utils/streaming-callbacks");


const API_KEY = "AIzaSyDahQlerUJgwzT2n1FFx4woWRG5CNAw2-8";
const genAI = new GoogleGenerativeAI(API_KEY);

async function basicStreamingWithCallbacks() {
  console.log("\n===== EXAMPLE 1: BASIC STREAMING WITH CALLBACKS =====");
  

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = "Write a short story about an AI assistant helping a developer";
  console.log(`Prompt: ${prompt}`);
  
  console.log("\nResponse (streaming with callbacks):");
  

  const mockSaveToDatabase = async (text) => {
    console.log(`\n[DATABASE] Saved complete response (${text.length} characters)`);
    return true;
  };
  

  let chunkCount = 0;
  

  await getStreamedResponse({
    prompt,
    model,
    onData: (chunkText) => {
      
      chunkCount++;
      process.stdout.write(chunkText);
      
      
      if (chunkCount % 5 === 0) {
        process.stdout.write(` [Chunk #${chunkCount}]`);
      }
    },
    onEnd: async (fullText) => {
      
      console.log("\n\n[EVENT] Stream complete!");
      
    
      await mockSaveToDatabase(fullText);
      
      
      console.log(`[STATS] Received ${chunkCount} chunks in total`);
    }
  });
}

/**
 * Example 2: Chat streaming with callbacks
 */
async function chatStreamingWithCallbacks() {
  console.log("\n===== EXAMPLE 2: CHAT STREAMING WITH CALLBACKS =====");
  

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "I'm developing a JavaScript application. Can you help me?" }]
      },
      {
        role: "model",
        parts: [{ text: "I'd be happy to help with your JavaScript application! What specific aspect are you working on or having trouble with?" }]
      }
    ]
  });
  

  const message = [{ text: "I need to implement error handling for asynchronous functions. What's the best approach?" }];
  console.log(`User: ${message[0].text}`);
  
  console.log("\nAI (streaming with callbacks):");
  
  
  const startTime = Date.now();
  
  // Mock analytics tracking function
  const mockTrackAnalytics = async (fullResponse, timing) => {
    console.log(`\n[ANALYTICS] Response generated in ${timing}ms`);
    console.log(`[ANALYTICS] Response length: ${fullResponse.length} characters`);
    return true;
  };
  
  // Use the getStreamedChatResponse function
  await getStreamedChatResponse({
    message,
    chatSession: chat,
    onData: (chunkText) => {
     
      process.stdout.write(chunkText);
    },
    onEnd: async (fullText) => {
      
      const duration = Date.now() - startTime;
      console.log("\n\n[EVENT] Chat response complete!");
      
      // Track analytics when done
      await mockTrackAnalytics(fullText, duration);
    }
  });
}

/**
 * Run all examples
 */
async function runDemos() {
  try {
    await basicStreamingWithCallbacks();
    await chatStreamingWithCallbacks();
    
    console.log("\nAll demos completed successfully!");
  } catch (error) {
    console.error("Error running demos:", error);
  }
}


runDemos(); 