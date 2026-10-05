const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log("Navigating to http://localhost:3001/admin/applications (or whatever route)");
    // Let's first just check if the app loads. We can go to the root.
    await page.goto('http://localhost:3001');
    
    // The admin route is probably /admin or similar. Let's find it.
    console.log("Loaded:", await page.title());
    console.log("URL:", page.url());
    
    // We can print all local storage and wait for some text.
    await page.waitForTimeout(2000);
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log("Body snippet:", bodyText.slice(0, 300));
    
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await browser.close();
  }
})();
