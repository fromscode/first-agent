import { Type } from "@google/genai";

export default {
    functionDeclarations: [
        {
            name: "caloriesCalculator",
            description: "Calculate target daily calories for different weight goals.",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    maintenanceCalories: {
                        type: Type.NUMBER,
                        description: "The user's daily maintenance calories.",
                        default: 2200,
                    },
                    deficitPercentage: {
                        type: Type.NUMBER,
                        description: "The percentage deficit to apply (e.g., 10 for a 10% deficit). Should only be a positive number or zero if no deficit is needed",
                        default: 15
                    }
                },

            }
        },
        {
            name: "getWeather",
            description: "Find weather data for a particular place",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    place: {
                        type: Type.STRING,
                        description: "The name of the place for which the weather is required",
                    },
                },
                required: ["place"]
            }
        }
    ]
}