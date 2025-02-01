import dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import trendingData from "../trending_with_tweets.json" assert { type: "json" };

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function fetchKeywords() {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `You are a Twitter bot. Your job is to analyze trending hashtags and the top 10 tweets related to each. 
        Your task is to generate relevant keywords (1-2 words) for searching in news APIs. 
        make sure you you dont make the keywords repetitive because it leads to unnecessay extra tasks
        if you see similar ones, pick the best ones
        Categorize the keywords into four categories: political, sports, global, and entertainment.
        I am giving you one example of output:{
  "political": [
    "Trump",
    "USAID",
    "election",
    "authoritarian"
  ],
  "sports": [
    "UFC",
    "football",
    "Premier League",
    "NBA",
    "WNBA"
  ],
  "global": [
    "Israel",
    "Palestine",
    "Saudi Arabia",
    "NATO",
    "Ukraine"
  ],
  "entertainment": [
    "Central Cee",
    "Post Malone",
    "Bud Light",
    "Piers Morgan",
    "Tucker Carlson"
  ]
}
  give data in this format
        Provide the final result as a **stringified JSON** (not raw JSON) so it can be stored directly.

        Here is the trending data:  
        ${JSON.stringify(trendingData)}`,
    });

    const chat = model.startChat({
        generationConfig: {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 400,
            responseMimeType: "text/plain",
        },
    });

    try {
        console.log("Fetching AI response...");

        // AI Message
        const result = await chat.sendMessage("give json");
        let responseText = result.response.text();

        console.log("Raw AI Response:", responseText);

        // **CLEAN AI RESPONSE** to remove unwanted text
        let cleanResponse = responseText.trim()
            .replace(/^```json/, "")  // Remove "```json" if present at the start
            .replace(/^json/, "")      // Remove "json" if it's mistakenly added
            .replace(/```$/, "");      // Remove closing triple backticks if present

        // Parse to verify valid JSON
         const jsonResponse = JSON.parse(cleanResponse);

        // Save cleaned JSON to file
        fs.writeFileSync("keywords.json", JSON.stringify(jsonResponse, null, 2));

        console.log("✅ Response saved to keywords.json");
    } catch (error) {
        console.error("❌ Error:", error);
        fs.writeFileSync("keywords.json", JSON.stringify({ error: "Invalid JSON received" }, null, 2));
    }
}


