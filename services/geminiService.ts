
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiModel, ExplanationResponse, AppMode, GroundingSource } from "../types";
import { EXPLAINER_SYSTEM_PROMPT, ARCHITECT_SYSTEM_PROMPT } from "../constants";

export const getCodeAnalysis = async (
  input: string,
  modelId: GeminiModel,
  mode: AppMode,
  language?: string
): Promise<ExplanationResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Map aliases to real models
  let realModel = 'gemini-3-pro-preview';
  let systemInstruction = mode === 'explain' ? EXPLAINER_SYSTEM_PROMPT : ARCHITECT_SYSTEM_PROMPT;
  let tools: any[] = [];

  if (modelId === GeminiModel.FLASH) {
    realModel = 'gemini-3-flash-preview';
  } else if (modelId === GeminiModel.PERPLEXITY) {
    tools = [{ googleSearch: {} }];
    systemInstruction += "\nIMPORTANT: Use Google Search to verify the latest best practices for this language and logic.";
  } else if (modelId === GeminiModel.CHATGPT) {
    systemInstruction += "\nSTYLE: Provide very detailed, conversational explanations as if you were ChatGPT.";
  } else if (modelId === GeminiModel.LMARENA) {
    realModel = 'gemini-3-flash-preview';
    systemInstruction += "\nSTYLE: Be extremely precise and concise, as if being evaluated in a model arena.";
  }

  const userPrompt = mode === 'explain' 
    ? `Explain this ${language || 'source'} code:\n\n${input}` 
    : `Convert this logic to code in ${language || 'JavaScript'}:\n\n${input}`;

  const response = await ai.models.generateContent({
    model: realModel,
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      tools: tools.length > 0 ? tools : undefined,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          code: { type: Type.STRING },
          explanation: { type: Type.STRING },
          analogies: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          workflow: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          diagram: {
            type: Type.OBJECT,
            properties: {
              nodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING }
                  },
                  required: ["id", "label"]
                }
              },
              links: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    source: { type: Type.STRING },
                    target: { type: Type.STRING },
                    label: { type: Type.STRING }
                  },
                  required: ["source", "target"]
                }
              }
            },
            required: ["nodes", "links"]
          },
          followUp: { type: Type.STRING }
        },
        required: ["explanation", "analogies", "workflow", "diagram", "followUp"]
      }
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  const result = JSON.parse(text.trim()) as ExplanationResponse;

  // Extract grounding if search was used
  if (modelId === GeminiModel.PERPLEXITY) {
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      result.sources = chunks
        .filter((c: any) => c.web)
        .map((c: any) => ({
          title: c.web.title,
          uri: c.web.uri
        }));
    }
  }

  return result;
};

export const getFollowUpResponse = async (
  history: { role: 'user' | 'model', parts: { text: string }[] }[],
  question: string,
  modelId: GeminiModel
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let realModel = 'gemini-3-pro-preview';
  if (modelId === GeminiModel.FLASH || modelId === GeminiModel.LMARENA) {
    realModel = 'gemini-3-flash-preview';
  }

  const chat = ai.chats.create({
    model: realModel,
    history: history as any,
    config: {
      systemInstruction: "Continue the technical explanation session. Keep it conversational but technical and simple."
    }
  });

  const response = await chat.sendMessage({ message: question });
  return response.text || "Sorry, I couldn't process that.";
};
