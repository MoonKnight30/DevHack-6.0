import express from 'express';

import { getNews, summarizeArticle } from "../controllers/news.controller.js";

const router = express.Router();

router.get("/headlines", getNews);
router.get("/summarize", summarizeArticle);

export default router;