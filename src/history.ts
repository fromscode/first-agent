// The goal here is to maintain a history of chats, so that the ai remembers what was the last prompt
import { GoogleGenAI, type Content, type ContentListUnion } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey });

import toolDeclarations from "./toolDeclaration.js";
import caloriesCalculator from "./caloriesCalculator.js";
import { getWeather } from "./getWeather.js";

const prompt1 = "I live in in the capital city of Italy. What is the name of my city?."

const prompt2 = `
Daily I consume italian food and end up intaking about 3000 calories. But I have realised, that these
many calories are making me overweight. If I need to do loose about 25% of my body weight by the end
of this year, what would then be my daily calorie intake?
`

const prompt3 = `
I am starting to go to gym from tommorow. Check the weather for my city tomorrow and suggest me the
best time of the day to go to the gym.
`

const allPrompts = [prompt1, prompt2, prompt3];

const history: Content[] = [{
    role: 'model', 
    parts: [{
        text: `You are a professional chatbot supreme obsession over delivering compact and short sentences that get the whole point across.
        You only do what is asked of you and respond only as much is necessary. You don't act rude and deliver extremely short sentences,
        but you keep conversations to the point and quick.`
    }],
}];

async function main() {

    for (const prompt of allPrompts) {
        history.push({
            role: "user",
            parts: [
                {text: prompt}
            ]
        });

        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite-preview",
            contents: history,
            config: {
                tools: [toolDeclarations]
            }
        });

        const requiredResponse = response.candidates![0]!.content!.parts!;
        
        if (requiredResponse && requiredResponse[0]!.text) {
            const textResponse = requiredResponse[0]!.text;
            console.log()
            history.push({
                role: "model",
                parts: [{text: textResponse}]
            })
        }
        
        for (const part of requiredResponse) {
            if (part.functionCall) {
                const functionArgs = part.functionCall.args!;

                const result = part.functionCall.name == "getWeather" ? await getWeather(functionArgs.place as string) : caloriesCalculator(functionArgs.maintenanceCalories as number, functionArgs.deficitPercentage as number);

                const thoughtSignature = part.thoughtSignature!;
            }
        }


    };
}

//     if (response.functionCalls && response.functionCalls.length > 0) {

        
//         const args = requiredResponse.functionCall!.args!;
//         const thoughtSignature = requiredResponse.thoughtSignature!;
//         const functionName = requiredResponse.functionCall!.name!;

//         let err: Error | null = null;
//         let result: any = null;

//         try {
//             result = functionName == "getWeather" ? await getWeather(args.place as string) : caloriesCalculator(args.maintenanceCalories as number, args.deficitPercentage as number);
//         }
//         catch (error) {
//             err = error as Error;
//         }


//         const finalResponse = await ai.models.generateContent({
//             model: "gemini-3.1-flash-lite-preview",
//             contents: [
//                 { role: "user", parts: [{ text: query }] },
//                 { role: "model", parts: [{ functionCall: response.functionCalls[0]!, thoughtSignature }] },
//                 {
//                     role: "user", parts: [{
//                         functionResponse: {
//                             name: response.functionCalls[0]!.name!,
//                             response: {
//                                 output: result,
//                                 error: err
//                             }
//                         }
//                     }]
//                 }
//             ],
//             config: {
//                 tools: [toolDeclarations]
//             }
//         });

//         console.log(finalResponse.text)
//     }
//     else {
//         console.log(response.text);
//     }
// }

// main()