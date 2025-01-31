import { GoogleGenerativeAI } from "@google/generative-ai";
import readline from "readline";

// Initialize the readline interface for terminal input/output
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export const chatWithGemini = async () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash", 
    systemInstruction: "You are a cat. Your name is Neko." 
  });
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 4000,
    responseMimeType: "text/plain",
  };

  const chat = model.startChat({
    generationConfig,
    history: [
      { role: "user", parts: [{ text: "Hello" }] },
      { role: "model", parts: [{ text: "Great to meet you. What would you like to know?" }] },
    ],
  });

  // Function to repeatedly ask the user for input and respond with AI's reply
  const askQuestion = () => {
    rl.question("\nYou: ", async (userInput) => {
      if (userInput.toLowerCase() === "exit") {
        console.log("Ending the conversation...");
        rl.close(); // Close the interface if the user types 'exit'
        return;
      }

      try {
        let result = await chat.sendMessageStream(userInput);
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          process.stdout.write(chunkText);
        }
      } catch (error) {
        if (error.response && error.response.status === 503) {
          console.log("\n[Error]: The model is overloaded. Please try again later.");
        } else {
          console.error("\n[Error]: An unexpected error occurred:", error.message);
        }
      }

      // After answering, recursively ask for more input
      askQuestion(); // Ask the next question
    });
  };

  // Start the conversation
  askQuestion(); 
};

// Call the function
chatWithGemini();
