import { GoogleGenerativeAI } from "@google/generative-ai";

let client: GoogleGenerativeAI | null = null;

/** Lazily-instantiated, shared Gemini SDK client (server-side only). */
export function getGeminiClient(): GoogleGenerativeAI {
  if (!client) {
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
  }
  return client;
}

export const GEMINI_MODEL = "gemini-2.5-flash";

/** gemini-2.5-flash est régulièrement surchargé (503) sur les requêtes PDF + JSON volumineuses. */
export const GEMINI_MODEL_PDF = "gemini-2.5-flash-lite";
