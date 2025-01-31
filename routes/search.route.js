import express from 'express';

import { searchTweets } from "../controllers/search.controller.js";

const router = express.Router();

router.get("/searchtweets", searchTweets);

export default router;