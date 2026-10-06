const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({ id: 1, role: 'admin' }));
      localStorage.setItem('token', 'fake-token');
    });
    
    await page.goto('http://localhost:3000/customer/admin');
    await page.waitForTimeout(3000);
    
    // Check if we reached the admin page
    const title = await page.title();
    console.log("Title:", title);
    
    const rows = await page.$$('tr.clickable-row');
    if (rows.length > 0) {
      console.log(`Found ${rows.length} applications. Clicking the first one...`);
      await rows[0].click();
      await page.waitForTimeout(1000);
      
      const rejectBtn = await page.$('button.btn-reject-app');
      if (rejectBtn) {
        await rejectBtn.click();
        console.log("Clicked Reject without remarks.");
        await page.waitForTimeout(500);
        
        // Verify feedback alert exists
        const alert = await page.$('.feedback-alert');
        if (alert) {
          console.log("Feedback alert found!");
          const alertBox = await alert.boundingBox();
          
          const modal = await page.$('.farmer-dossier-modal');
          const modalBox = await modal.boundingBox();
          
          console.log("Modal bounding box:", modalBox);
          console.log("Alert bounding box:", alertBox);
          
          // Scroll the scroll body
          await page.evaluate(() => {
            const body = document.querySelector('.dossier-scroll-body');
            body.scrollTop = body.scrollHeight;
          });
          await page.waitForTimeout(500);
          
          const alertBoxAfterScroll = await alert.boundingBox();
          console.log("Alert bounding box after scroll:", alertBoxAfterScroll);
          
          if (alertBox.y === alertBoxAfterScroll.y) {
            console.log("SUCCESS: Alert did not move on scroll.");
          } else {
            console.log("FAILED: Alert moved on scroll!");
          }
        } else {
          console.log("No feedback alert found!");
        }
      }
    } else {
      console.log("No rows found. Check page content:");
      console.log(await page.evaluate(() => document.body.innerText.substring(0, 500)));
    }
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await browser.close();
  }
})();
