import { SmartGenerativeAI } from '../src/utils/smart-client';

async function main() {
  const API_KEY = process.env.GEMINI_API_KEY || 'your-api-key';
  const smartAI = new SmartGenerativeAI(API_KEY);

  try {
    // This will automatically fall back to gemini-2.5-flash or gemini-2.0-flash
    // if gemini-1.5-flash is not available
    console.log('Requesting gemini-1.5-flash...');
    const model = await smartAI.getGenerativeModel('gemini-1.5-flash');
    
    const result = await model.generateContent('Write a haiku about coding');
    console.log('\nResponse:', result.response.text());
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
