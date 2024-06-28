
const playwright = require('playwright');



// 连接本地Chrome浏览器
// cd 'C:\Program Files\Google\Chrome\Application'    
// ./chrome.exe --remote-debugging-port=9222
const connectChrome = async () => {
    const browser = await playwright.chromium.connectOverCDP('http://localhost:9222', { slowMo: 1.5 * 1000 });
    const defaultContext = browser.contexts()[0];
    const page = defaultContext.pages()[0];
    return page
}

// 连接默认浏览器
const defaultBrowser = async () => {
    const browser = await playwright.chromium.launch({
        // channel:"msedge",
        headless: false,
        slowMo: 2 * 1000,
        // timeout: 5 * 60 * 1000
    }); // 启动 Chromium 浏览器  
    const context = await browser.newContext(); // 创建一个新的浏览器上下文  
    const page = await context.newPage(); // 在上下文中创建一个新页面  
    return page

}

// 自动爬取
// 通过定位器获取页面元素 , 并根据属性是否存在获取指定内容
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

// 自动爬取 分页模式
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
    // 连接浏览器
    connectChrome,
    defaultBrowser,
    // 自动化任务
    getWebList,
    getWebListByPaging
}