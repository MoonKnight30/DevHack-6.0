import express from 'express';

import { fetchKeywords } from "../controllers/gemini.keywords.controller.js";

const router = express.Router();

router.get('/chat', fetchKeywords);

export default router;