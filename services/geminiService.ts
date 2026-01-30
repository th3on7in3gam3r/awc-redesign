
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getFaithAssistantResponse = async (userPrompt: string, history: { role: 'user' | 'model', text: string }[]) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are the "Faith Assistant" for Anointed Worship Center. 
        Your goal is to provide spiritual encouragement, answer questions about the Bible with a warm, welcoming, and theological tone, 
        and help visitors learn about our church community. 
        Church Location: 123 Faith Lane, Grace City.
        Service Times: Sundays at 10 AM, Wednesdays at 7 PM.
        Pastors: Marcus and Elena Thorne.
        Keep responses concise, uplifting, and Christ-centered.`,
      },
    });

    // Note: sendMessage doesn't take history in this SDK directly like some others, 
    // but we can simulate context if needed by prepending history or using the chat object properly.
    // For this implementation, we rely on the chat session state if we kept it, 
    // but since we create it fresh, we'll just send the current prompt.
    const result = await chat.sendMessage({ message: userPrompt });
    return result.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having a little trouble connecting right now, but God is still on the throne! Please try asking your question again in a moment.";
  }
};
