import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Function to fetch initial tweets
export const searchTweets = async (req, res) => {
  try {
    const query ='Doubt'; // Default search query if not provided
    const limit = 10; // Number of tweets we need with text
    let tweetsWithText = [];

    // Function to fetch tweets
    const fetchTweets = async () => {
      const options = {
        method: 'GET',
        url: 'https://twitter154.p.rapidapi.com/search/search',
        params: {
          query,
          section: 'top',
          limit: '10',
          language: 'en',
        },
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': 'twitter154.p.rapidapi.com',
        },
      };

      const response = await axios.request(options);
      return response.data;
    };

    // Fetch tweets
    const data = await fetchTweets();
    if (!data || !data.results) return res.status(500).json({ error: 'No tweets found' });

    // Extract tweets with the `text` field
    tweetsWithText = data.results
      .filter((tweet) => tweet.text) // Ensure text field exists
      .map((tweet) => tweet.text);

    // If not enough tweets, call continuation function
    if (tweetsWithText.length < limit) {
      const continuationTweets = await fetchContinuationTweets(query, data.continuation_token, limit - tweetsWithText.length);
      tweetsWithText = [...tweetsWithText, ...continuationTweets];
    }

    // Return only the first `limit` tweets with text
    res.json({ tweets: tweetsWithText.slice(0, limit) });
  } catch (error) {
    console.error('Error fetching tweets:', error);
    res.status(500).json({ error: 'Error fetching tweets' });
  }
};

// Function to fetch continuation tweets
const fetchContinuationTweets = async (query, continuationToken, remainingTweets) => {
  try {
    const options = {
      method: 'GET',
      url: 'https://twitter154.p.rapidapi.com/search/search/continuation',
      params: {
        query,
        section: 'top',
        limit: remainingTweets, // Fetch only the remaining tweets
        continuation_token: continuationToken,
        language: 'en',
      },
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'twitter154.p.rapidapi.com',
      },
    };

    const response = await axios.request(options);
    if (!response.data.results) return [];
    
    // Extract tweets with the `text` field
    const continuationTweets = response.data.results
      .filter((tweet) => tweet.text) // Ensure text field exists
      .map((tweet) => tweet.text);

    return continuationTweets;
  } catch (error) {
    console.error('Error fetching continuation tweets:', error);
    return [];
  }
};
