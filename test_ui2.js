const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Check if we need to login or if we are already in Admin page.
    let title = await page.title();
    console.log("Title:", title);
    
    let adminBtn = await page.$('text=Bank Officer Underwriting');
    if (!adminBtn) {
       console.log("Looking for application list...");
       // Maybe we have to click on the first application to open the drawer
       const rows = await page.$$('tr.clickable-row');
       if (rows.length > 0) {
         console.log(`Found ${rows.length} applications. Clicking the first one...`);
         await rows[0].click();
         await page.waitForTimeout(1000);
         
         // Drawer should be open
         const remarksInput = await page.$('textarea[placeholder*="reasons for approval/rejection"]');
         if (remarksInput) {
           await remarksInput.fill("Test reject reason");
           console.log("Filled remarks.");
           
           // Click reject button
           const rejectBtn = await page.$('button.btn-reject-app');
           if (rejectBtn) {
             await rejectBtn.click();
             console.log("Clicked Reject.");
             await page.waitForTimeout(2000);
             
             // Check feedback
             const body = await page.evaluate(() => document.body.innerText);
             if (body.includes("successfully marked as REJECTED")) {
               console.log("Success message found.");
             } else {
               console.log("No success message found. Body snippet:", body.substring(0, 500));
             }
           }
         }
       } else {
         console.log("No rows found. Checking body text:", await page.evaluate(() => document.body.innerText.substring(0, 500)));
       }
    }
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await browser.close();
  }
})();
