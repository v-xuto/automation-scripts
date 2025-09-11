const { Run, COLOR } = require('../utils/base')
const auto = require('../utils/automation')
const file = require('../utils/file')
const fs = require('fs');



require('dotenv').config();

const oldFilePath = process.env.Awesome_CLI_oldFilePath
const newFilePath = process.env.Awesome_CLI_newFilePath
const resultFilePath = process.env.Awesome_CLI_result
const url = process.env.Awesome_CLI_URL

async function main(page) {

    // if (fs.existsSync(newFilePath)) {
    //     await file.refreshTxt(oldFilePath, newFilePath)
    // }

    await page.goto(url)

    // Wait for page to load completely
    await page.waitForLoadState('networkidle')
    
    let querySelector = ".fui-Input__input"
    let attribute = "value"
    
    // Add pagination functionality - for awesome-azd website pagination buttons
    // This selector may need to be adjusted based on the actual website pagination button structure
    let pagingSelector = "button[aria-label*='Next'], button:has-text('Next'), [data-testid='pagination-next'], .ms-Button--primary:has-text('Next')"
    
    console.log(`Starting to access website: ${url}`)
    
    let strList = await auto.getWebListByPaging(page, querySelector, attribute, pagingSelector)


    let rows = await trimStrList(strList)
    await file.writeTxt(newFilePath, rows, "Save the new data")

    await file.formatFile(oldFilePath, "Filter the old data")

    let res = await file.compare(oldFilePath, newFilePath)

    await file.writeJson(resultFilePath, res)

}

Run(false, main)




const trimStrList = async (strList) => {
    let newList = []
    strList.forEach(str => {
        str = str.replace("azd init -t", "").trim()

        if (str.includes("/") && !str.endsWith("/")) {
            str = 'https://github.com/' + str;
        } else {
            str = "https://github.com/Azure-Samples/" + str
        }

        if (str.endsWith("/")) {
            str = str.slice(0, -("/".length))
        }
        newList.push(str)
    })
    return newList
}

