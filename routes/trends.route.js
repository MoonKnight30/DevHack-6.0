import express from 'express';

import { mergeTrendsWithTweets } from "../controllers/trends.controller.js";

const router = express.Router();

router.get("/trending", mergeTrendsWithTweets);

export default router;