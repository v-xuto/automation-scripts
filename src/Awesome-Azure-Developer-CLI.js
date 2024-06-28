const {Run,COLOR} = require('../utils/base')
const auto = require('../utils/automation')
const file = require('../utils/file')




require('dotenv').config();

const oldFilePath = process.env.Awesome_oldFilePath
const newFilePath = process.env.Awesome_newFilePath
const resultFilePath = process.env.Awesome_result
const url = process.env.Awesome_URL

async function main(page) {

    await file.refreshTxt(oldFilePath, newFilePath)

    await page.goto(url)

    // 爬取数据
    let querySelector = ".fui-Input__input"
    let attribute = "value"
    let strList = await auto.getWebListByPaging(page, querySelector, attribute)
    

    // 写入新数据
    let rows = await trimStrList(strList)
    await file.writeTxt(newFilePath, rows , "保存爬取数据: new")

    // 处理oneNote/旧数据
    await file.formatFile(oldFilePath , "过滤原有数据: old")

    

   let res = await file.compare(oldFilePath, newFilePath)

   

   await file.writeJson(resultFilePath,res)

    

}

Run(false, main)




// 处理字符串
const trimStrList = async (strList) => {
    let newList = []
    strList.forEach(str => {
        str = str.replace("azd init -t", "").trim()
        
        if (str.includes("/") && !str.endsWith("/")) {
            str = 'https://github.com/' + str;
        } else {
            str = "https://github.com/Azure-Samples/" + str
        }
        newList.push(str)
    })
    return newList
}

