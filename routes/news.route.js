import express from 'express';

import { fetchNewsForCategories } from "../controllers/news.controller.js";

const router = express.Router();

router.get("/headlines", fetchNewsForCategories);

export default router;