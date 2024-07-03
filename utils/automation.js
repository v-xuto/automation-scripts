
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

    let pagingElement = null
    let AllList = []

    do {
        if (pagingElement) {
            await pagingElement.click()
        }
        // 获取页面
        let aList = await getWebList(page, querySelector, attribute)
        AllList = AllList.concat(aList)
        pagingElement = await page.locator(paging)

    } while (await pagingElement.isVisible());

    return AllList

}






module.exports = {
    
    connectChrome,
    defaultBrowser,

    getWebList,
    getWebListByPaging
}