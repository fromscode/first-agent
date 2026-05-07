// The goal here is to handle function calls paralelly
import {
  GoogleGenAI,
  type Content,
  type ContentListUnion,
  type Part,
} from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey });

import toolDeclarations from "./toolDeclaration.js";
import caloriesCalculator from "./caloriesCalculator.js";
import { getWeather } from "./getWeather.js";

const prompt1 =
  "I am going to book a flight from San Fransico to Los Angeles tomorrow, can you check the weather of both the cities and tell me the best times to do so.";

const allPrompts = [prompt1];

const history: Content[] = [
  {
    role: "model",
    parts: [
      {
        text: `You are a professional chatbot supreme obsession over delivering compact and short sentences that get the whole point across.
        You only do what is asked of you and respond only as much is necessary. You don't act rude and deliver extremely short sentences,
        but you keep conversations to the point and quick.`,
      },
    ],
  },
];

async function main() {
  for (const prompt of allPrompts) {
    history.push({
      role: "user",
      parts: [{ text: prompt }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: history,
      config: {
        tools: [toolDeclarations],
      },
    });

    const requiredResponse = response.candidates![0]!.content!.parts!;

    if (requiredResponse && requiredResponse[0]!.text) {
      const textResponse = requiredResponse[0]!.text;
      console.log(textResponse);
      history.push({
        role: "model",
        parts: [{ text: textResponse }],
      });
    } else {
      const parts: Part[] = [];
      const responseParts: Part[] = [];
      for (const part of requiredResponse) {
        if (part.functionCall) {
          const functionArgs = part.functionCall.args!;

          const result =
            part.functionCall.name == "getWeather"
              ? await getWeather(
                  functionArgs.place as string,
                  functionArgs.day as number,
                )
              : caloriesCalculator(
                  functionArgs.maintenanceCalories as number,
                  functionArgs.deficitPercentage as number,
                );

          const thoughtSignature = part.thoughtSignature!;

          parts.push({ functionCall: part.functionCall, thoughtSignature });
          responseParts.push({
            functionResponse: {
              name: part.functionCall!.name!,
              response: {
                output: result,
              },
            },
          });
        }
      }
      history.push(
        {
          role: "model",
          parts,
        },
        {
          role: "user",
          parts: responseParts,
        },
      );

      const finalResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: history,
      });

      console.log(finalResponse.text);
    }
  }
}

main();
