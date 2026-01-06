
import { GoogleGenAI } from "@google/genai";
import { FormData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateClientSummary = async (data: FormData): Promise<string> => {
  try {
    const entityList = data.entities.map(e => `${e.type.toUpperCase()}: ${e.name} (ABN: ${e.abn})`).join(', ');
    const prompt = `
      You are a high-end Australian financial advisor and tax accountant's assistant.
      Based on the following client data, provide a professional summary:
      
      Client Profile:
      - Name: ${data.firstName} ${data.lastName}
      - Spouse: ${data.hasSpouse ? `Yes (${data.spouseName}). Doing return: ${data.spouseDoingReturn}` : 'No'}
      - Entities: ${data.hasEntities ? entityList : 'None'}
      - Annual Income: $${data.annualSalary}
      - Super Balance: $${data.superBalance}
      - Total Assets: $${data.totalAssets}
      - Investments: Interest: ${data.hasInterestIncome}, Dividends: ${data.hasDividends}, Rental: ${data.hasRentalProperty}
      - Primary Goal: ${data.primaryGoal}

      Instructions:
      1. Provide an "Executive Summary" focusing on the complexity of their structure.
      2. Identify "Strategic Opportunities" (e.g., income splitting if spouse is involved, trust distribution benefits, or SMSF strategies).
      3. List "Compliance Requirements" for the identified entities.
      4. Suggest "Next Steps" for a discovery meeting.

      Return the response in structured Markdown format. Be sophisticated, neutral, and high-value. Do not mention any brand names.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Could not generate summary at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The AI assistant is currently unavailable, but your data is safe.";
  }
};
