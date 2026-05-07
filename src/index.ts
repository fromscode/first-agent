import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY!;

const ai = new GoogleGenAI({ apiKey });

import toolDeclarations from "./toolDeclaration.js";
import caloriesCalculator from "./caloriesCalculator.js";
import { getWeather } from "./getWeather.js";

async function main() {
    const query = process.argv.slice(2).join(" ");


    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: query,
        config: {
            tools: [toolDeclarations]
        }
    });

    if (response.functionCalls && response.functionCalls.length > 0) {

        const requiredResponse = response.candidates![0]!.content!.parts![0]!;
        const args = requiredResponse.functionCall!.args!;
        const thoughtSignature = requiredResponse.thoughtSignature!;
        const functionName = requiredResponse.functionCall!.name!;

        let err: Error | null = null;
        let result: any = null;

        try {
            result = functionName == "getWeather" ? await getWeather(args.place as string) : caloriesCalculator(args.maintenanceCalories as number, args.deficitPercentage as number);
        }
        catch (error) {
            err = error as Error;
        }

        
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
                            error: err
                        }
                    }
                }]}
            ],
            config: {
                tools: [toolDeclarations]
            }
        });

        console.log(finalResponse.text)
    }
    else {
        console.log(response.text);
    }
}

main()