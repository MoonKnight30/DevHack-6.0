import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// Function to fetch trending topics
const getTrendingTopics = async () => {
  try {
    const options = {
      method: "GET",
      url: "https://twitter154.p.rapidapi.com/trends/",
      params: { woeid: "2459115" }, // WOEID for New York
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "twitter154.p.rapidapi.com",
      },
    };

    const response = await axios.request(options);
    return response.data[0]?.trends || [];
  } catch (error) {
    console.error("Error fetching trending topics:", error);
    return [];
  }
};

// Function to fetch tweets for a given topic
const searchTweets = async (query) => {
  try {
    const options = {
      method: "GET",
      url: "https://twitter154.p.rapidapi.com/search/search",
      params: {
        query,
        section: "top",
        limit: "10",
        language: "en",
      },
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "twitter154.p.rapidapi.com",
      },
    };

    const response = await axios.request(options);
    return response.data.results || []; // Return full tweet objects
  } catch (error) {
    console.error(`Error fetching tweets for ${query}:`, error);
    return [];
  }
};

// Exported function to merge trending topics with tweets
export const mergeTrendsWithTweets = async () => {
  const trendingTopics = await getTrendingTopics();

  if (!trendingTopics.length) {
    console.log("No trending topics found.");
    return [];
  }

  for (const topic of trendingTopics) {
    console.log(`Fetching tweets for: ${topic.name}`);
    topic.tweets = await searchTweets(topic.name); // Add tweets field
  }

  // Save to JSON file
  fs.writeFileSync("trending_with_tweets.json", JSON.stringify(trendingTopics, null, 2));

  console.log("✅ JSON file generated: trending_with_tweets.json");
  return trendingTopics;
};
