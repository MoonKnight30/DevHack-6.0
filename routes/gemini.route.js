import express from 'express';

import { fetchKeywords } from "../controllers/gemini.keywords.controller.js";
import { fetchHeadlines } from "../controllers/gemini.headlines.controller copy.js"; 

const router = express.Router();

router.get('/chat', fetchKeywords);
router.get('/headlines', fetchHeadlines);


export default router;