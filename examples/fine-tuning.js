require('dotenv').config();
const { GoogleGenerativeAI } = require('../dist/index');

// Get API key from environment variable
const API_KEY = process.env.GOOGLE_API_KEY;

async function runFineTuningExample() {
  // Initialize the Generative AI SDK
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  // Get the FineTuning instance
  const fineTuning = genAI.getFineTuning();
  
  try {
    // Create a new fine-tuning job
    const newJob = await fineTuning.createFineTuningJob({
      baseModelId: "gemini-1.5-pro",
      trainingDataPath: "gs://your-bucket/your-training-data.jsonl",
      validationDataPath: "gs://your-bucket/your-validation-data.jsonl",
      hyperParameters: {
        batchSize: 4,
        learningRate: 0.0002,
        epochCount: 3
      },
      outputModelName: "my-custom-gemini-model"
    });
    
    console.log("Created fine-tuning job:", newJob);
    
    // Get the status of a fine-tuning job
    const jobStatus = await fineTuning.getFineTuningJob(newJob.jobId);
    console.log("Job status:", jobStatus);
    
    // List all fine-tuning jobs
    const jobs = await fineTuning.listFineTuningJobs();
    console.log("All jobs:", jobs);
    
    // Cancel a fine-tuning job if needed
    // const cancelledJob = await fineTuning.cancelFineTuningJob(newJob.jobId);
    // console.log("Cancelled job:", cancelledJob);
  } catch (error) {
    console.error("Error:", error);
  }
}

runFineTuningExample().catch(console.error); 