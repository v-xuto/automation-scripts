
const {Run,COLOR} = require('../utils/base')
const auto = require('../utils/automation')
const file = require('../utils/file')
const singleLog = require('single-line-log').stdout;


require('dotenv').config();

const Awesome_CLI_FilePath = process.env.Awesome_CLI_newFilePath
const Learn_Website_FilePath = process.env.Learn_Website_FilePath
const resultFilePath = process.env.Learn_Website_result
const url = process.env.Learn_Website_URL
async function main(page) {

    await page.goto(url)

    let querySelector = ".card-content-title"
    let attribute = "href"
    let paging = ".pagination-next"
    let firstList = await auto.getWebListByPaging(page, querySelector, attribute, paging)

    console.log("First crawl data: ", firstList.length);


    let strList = await getRealUrl(page, firstList)

    strList = await trimStrList(strList)

    console.log("Second crawl data: ", strList.length);


    await file.writeTxt(Learn_Website_FilePath, strList,"Save the Learn_Website data")

    await file.formatFile(Awesome_CLI_FilePath,"Filter the Awesome_CLI data")


    let res = await file.compare(Learn_Website_FilePath,Awesome_CLI_FilePath)
    

    await file.writeTxt(resultFilePath, res.addList)

}

Run(false, main)


const getRealUrl = async (page, firstList) => {

    let strList = []
    console.log("");

    for (let index = 1; index <= firstList.length; index++) {
        singleLog(`${index}/${firstList.length}    Loading...`)
        const item = firstList[index - 1];
        let url = "https://learn.microsoft.com" + item

        for (let j = 0; j < 20; j++) {
            try {
                await page.goto(url, { timeout: 10000 });
                break;
            } catch (error) {
                if (j>10) {
                    console.log(COLOR.red, `
                        
                        Error:
                        ------Description Failed to obtain the github address using ${url}
                        ------Number of retries : ${j}
                        ------specific reason : ${error.message}}

                        `);
                }
            }
        }

        let element = await page.locator('[data-bi-name="browse-to-github"]')
        let str = await element.getAttribute("href")
        strList.push(str)
    }

    console.log("");
    console.log(`${firstList.length}/${firstList.length}    Loading completed`)

    return strList
}


const trimStrList = async (strList) => {
    let newList = []
    strList.forEach(str => {
        str = str.trim()
        if (str.endsWith("docs")) {
            str = str.slice(0, -("docs".length))
        }
        if (str.endsWith("/tree/main/")) {
            str = str.slice(0, -("/tree/main/".length))
        }

        if (str.endsWith("/")) {
            console.log(str);
            str = str.slice(0, -("/".length))
        }
        
        newList.push(str)
    })
    return newList
}