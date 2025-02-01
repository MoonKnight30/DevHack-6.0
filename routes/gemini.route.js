import express from 'express';

import { chatWithGemini } from "../controllers/gemini.keywords.controller.js";

const router = express.Router();

router.get('/chat', chatWithGemini);

export default router;