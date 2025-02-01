import dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import articleData from "./scraped_articles_full.json" assert { type: "json" };

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function fetchHeadlines() {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `You are a Twitter bot. Your job is to analyze trending hashtags and the top 10 tweets related to each. 
        I have done all the backend and giving you the scrapped news articles related to trending topics, you have to read their content and create a catchy headlines, not more that 8-9 words 
        next you create a description regarding that article content in 40-50 words
        dont write anything in new line or so in between the description content
        there might be similar articles for a keyword, in that case just combine them and analyse and give healines
        remember whatever data you send goes on top of an image as a post
        put all this in a json format with headline field, source_url,thumbnail, description but give the json in stringified format
        again remember dont write anything in new line, it will break the json file which I will make afterwards, also add commas and brackets where ever neccesarry
        source_url is what you got from the data, dont keep link inside it, its just source publication name

        Here is the articles data:
        ${JSON.stringify(articleData)}`,
    });

    const chat = model.startChat({
        generationConfig: {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 4000,
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
        fs.writeFileSync("headlines.json", JSON.stringify(jsonResponse, null, 2));

        console.log("✅ Response saved to headlines.json");
    } catch (error) {
        console.error("❌ Error:", error);
        fs.writeFileSync("headlines.json", JSON.stringify({ error: "Invalid JSON received" }, null, 2));
    }
}


