
const playwright = require('playwright');



// Connect to the local Chrome browser
// cd 'C:\Program Files\Google\Chrome\Application'    
// ./chrome.exe --remote-debugging-port=9222
const connectChrome = async () => {
    const browser = await playwright.chromium.connectOverCDP('http://localhost:9222', { slowMo: 1.5 * 1000 });
    const defaultContext = browser.contexts()[0];
    const page = defaultContext.pages()[0];
    return page
}

// Connect to the browser provided by playwright
const defaultBrowser = async () => {
    const browser = await playwright.chromium.launch({
        // channel:"msedge",
        headless: false,
        slowMo: 2 * 1000
    }); 
    const context = await browser.newContext(); 
    const page = await context.newPage(); 
    return page

}

// Automatic crawl
// Gets the page element through the locator and gets the specified content based on whether the attribute exists
const getWebList = async (page, querySelector, attribute) => {

    let nodeList = await page.locator(querySelector).all()

    let strList = []

    for (let i = 0; i < nodeList.length; i++) {
        const element = nodeList[i];
        let value = ""
        if (attribute.length > 0) {
            value = await element.getAttribute(attribute)
        } else {
            value = await element.innerText()
        }
        strList.push(value)
    }

    return strList

}

// Automatic crawl
// Paging mode
const getWebListByPaging = async (page, querySelector, attribute, paging = "") => {
    if (!paging) {
        return await getWebList(page, querySelector, attribute)
    }

    let AllList = []
    let pageCount = 0
    let maxPages = 50 // Set maximum page limit to avoid infinite loop
    
    console.log("Starting paginated data crawling...")

    do {
        pageCount++
        console.log(`Processing page ${pageCount}...`)
        
        // Wait for page content to load
        await page.waitForTimeout(2000)
        
        // Get current page data
        let currentPageList = await getWebList(page, querySelector, attribute)
        console.log(`Found ${currentPageList.length} items on page ${pageCount}`)
        
        // If current page has no data, might have reached the last page
        if (currentPageList.length === 0) {
            console.log("No data found on current page, might have reached the last page")
            break
        }
        
        AllList = AllList.concat(currentPageList)
        
        // Find pagination button
        let pagingElement = null
        try {
            // Try multiple pagination button selectors
            const pagingSelectors = [
                paging,
                "button[aria-label*='next']",
                "button:has-text('Next')",
                "button:has-text('下一页')", // Keep Chinese version for compatibility
                ".pagination .next",
                "[data-testid='next-page']",
                ".next-page",
                "a:has-text('Next')"
            ]
            
            for (const selector of pagingSelectors) {
                try {
                    const elements = await page.locator(selector).all()
                    for (const element of elements) {
                        if (await element.isVisible() && await element.isEnabled()) {
                            pagingElement = element
                            break
                        }
                    }
                    if (pagingElement) break
                } catch (e) {
                    // Ignore element not found errors, continue trying next selector
                }
            }
            
            if (pagingElement) {
                console.log("Found pagination button, clicking to next page...")
                await pagingElement.click()
                // Wait for page navigation
                await page.waitForLoadState('networkidle')
            } else {
                console.log("No clickable pagination button found, crawling completed")
                break
            }
        } catch (error) {
            console.log("Error occurred during pagination:", error.message)
            break
        }
        
        // Prevent infinite loop
        if (pageCount >= maxPages) {
            console.log(`Reached maximum page limit (${maxPages}), stopping crawl`)
            break
        }
        
    } while (true)
    
    console.log(`Pagination crawling completed, processed ${pageCount} pages in total, obtained ${AllList.length} items`)
    return AllList
}






module.exports = {
    
    connectChrome,
    defaultBrowser,

    getWebList,
    getWebListByPaging
}