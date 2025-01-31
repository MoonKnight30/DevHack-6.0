import express from 'express';

import { getTrendingTopics } from "../controllers/trends.controller.js";

const router = express.Router();

router.get("/trending", getTrendingTopics);

export default router;