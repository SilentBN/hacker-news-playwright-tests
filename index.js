const { chromium } = require("playwright");
const { expect } = require("@playwright/test");
require("dotenv").config();

function convertRelativeTime(relativeTime) {
  console.log(`\nConverting relative time: "${relativeTime}"`);
  const now = new Date();
  console.log(`Current time: ${now.toISOString()}`);

  const parts = relativeTime.split(" ");
  const amount = parseInt(parts[0], 10);
  const unit = parts[1];

  console.log(`Parsed amount: ${amount}, unit: ${unit}`);

  let convertedTime;
  switch (unit) {
    case "minute":
    case "minutes":
      convertedTime = new Date(now.getTime() - amount * 60 * 1000);
      break;
    case "hour":
    case "hours":
      convertedTime = new Date(now.getTime() - amount * 60 * 60 * 1000);
      break;
    case "day":
    case "days":
      convertedTime = new Date(now.getTime() - amount * 24 * 60 * 60 * 1000);
      break;
    case "month":
    case "months":
      convertedTime = new Date(now.setMonth(now.getMonth() - amount));
      break;
    case "year":
    case "years":
      convertedTime = new Date(now.setFullYear(now.getFullYear() - amount));
      break;
    default:
      console.warn(`Unhandled time unit: ${unit}`);
      convertedTime = now;
  }

  console.log(`Converted time: ${convertedTime.toISOString()}`);
  return convertedTime;
}

function validateSorting(articles) {
  console.log("\nStarting sorting validation...");
  console.log(`Total articles to validate: ${articles.length}`);

  const toleranceMs = 1000; // 1 second tolerance
  console.log(`Using tolerance of ${toleranceMs}ms for timestamp comparisons`);

  for (let i = 1; i < articles.length; i++) {
    const prevArticle = articles[i - 1];
    const currArticle = articles[i];

    console.log(`\nComparing articles at index ${i - 1} and ${i}:`);
    console.log(
      `Previous article: "${prevArticle.title}" (${prevArticle.age}) ID: ${prevArticle.id}`
    );
    console.log(
      `Current article: "${currArticle.title}" (${currArticle.age}) ID: ${currArticle.id}`
    );

    const prevTimestamp = convertRelativeTime(prevArticle.age);
    const currTimestamp = convertRelativeTime(currArticle.age);

    console.log(`Previous timestamp: ${prevTimestamp.toISOString()}`);
    console.log(`Current timestamp: ${currTimestamp.toISOString()}`);

    const timeDifference = prevTimestamp.getTime() - currTimestamp.getTime();
    console.log(`Time difference: ${timeDifference}ms`);

    if (timeDifference < -toleranceMs) {
      console.error(`Sorting error detected!`);
      console.error(
        `Article at index ${
          i - 1
        } is significantly newer than article at index ${i}`
      );
      console.error(
        `  Article ${i - 1}: ${prevArticle.title} (${prevArticle.age}) ID: ${
          prevArticle.id
        }`
      );
      console.error(
        `  Article ${i}: ${currArticle.title} (${currArticle.age}) ID: ${currArticle.id}`
      );
      console.error(
        `  Time difference: ${timeDifference}ms (exceeds tolerance of ${toleranceMs}ms)`
      );
      return false;
    } else {
      console.log(
        `Order is correct. Time difference (${timeDifference}ms) is within tolerance.`
      );
    }
  }

  console.log("\nValidation complete. All articles are correctly sorted.");
  return true;
}

async function sortHackerNewsArticles() {
  // Launch browser in non-headless mode for visibility
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to Hacker News 'newest' page
  await page.goto("https://news.ycombinator.com/newest");
  console.log(`The URl is: ${page.url()}`);

  // Make Sure that Website is Completed Loaded
  await page.waitForLoadState("networkidle");
  console.log(`The Page is Fully Loaded`);

  // Check if URL ends with '/newest'
  await expect(page).toHaveURL(/\/newest$/);
  console.log("URL check passed: ends with '/newest'");

  // Check if title contains 'Hacker News'
  await expect(page).toHaveTitle(/Hacker News/);
  console.log("Title check passed: contains 'Hacker News'");

  // Assert that the navigation bar exists
  await expect(page.locator(".pagetop").nth(0)).toBeVisible();
  console.log("Navigation bar is visible");

  // Assert that Hacker News Is Present
  await expect(page.locator(".hnname")).toHaveText("Hacker News");
  console.log("'Hacker News' logo link is present and correct");

  // Assert the correct number of navigation links - Not Including Login and Hacker News
  const navLinksSelector =
    '.pagetop:first-of-type a:not(.hnname > a):not([href*="login"])';
  await expect(page.locator(navLinksSelector)).toHaveCount(7);
  console.log("Correct number of navigation links present");

  // Additional check to ensure 'login' and 'Hacker News is not included
  const navLinks = await page.locator(navLinksSelector).allTextContents();
  await expect(navLinks).not.toContain("Hacker News");
  await expect(navLinks).not.toContain("login");
  console.log(
    "'login' and 'Hacker News' link is not included in the navigation links"
  );

  // Assert that Login Is Present
  await expect(page.locator(".pagetop > a").last()).toHaveText("login");
  console.log("'Login' link is present and correct");

  // Assert that the 'new' link is selected (has class 'topsel')
  await expect(page.locator(".topsel")).toHaveText("new");
  console.log("The 'new' link is correctly highlighted as the active page");

  // Check if there's only one selected link is highlighted white
  await expect(page.locator(".topsel")).toHaveCount(1);
  console.log("There is Only One 'topsel' Class");

  // Check if the first and last news item has a rank of "1" and "30"
  await expect(page.locator(".rank").first()).toHaveText("1.");
  console.log("First news item has the correct rank");
  await expect(page.locator(".rank").last()).toHaveText("30.");
  console.log("Last news item has the correct rank");

  // Check for the presence of a "More" link at the bottom of the page
  await expect(page.locator('[rel="next"]')).toHaveText("More");
  console.log("'More' link is present at the bottom of the page");

  const expectedLinks = [
    "new",
    "past",
    "comments",
    "ask",
    "show",
    "jobs",
    "submit",
  ];

  // Verify the content and order
  for (let i = 0; i < expectedLinks.length; i++) {
    await expect(page.locator(navLinksSelector).nth(i)).toHaveText(
      expectedLinks[i]
    );
  }
  console.log("Navigation links are in the correct order");

  // Check if the page contains a list of news items
  const newsRow = page.locator(".athing");
  await expect(newsRow).toHaveCount(30);
  console.log("Page contains the expected number of news items");

  // Verify that each news item has an upvote button
  const newsRowCount = await newsRow.count();
  for (let i = 0; i < newsRowCount; i++) {
    await expect(newsRow.nth(i).locator('[title="upvote"]')).toBeVisible();
  }
  console.log("All news items have visible upvote buttons");

  // Verify that each news item has a timestamp
  const subLine = page.locator(".subline");
  await expect(subLine).toHaveCount(30);
  const subLineCount = await subLine.count();
  for (let i = 0; i < subLineCount; i++) {
    await expect(subLine.nth(i).locator(".age")).toBeVisible();
  }
  console.log("All timestamp is visible");

  // Collect and validate Hacker News data
  console.log("Starting data collection process...");

  const articles = [];
  const totalArticlesToCollect = 100;

  console.log(`Aiming to collect ${totalArticlesToCollect} articles...`);

  while (articles.length < totalArticlesToCollect) {
    console.log(`\nCurrently on page ${Math.floor(articles.length / 30) + 1}`);
    console.log("Collecting articles from current page...");

    const newArticles = await page.evaluate(() => {
      const items = document.querySelectorAll(".athing");
      return Array.from(items).map((item) => {
        const titleElement = item.querySelector(".titleline > a");
        const metaRow = item.nextElementSibling;
        const ageElement = metaRow.querySelector(".age");

        return {
          id: item.id,
          title: titleElement.innerText,
          age: ageElement.innerText,
        };
      });
    });

    console.log(`Collected ${newArticles.length} articles from this page.`);
    articles.push(...newArticles);
    console.log(`Total articles collected so far: ${articles.length}`);

    if (articles.length < totalArticlesToCollect) {
      console.log("Attempting to navigate to next page...");
      const moreLink = page.locator('[rel="next"]');
      const moreLinkCount = await moreLink.count();
      if (moreLinkCount > 0) {
        await moreLink.click();
        await page.waitForLoadState("networkidle");
        console.log("Successfully navigated to next page.");
      } else {
        console.log("No 'More' link found. Ending collection.");
        break;
      }
    }
  }

  console.log("\nData collection complete.");
  console.log(`Collected ${articles.length} articles.`);

  console.log("\nValidating article sorting...");
  const isSorted = validateSorting(articles.slice(0, totalArticlesToCollect));

  if (isSorted) {
    console.log("All articles are correctly sorted from newest to oldest.");
  } else {
    console.log("Articles are not correctly sorted.");
  }

  console.log("\nFirst 5 articles:");
  console.log(articles.slice(0, 5));
  console.log("...");
  console.log("Last 5 articles:");
  console.log(articles.slice(-5));

  await browser.close();
}

async function loginTest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://news.ycombinator.com/");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/ycombinator/);
  await expect(page).toHaveTitle(/Hacker News/);

  await expect(page.getByRole("link", { name: "login" })).toBeVisible();
  await page.getByRole("link", { name: "login" }).click();

  await expect(page.getByText("Login").nth(0)).toBeVisible();

  await expect(page.locator('[name="acct"]').nth(0)).toBeVisible();
  await expect(page.locator('[name="pw"]').nth(0)).toBeVisible();

  const username = process.env.HACKER_NEWS_USERNAME;
  const password = process.env.HACKER_NEWS_PASSWORD;

  await page.locator('[name="acct"]').nth(0).fill(username);
  await expect(page.locator('[name="acct"]').nth(0)).toHaveValue(username);
  await page.locator('[name="pw"]').nth(0).fill(password);
  await expect(page.locator('[name="pw"]').nth(0)).toHaveValue(password);

  await expect(page.locator('[value="login"]')).toBeEnabled();
  await page.locator('[value="login"]').click();

  // Check for rate-limiting message and handle it
  const maxRetries = 3;
  let retries = 0;
  while (retries < maxRetries) {
    try {
      await page.waitForNavigation({ timeout: 5000 });

      if (
        await page
          .getByText(
            "Sorry, we're not able to serve your requests this quickly."
          )
          .isVisible()
      ) {
        console.log("Rate-limiting detected. Attempting to reload...");
        await page.reload();
        await page.waitForLoadState("networkidle");
        retries++;
      } else {
        break;
      }
    } catch (error) {
      console.log("Navigation timeout. Checking page state...");
      if (
        await page
          .getByText(
            "Sorry, we're not able to serve your requests this quickly."
          )
          .isVisible()
      ) {
        console.log("Rate-limiting detected. Attempting to reload...");
        await page.reload();
        await page.waitForLoadState("networkidle");
        retries++;
      } else {
        break;
      }
    }
  }

  if (retries >= maxRetries) {
    throw new Error("Max retries reached. Unable to bypass rate-limiting.");
  }

  await browser.close();
}

(async () => {
  try {
    await sortHackerNewsArticles();
    await loginTest();
    console.log("All Checks Have Passed");
  } catch (error) {
    console.error(`Test failed: ${error.message}`);
    console.error(`Stack trace: ${error.stack}`);
  }
})();
