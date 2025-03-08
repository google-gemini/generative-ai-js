/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { GoogleGenerativeAI } from "../dist/index.mjs";

// Initialize the Google Generative AI client with your API key
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// List all tuned models
async function listTunedModels() {
  // [START list_tuned_models_sdk]
  // Make sure to include this import:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  
  try {
    console.log("Listing tuned models...");
    
    // Create a model instance - any base model can be used since we're just accessing the API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const listResult = await model.listTunedModels();
    
    // Display the list of tuned models
    if (listResult.tunedModels && listResult.tunedModels.length > 0) {
      console.log("Tuned models:");
      listResult.tunedModels.forEach(model => {
        console.log(`- ${model.name} (${model.state})`);
      });
    } else {
      console.log("No tuned models found");
    }

    // Handle pagination if there are more results
    if (listResult.nextPageToken) {
      console.log("More tuned models available. Use nextPageToken to fetch more.");
    }
    
    return listResult;
  } catch (error) {
    console.error("Error listing tuned models:", error.message);
    return { tunedModels: [] };
  }
  // [END list_tuned_models_sdk]
}

// Create a new tuned model
async function createTunedModel() {
  // [START create_tuned_model_sdk]
  // Make sure to include this import:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  
  // Define training examples
  const examples = [
    { text_input: "1", output: "2" },
    { text_input: "3", output: "4" },
    { text_input: "-3", output: "-2" },
    { text_input: "twenty two", output: "twenty three" },
    { text_input: "two hundred", output: "two hundred one" },
    { text_input: "ninety nine", output: "one hundred" },
    { text_input: "8", output: "9" },
    { text_input: "-98", output: "-97" },
    { text_input: "1,000", output: "1,001" },
    { text_input: "10,100,000", output: "10,100,001" },
    { text_input: "thirteen", output: "fourteen" },
    { text_input: "eighty", output: "eighty one" },
    { text_input: "one", output: "two" },
    { text_input: "three", output: "four" },
    { text_input: "seven", output: "eight" }
  ];

  // Create the tuning request body with the correct nested structure as required by the API
  const requestBody = {
    display_name: "number generator model",
    base_model: "models/gemini-1.5-flash-001-tuning",
    tuning_task: {
      hyperparameters: {
        batch_size: 2,
        learning_rate: 0.001,
        epoch_count: 5,
      },
      training_data: {
        examples: {
          examples: examples
        }
      }
    }
  };

  try {
    // Log the request payload to help with debugging
    console.log("Request payload:", JSON.stringify(requestBody, null, 2));
    
    // Send the tuning request using the SDK
    console.log("Submitting tuning request...");
    
    // Create a model instance with the base model that will be fine-tuned
    const baseModel = genAI.getGenerativeModel({ 
      model: requestBody.base_model.replace("models/", "") 
    });
    
    // Create the tuned model
    const createResult = await baseModel.createTunedModel(requestBody);
    
    console.log("Tuning request submitted:", createResult);
    
    // Get the operation name to monitor progress
    const operationName = createResult.name;
    if (!operationName) {
      console.error("Failed to get operation name", createResult);
      return null;
    }

    // Poll the operation status
    console.log("Checking tuning status...");
    let tuningComplete = false;
    let tunedModelName = null;
    
    while (!tuningComplete) {
      // Wait 5 seconds between status checks
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const operationData = await baseModel.getTuningOperation(operationName);
      const completedPercent = operationData.metadata?.completedPercent || 0;
      
      console.log(`Tuning progress: ${completedPercent}%`);
      
      if (operationData.done) {
        tuningComplete = true;
        tunedModelName = operationData.metadata?.tunedModel;
        console.log("Tuning completed!");
        console.log(`Tuned model name: ${tunedModelName}`);
      }
    }

    // Check the tuned model state
    if (tunedModelName) {
      const modelData = await baseModel.getTunedModel(tunedModelName);
      console.log(`Model state: ${modelData.state}`);
    }
    
    return tunedModelName;
  } catch (error) {
    console.error("Error creating tuned model:", error.message);
    return null;
  }
  // [END create_tuned_model_sdk]
}

// Get a tuned model's details
async function getTunedModel(tunedModelName) {
  // [START get_tuned_model_sdk]
  // Make sure to include this import:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  
  if (!tunedModelName) {
    console.log("No tuned model name provided.");
    return;
  }

  try {
    console.log(`Getting details for tuned model: ${tunedModelName}`);
    
    // Create a model instance - any base model can be used since we're just accessing the API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const modelResponse = await model.getTunedModel(tunedModelName);
    
    console.log("Tuned model details:");
    console.log(`- Name: ${modelResponse.name}`);
    // Handle both camelCase (API response) and snake_case (compatibility) formats
    console.log(`- Display name: ${modelResponse.displayName || modelResponse.display_name}`);
    console.log(`- Base model: ${modelResponse.baseModel || modelResponse.base_model}`);
    console.log(`- State: ${modelResponse.state}`);
    console.log(`- Created: ${modelResponse.createTime || modelResponse.create_time}`);
    console.log(`- Last updated: ${modelResponse.updateTime || modelResponse.update_time}`);
    
    // Display additional information about the model if available
    if (modelResponse.temperature) {
      console.log(`- Temperature: ${modelResponse.temperature}`);
    }
    if (modelResponse.topP) {
      console.log(`- Top-P: ${modelResponse.topP}`);
    }
    if (modelResponse.topK) {
      console.log(`- Top-K: ${modelResponse.topK}`);
    }
    
    // Display tuning task details if available
    if (modelResponse.tuningTask || modelResponse.tuning_task) {
      const task = modelResponse.tuningTask || modelResponse.tuning_task;
      console.log("- Tuning task:");
      
      // Display start and complete times if available
      if (task.startTime) {
        console.log(`  - Started: ${task.startTime}`);
      }
      if (task.completeTime) {
        console.log(`  - Completed: ${task.completeTime}`);
      }
      
      // Display hyperparameters if available
      if (task.hyperparameters) {
        console.log("  - Hyperparameters:");
        const hp = task.hyperparameters;
        
        if (hp.batchSize || hp.batch_size) {
          console.log(`    - Batch size: ${hp.batchSize || hp.batch_size}`);
        }
        if (hp.learningRate || hp.learning_rate) {
          console.log(`    - Learning rate: ${hp.learningRate || hp.learning_rate}`);
        }
        if (hp.epochCount || hp.epoch_count) {
          console.log(`    - Epoch count: ${hp.epochCount || hp.epoch_count}`);
        }
      }
      
      // Display snapshot count if available
      if (task.snapshots && task.snapshots.length > 0) {
        console.log(`  - Training snapshots: ${task.snapshots.length}`);
      }
    }
    
    return modelResponse;
  } catch (error) {
    console.error(`Error getting tuned model details: ${error.message}`);
    return null;
  }
  // [END get_tuned_model_sdk]
}

// Generate content using a tuned model
async function tryTunedModel(tunedModelName) {
  // [START try_tuned_model_sdk]
  // Make sure to include this import:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  
  if (!tunedModelName) {
    console.log("No tuned model name provided.");
    return;
  }
  
  // Get the tuned model using the standard SDK
  // The model name should be the full path like "tunedModels/my-model-id"
  const model = genAI.getGenerativeModel({ 
    model: tunedModelName
  });

  // Test the model with various inputs
  const testInputs = ["5", "42", "ninety eight", "LXIII"];
  
  for (const input of testInputs) {
    try {
      console.log(`Testing with input: "${input}"`);
      const result = await model.generateContent(input);
      console.log(`Output: "${result.response.text()}"`);
    } catch (error) {
      console.error(`Error testing tuned model with input "${input}":`, error);
    }
  }
  // [END try_tuned_model_sdk]
}

// Delete a tuned model
async function deleteTunedModel(tunedModelName) {
  // [START delete_tuned_model_sdk]
  // Make sure to include this import:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  
  if (!tunedModelName) {
    console.log("No tuned model name provided.");
    return;
  }
  
  try {
    console.log(`Deleting tuned model: ${tunedModelName}`);
    
    // Create a model instance - any base model can be used since we're just accessing the API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // First check if the model exists and we have access to it
    try {
      await model.getTunedModel(tunedModelName);
    } catch (checkError) {
      if (checkError.status === 404) {
        console.log(`Model ${tunedModelName} does not exist or has already been deleted.`);
        return true;
      } else if (checkError.status === 403) {
        console.log(`You don't have permission to access model ${tunedModelName}.`);
        return false;
      }
      // For other errors, continue with deletion attempt
    }
    
    await model.deleteTunedModel(tunedModelName);
    
    console.log(`Successfully deleted tuned model: ${tunedModelName}`);
    return true;
  } catch (error) {
    // Handle specific error codes
    if (error.status === 404) {
      console.log(`Model ${tunedModelName} does not exist or has already been deleted.`);
      return true; // Consider this a success since the model doesn't exist
    } else if (error.status === 403) {
      console.log(`You don't have permission to delete model ${tunedModelName}.`);
    } else {
      console.error(`Error deleting tuned model ${tunedModelName}:`, error.message);
    }
    return false;
  }
  // [END delete_tuned_model_sdk]
}

async function runAll() {
  // Comment out or delete any sample cases you don't want to run.
  await listTunedModels();
  
  // Creating a tuned model takes time and costs resources,
  // so you might want to keep this commented out until needed
  //const tunedModelName = await createTunedModel();
  
  // To use an existing tuned model, uncomment and replace with your model name:
  //const tunedModelName = "tunedModels/number";
  //await getTunedModel(tunedModelName);
  //await tryTunedModel(tunedModelName);
  
  // Deleting is permanent, so be careful with this:
  //await deleteTunedModel(tunedModelName);
}

runAll();