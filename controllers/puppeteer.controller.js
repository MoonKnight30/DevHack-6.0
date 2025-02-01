import puppeteer from 'puppeteer-core';
import fs from 'fs';
import aggregateNews from "../aggregated_news.json" assert { type: "json" }; // Import the JSON directly

// Define a function to scrape article content
const scrapeArticle = async (url) => {
  console.log(`🚀 Scraping article: ${url}`);

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage();

  try {
    console.log(`🌐 Visiting page: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Extract article title and content
    const article = await page.evaluate(() => {
      const title = document.querySelector('h1')?.innerText || 'No title found';
      const paragraphs = Array.from(document.querySelectorAll('p')).map(p => p.innerText);
      return { title, content: paragraphs.join('\n') };
    });

    console.log(`✅ Article scraped successfully: ${url}`);
    return article;
  } catch (error) {
    console.error("❌ Error scraping article:", error);
    return null;
  } finally {
    await browser.close();
    console.log(`🛑 Browser closed for: ${url}`);
  }
};

// Define a function to scrape and save news articles
const scrapeAndSaveArticles = async (aggregateNews) => {
  console.log("🔍 Starting the scraping process...");
  let allArticles = [];

  // Loop through each category in aggregateNews
  for (const categoryData of aggregateNews) {
    console.log(`🔄 Processing category: ${categoryData.category}`);
    const articlesForCategory = [];

    // Loop through each article under the category
    for (const article of categoryData.articles) {
      const { title, link, snippet, source_url, keyword, category, thumbnail } = article;

      console.log(`🔍 Scraping article: ${title} - ${link}`);

      // Scrape the article's detailed content
      const articleData = await scrapeArticle(link);

      if (articleData) {
        // Add the scraped article data along with keyword and category
        articlesForCategory.push({
          category,
          keyword,
          title,
          link,
          thumbnail,
          snippet,
          source_url,
          article_content: articleData,
        });
      }
    }

    if (articlesForCategory.length > 0) {
      allArticles.push({
        category: categoryData.category,
        keyword: categoryData.keyword,
        articles: articlesForCategory,
        thumbnail: articlesForCategory.thumbnail 
      });
      console.log(`✅ Finished processing category: ${categoryData.category}`);
    } else {
      console.log(`⚠️ No articles scraped for category: ${categoryData.category}`);
    }
  }

  // Save the scraped data to a JSON file
  console.log("💾 Saving scraped articles...");
  fs.writeFileSync('scraped_articles_full.json', JSON.stringify(allArticles, null, 2));
  console.log('✅ Scraped articles saved to scraped_articles_full.json');
};

// Directly use the imported aggregateNews data and start scraping
scrapeAndSaveArticles(aggregateNews)
  .then(() => {
    console.log("🎉 Scraping process completed successfully!");
  })
  .catch((error) => {
    console.error("❌ Scraping process failed:", error);
  });
