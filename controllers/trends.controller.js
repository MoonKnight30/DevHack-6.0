import axios from 'axios';
import dotenv from 'dotenv';


dotenv.config();


export const getTrendingTopics = async (req, res) => {
  try {
    const options = {
      method: 'GET',
      url: 'https://twitter154.p.rapidapi.com/trends/',
      params: {
        woeid: '2459115', // Use the WOEID for New York or any other location
      },
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'twitter154.p.rapidapi.com',
      },
    };

    const response = await axios(options);

    // Extract and sort trends by tweet_volume in descending order
    const trends = response.data[0].trends;


    res.json(trends);
  } catch (error) {
    console.error('Error fetching data from API:', error);
    res.status(500).send('Error fetching data');
  }
};
