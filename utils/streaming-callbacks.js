/**
 * Utility functions for handling streamed responses with callbacks
 */

/**
 * Process a streamed response with callback functions
 * 
 * @param {Object} options - Configuration options
 * @param {Array|String} options.prompt - The prompt to send to the model
 * @param {Object} options.model - The Gemini model instance
 * @param {Function} options.onData - Callback called for each chunk of data (receives the text chunk)
 * @param {Function} options.onEnd - Callback called when streaming ends (receives the complete response text)
 * @param {Object} options.generateOptions - Optional parameters to pass to generateContentStream
 * @returns {Promise<string>} - The complete response text
 */
async function getStreamedResponse({ 
  prompt, 
  model, 
  onData = () => {}, 
  onEnd = () => {},
  generateOptions = {}
}) {
  if (!prompt) throw new Error('Prompt is required');
  if (!model) throw new Error('Model is required');
  
  const response = await model.generateContentStream(prompt, generateOptions);
  
  let fullResponseText = '';
  
  try {
    for await (const chunk of response.stream) {
      if (chunk) {
        const chunkText = chunk.text();
        
        if (typeof onData === 'function') {
          onData(chunkText);
        }
        
        fullResponseText += chunkText;
      }
    }
    
    if (typeof onEnd === 'function') {
      await onEnd(fullResponseText);
    }
    
    return fullResponseText;
  } catch (error) {
    console.error('Error processing streamed response:', error);
    throw error;
  }
}

/**
 * Process a chat streamed response with callback functions
 * 
 * @param {Object} options - Configuration options
 * @param {Array|String} options.message - The message to send to the chat session
 * @param {Object} options.chatSession - The Gemini chat session instance
 * @param {Function} options.onData - Callback called for each chunk of data
 * @param {Function} options.onEnd - Callback called when streaming ends
 * @returns {Promise<string>} - The complete response text
 */
async function getStreamedChatResponse({ 
  message, 
  chatSession, 
  onData = () => {}, 
  onEnd = () => {} 
}) {
  if (!message) throw new Error('Message is required');
  if (!chatSession) throw new Error('Chat session is required');
  
  const response = await chatSession.sendMessageStream(message);
  
  let fullResponseText = '';
  
  try {
    for await (const chunk of response.stream) {
      if (chunk) {
        const chunkText = chunk.text();
        
        if (typeof onData === 'function') {
          onData(chunkText);
        }
        
        fullResponseText += chunkText;
      }
    }
    
    if (typeof onEnd === 'function') {
      await onEnd(fullResponseText);
    }
    
    return fullResponseText;
  } catch (error) {
    console.error('Error processing streamed chat response:', error);
    throw error;
  }
}

module.exports = {
  getStreamedResponse,
  getStreamedChatResponse
}; 