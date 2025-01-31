import express from 'express';
import dotenv from 'dotenv';
import trendsRoute from "./routes/trends.route.js"
import searchRoute from "./routes/search.route.js"
import newsRoute from "./routes/news.route.js"
import geminiRoute from "./routes/gemini.route.js"

const app = express();
dotenv.config();

app.use(express.json());

const PORT = process.env.PORT || 4000;

app.use("/trends", trendsRoute);
app.use("/search", searchRoute);
app.use("/news", newsRoute);
app.use("/gemini", geminiRoute)

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
