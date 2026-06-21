import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import "../config/env.js";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
});

export const testAI = async () => {
  try {
    const response = await model.invoke("who is narendra modi?");
    console.log(response.content);
  } catch (error) {
    console.error(error);
  }
};