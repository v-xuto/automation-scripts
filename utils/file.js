const fs = require('fs');
const {COLOR} = require('../utils/base')


// 文件写入 TXT格式
const writeTxt = async (filePath, strList,message = "") => {
    // 去重
    strList = await duplicate(strList)
    fs.writeFileSync(filePath, strList.join('\n'), 'UTF-8')
    console.log(COLOR.cyan, `${message ? message : "写入TXT文件成功"}    ${filePath}    ${strList.length}行`);
    return filePath
}
// 文件写入 JSON格式
const writeJson = async (filePath, jsonData,message = "") => {
    let jsonStr = JSON.stringify(jsonData)
    fs.writeFileSync(filePath, jsonStr, 'UTF-8')
    console.log(COLOR.magenta, `${message ? message : "写入JSON文件成功"}    ${filePath}   `);

}


// 文件读取
const readTxt = async (filePath,message = "") => {
    let lines = []
    const data = fs.readFileSync(filePath, 'UTF-8');

    data.split(/\r?\n/).forEach(line => {
        line = line.trim()
        if (line !== "") {
            lines.push(line)
        }

    })
    // console.log(COLOR.cyan, `${message ? message : "读取文件成功"}    ${filePath}    ${lines.length}行`);

    return lines
}





// 文件反转
const refreshTxt = async (oldFilePath, newFilePath) => {
    // const oldData = fs.readFileSync(oldFilePath, 'UTF-8');
    const newData = fs.readFileSync(newFilePath, 'UTF-8');
    fs.writeFileSync(oldFilePath, newData, 'UTF-8')
    // fs.writeFileSync(newFilePath, "", 'UTF-8')
    console.log(COLOR.cyan, `刷新文件成功: new ---> old`);
}



// 文件比较
const compare = async (oldFilePath, newFilePath = oldFilePath) => {

    let oldArr = await readTxt(oldFilePath)
    let newArr = await readTxt(newFilePath)
    let oldList = []
    let newList = []
    oldArr.forEach(item => {
        if (typeof item == 'string') {
            oldList.push(item.toLowerCase())
        }
    })
    newArr.forEach(item => {
        if (typeof item == 'string') {
            newList.push(item.toLowerCase())
        }
    })

    let addList = []
    let deleteList = []

    // 新数组有 ， 旧数组无 ， 新增
    addList = newList.filter(line => !oldList.includes(line));

    // 旧数组有 ， 新数组无 ， 删除
    deleteList = oldList.filter(line => !newList.includes(line));

    console.log(COLOR.cyan, "新增：", addList.length, addList);
    console.log(COLOR.cyan, "删除：", deleteList.length, deleteList)

    let result = {
        addList: addList,
        deleteList: deleteList
    }
    return result

}


// 处理OneNote文件
const formatFile = async (oldFilePath,message = "") => {
    let lines = await readTxt(oldFilePath)
    let path = await writeTxt(oldFilePath, lines,`${message ? message : "读取文件成功"}`)
    return path
}

// 检查是否唯一
const duplicate = async (lines) => {
    let duplicateList = []
    let temporaryList = []
    lines.forEach(item => {
        if (temporaryList.includes(item)) {
            duplicateList.push(item)
        } else {
            temporaryList.push(item)
        }
    })
    if (duplicateList.length === 0) {
        // console.log("写入检查，无重复行数");
    } else {
        console.log(COLOR.red, "写入检查，重复行数为:", duplicateList);
    }

    return temporaryList

}


module.exports = {
    // 文件读写
    writeTxt,
    writeJson,
    readTxt,
    refreshTxt,
    // 文件比较,处理
    compare,
    formatFile,
    duplicate
}