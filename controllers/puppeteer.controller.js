import puppeteer from 'puppeteer-core';


const scrapeArticle = async (url) => {
  const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless: true }); // Run browser in headless mode
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Extract article title and content
    const article = await page.evaluate(() => {
      const title = document.querySelector('h1')?.innerText || 'No title found';
      const paragraphs = Array.from(document.querySelectorAll('p')).map(p => p.innerText);
      return { title, content: paragraphs.join('\n') };
    });

    console.log("📰 Extracted Article:", article);

  } catch (error) {
    console.error("❌ Error scraping article:", error);
  } finally {
    await browser.close();
  }
};

// Example: Scraping a news article
const articleURL = 'https://www.cbr.com/twinless-rotten-tomatoes-score/';
scrapeArticle(articleURL);
