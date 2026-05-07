import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY!;

const ai = new GoogleGenAI({apiKey});

import toolDeclaration from "./toolDeclaration.js";
import caloriesCalculator from "./caloriesCalculator.js";
import { maxHeaderSize } from "node:http";

async function main() {
    const query = process.argv.slice(2).join(" ");


    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: query,
        config: {
            tools: [toolDeclaration]
        }
    });

    if (response.functionCalls && response.functionCalls.length > 0) {

        const thoughtSignature = response.candidates![0]!.content!.parts![0]!.thoughtSignature as any;
        const args = response.candidates![0]!.content!.parts![0]!;

        const deficitPercentage = args.functionCall!.args!.deficitPercentage! as number;
        const maintenanceCalories = args.functionCall!.args!.maintenanceCalories! as number;
        const result = caloriesCalculator(maintenanceCalories, deficitPercentage);
        

        const finalResponse = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite-preview",
            contents: [
                {role: "user", parts: [{text: query}]},
                {role: "model", parts: [{functionCall: response.functionCalls[0]!, thoughtSignature}]},
                {role: "user", parts: [{
                    functionResponse: {
                        name: response.functionCalls[0]!.name!,
                        response: {
                            output: result,
                        }
                    }
                }]}
            ],
            config: {
                tools: [toolDeclaration]
            }
        });

        console.log(`Agent Response: ${finalResponse.text}`)
    }
    else {
        console.log(response.text);
    }
}

main()