
import { GeminiModel } from './types';

export const MODELS = [
  { id: GeminiModel.PRO, name: 'Gemini 3 Pro', description: 'Deep reasoning and coding' },
  { id: GeminiModel.FLASH, name: 'Gemini 3 Flash', description: 'Fast and concise' },
  { id: GeminiModel.CHATGPT, name: 'ChatGPT Mode', description: 'Conversational and detailed' },
  { id: GeminiModel.PERPLEXITY, name: 'Perplexity Mode', description: 'Real-time search grounded' },
  { id: GeminiModel.LMARENA, name: 'LM Arena Mode', description: 'Highly competitive and precise' },
];

export const SUPPORTED_LANGUAGES = [
  "JavaScript",
  "Python",
  "TypeScript",
  "Java",
  "C++",
  "C#",
  "Ruby",
  "Go",
  "Rust",
  "Swift",
  "PHP"
];

export const DEFAULT_CODE_SNIPPET = `function findMax(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}`;

export const DEFAULT_LOGIC_INPUT = "Create a function that takes a list of names and returns only the ones that start with 'A', sorted alphabetically.";

export const EXPLAINER_SYSTEM_PROMPT = `You are an expert programming educator. 
Explain the provided code snippet using simple analogies and a visual logic flow.
Respond ONLY in JSON:
{
  "explanation": "Summary",
  "analogies": ["Analogy 1", "Analogy 2"],
  "workflow": ["Step 1", "Step 2"],
  "diagram": { "nodes": [{"id": "n1", "label": "Start"}], "links": [] },
  "followUp": "Question?"
}`;

export const ARCHITECT_SYSTEM_PROMPT = `You are an expert software architect.
Convert the following logic description into clean, efficient code in the specified language.
Also provide simple analogies and a visual logic flow for the generated code.
Respond ONLY in JSON:
{
  "code": "The generated code block",
  "explanation": "Brief explanation of the generated code",
  "analogies": ["Real-world analogy for how the code logic works"],
  "workflow": ["Step-by-step breakdown of how the generated code executes"],
  "diagram": { "nodes": [{"id": "n1", "label": "Input"}], "links": [] },
  "followUp": "Suggest a way to optimize or extend this code."
}`;
