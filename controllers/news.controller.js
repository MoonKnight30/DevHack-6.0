import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const getNews = async (req, res) => {
  try {
    const options = {
      method: 'GET',
      url: 'https://real-time-news-data.p.rapidapi.com/search',
      params: {
        query: 'The Weeknd Hurry Up Tomorrow Hurry Up Tomorrow album The Weeknd new album',
        limit: '5',
        time_published: '7d',
        country: 'US',
        lang: 'en'
      },
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'real-time-news-data.p.rapidapi.com'
      }
    };

    // Make API request
    const response = await axios.request(options);

    // Check if response has data
    if (!response.data || !response.data.data) {
      return res.status(500).json({ error: 'No news articles found' });
    }

    // Extract only required fields: title, link, snippet, source_url
    const formattedNews = response.data.data.map(article => ({
      title: article.title,
      link: article.link,
      snippet: article.snippet || 'Snippet not available',
      source_url: article.source_url
    }));

    res.json(formattedNews); // Send only the filtered news data
  } catch (error) {
    console.error('Error fetching news:', error.message);
    res.status(500).json({ error: 'Error fetching news' });
  }
};

// Function to summarize an article using RapidAPI Summarizer
export const summarizeArticle = async (req, res) => {
  try {
    const  url  = 'https://variety.com/2025/music/news/the-weeknd-drops-hurry-up-tomorrow-featuring-lana-del-rey-travis-scott-future-1236292214/'; // Accept URL from request body

    if (!url) {
      return res.status(400).json({ error: 'Article URL is required' });
    }

    const options = {
      method: 'GET',
      url: 'https://article-extractor-and-summarizer.p.rapidapi.com/summarize',
      params: {
        url,
        lang: 'en',
        engine: '2'
      },
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY, // Use .env key
        'x-rapidapi-host': 'article-extractor-and-summarizer.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);

    // Check if response contains a summary
    if (!response.data || !response.data.summary) {
      return res.status(500).json({ error: 'Summary not available' });
    }

    res.json({ summary: response.data.summary }); // Return summary in JSON format
  } catch (error) {
    console.error('Error summarizing article:', error.message);
    res.status(500).json({ error: 'Error summarizing article' });
  }
};
