import express from 'express';

import { fetchKeywords } from "../controllers/gemini.keywords.controller.js";
import { fetchHeadlines } from "../controllers/gemini.headlines.controller.js"; 

const router = express.Router();

//router.get('/keywords', fetchKeywords);
router.get('/headlines', fetchHeadlines);


export default router;