import { GoogleGenAI } from '@google/genai';
import { getEnv } from './env.js';

let genAI: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!genAI) {
    const apiKey = getEnv('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export function getModelName(): string {
  return getEnv('GEMINI_MODEL') || 'gemini-flash-latest';
}