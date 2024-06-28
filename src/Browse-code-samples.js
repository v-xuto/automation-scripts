
const {Run,COLOR} = require('../utils/base')
const auto = require('../utils/automation')
const file = require('../utils/file')
const singleLog = require('single-line-log').stdout;


require('dotenv').config();

const oldFilePath = process.env.Browser_oldFilePath
const newFilePath = process.env.Browser_newFilePath
const resultFilePath = process.env.Browser_result
const url = process.env.Browser_URL
async function main(page) {

    await file.refreshTxt(oldFilePath, newFilePath)

    await page.goto(url)

    // 爬取数据 
    let querySelector = ".card-content-title"
    let attribute = "href"
    let paging = ".pagination-next"
    let firstList = await auto.getWebListByPaging(page, querySelector, attribute, paging)

    console.log("第一次爬取数据：", firstList.length);

    // 根据爬取数据获取真实数据
    let strList = await getRealUrl(page, firstList)

    strList = await trimStrList(strList)

    console.log("第二次爬取数据：", strList.length);

    // 写入新数据 
    await file.writeTxt(newFilePath, strList,"保存爬取数据: new")

    // 处理oneNote数据
    await file.formatFile(oldFilePath,"过滤原有数据: old")




    let res = await file.compare(oldFilePath, newFilePath)

    await file.writeJson(resultFilePath, res)

}

Run(false, main)


const getRealUrl = async (page, firstList) => {

    let strList = []
    console.log("");

    for (let index = 1; index <= firstList.length; index++) {
        singleLog(`${index}/${firstList.length}  loading...`)
        const item = firstList[index - 1];
        let url = "https://learn.microsoft.com" + item

        // 防止vpn不好用加载失败
        for (let j = 0; j < 20; j++) {
            try {
                await page.goto(url, { timeout: 10000 });
                break;
            } catch (error) {
                if (j>10) {
                    console.log(COLOR.red, `
                        
                        Error:
                        ------通过${url}获取github地址失败
                        ------继续次数${j}    当前item:${index}
                        ------具体原因 : ${error.message}}

                        `);
                }
            }
        }

        let element = await page.locator('[data-bi-name="browse-to-github"]')
        let str = await element.getAttribute("href")
        strList.push(str)
    }
    console.log("");
    console.log(`${firstList.length}/${firstList.length}  加载完成`)

    return strList
}


// 处理字符串
const trimStrList = async (strList) => {
    let newList = []
    strList.forEach(str => {
        str = str.trim()
        if (str.endsWith("/tree/main/")) {
            str = str.slice(0, -("/tree/main/".length))
        }
        newList.push(str)
    })
    return newList
}