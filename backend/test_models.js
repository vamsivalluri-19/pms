import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

const apiKey = process.env.GEMINI_API_KEY;
console.log('Using API Key:', apiKey?.slice(0, 15) + '...');

const run = async () => {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    console.log('Models list response status:', res.status);
    if (data.models) {
      console.log('Available models:');
      data.models.forEach(m => console.log(m.name));
    } else {
      console.log('No models returned. Response payload:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Error listing models:', err.message);
  }
};
run();
