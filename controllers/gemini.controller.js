import dotenv from "dotenv";
dotenv.config();
import readline from "readline"; // Import readline for reading terminal input
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Array to store conversation history
let history = [];

let isAwaitingResponse = false; // Flag to indicate if we're waiting for a response

export async function chatWithGemini() {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: "You are a Twitter bot and you reply to users as a news assistant",
    });

    const chat = model.startChat({
        history, // Pass history to maintain context
        generationConfig: {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 400,
            responseMimeType: "text/plain",
        }
    });

    // Function to get user input and send it to the model using streaming
    function askAndRespond() {
        if (!isAwaitingResponse) {
            rl.question("You: ", async (msg) => {
                if (msg.toLowerCase() === "exit") {
                    console.log("Goodbye!");
                    rl.close();
                } else {
                    isAwaitingResponse = true;

                    // Add user message to history
                    history.push({
                        role: "user",
                        parts: [{ text: msg }],
                    });

                    try {
                        const result = await chat.sendMessageStream(msg);
                        let responseText = "";

                        for await (const chunk of result.stream) {
                            const chunkText = await chunk.text();
                            console.log("AI: ", chunkText);
                            responseText += chunkText;
                        }

                        // Add model response to history
                        history.push({
                            role: "model",
                            parts: [{ text: responseText }],
                        });

                        isAwaitingResponse = false; // Reset flag
                        askAndRespond(); // Continue conversation
                    } catch (error) {
                        console.error("Error:", error);
                        isAwaitingResponse = false;
                    }
                }
            });
        } else {
            console.log("Please wait for the current response to complete.");
        }
    }

    askAndRespond(); // Start the conversation loop
}
