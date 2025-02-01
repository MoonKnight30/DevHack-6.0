import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";
import keywords from "../keywords.json" assert { type: "json" };

// Load environment variables
dotenv.config();

// Function to fetch news based on a keyword
const fetchNewsForKeyword = async (keyword) => {
  // Function to format the date to YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get today's date (to)
  const toDate = new Date();
  const toFormatted = formatDate(toDate);

  // Calculate the date 7 days before (from)
  const fromDate = new Date();
  fromDate.setDate(toDate.getDate() - 7); // Subtract 7 days
  const fromFormatted = formatDate(fromDate);

  // Ensure the dates are in ISO format with time and timezone (UTC)
  const fromDateString = `${fromFormatted}T00:00:00.000Z`;
  const toDateString = `${toFormatted}T00:00:00.000Z`;

  const options = {
    method: "GET",
    url: "https://news-api14.p.rapidapi.com/v2/search/articles",
    params: {
      query: keyword,
      language: "en",
      from: fromDateString,
      to: toDateString,
      limit: "2",
    },
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY, // Use env variable for API key
      "x-rapidapi-host": "news-api14.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    

    // Check if response has data
    if (!response.data || !response.data.data) {
      console.error("No articles found for this keyword:", keyword);
      return []; // No articles found for this keyword
    }

    // Format and return the news articles
    return response.data.data.map((article) => ({
      title: article.title,
      link: article.url,
      snippet: article.excerpt || "Snippet not available",
      source_url: article.publisher.name,
    }));
  } catch (error) {
    console.error("Error fetching news for keyword:", keyword, error);
    return []; // Return empty array on error
  }
};

// Function to fetch news for all categories
export const fetchNewsForCategories = async () => {
  const allArticles = [];

  // Loop through each category in the keywords
  for (const category in keywords) {
    if (Object.hasOwnProperty.call(keywords, category)) {
      const categoryKeywords = keywords[category];

      // Fetch news for each keyword in the category
      for (const keyword of categoryKeywords) {
        console.log(`Fetching news for "${keyword}"...`);
        const articles = await fetchNewsForKeyword(keyword);

        if (articles.length > 0) {
          allArticles.push({
            category,
            keyword,
            articles,
          });
        }
      }
    }
  }

  // Save the aggregated result to a new JSON file
  fs.writeFileSync("aggregated_news.json", JSON.stringify(allArticles, null, 2));
  console.log("Aggregated news saved to aggregated_news.json");
};


