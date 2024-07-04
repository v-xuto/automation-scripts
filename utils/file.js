const fs = require('fs');
const { COLOR } = require('../utils/base');
const { log } = require('console');


// The file is written in TXT format
const writeTxt = async (filePath, strList, message = "") => {
    strList = await duplicate(strList)
    fs.writeFileSync(filePath, strList.join('\n'), 'UTF-8')
    console.log(COLOR.cyan, `${message ? message : "TXT file is written successfully"}    ${filePath}    ${strList.length} items`);
    return filePath
}
// The file is written in JSON format
const writeJson = async (filePath, jsonData, message = "") => {
    let jsonStr = JSON.stringify(jsonData)
    fs.writeFileSync(filePath, jsonStr, 'UTF-8')
    console.log(COLOR.magenta, `${message ? message : "JSON file is written successfully"}    ${filePath}   `);

}


// Read the file
const readTxt = async (filePath, message = "") => {
    let lines = []
    const data = fs.readFileSync(filePath, 'UTF-8');

    data.split(/\r?\n/).forEach(line => {
        line = line.trim()
        if (line !== "") {
            lines.push(line)
        }

    })

    return lines
}





// Write the new file to the old file
const refreshTxt = async (oldFilePath, newFilePath) => {
    // const oldData = fs.readFileSync(oldFilePath, 'UTF-8');
    const newData = fs.readFileSync(newFilePath, 'UTF-8');
    fs.writeFileSync(oldFilePath, newData, 'UTF-8')
    // fs.writeFileSync(newFilePath, "", 'UTF-8')
    console.log(COLOR.cyan, `New file was successfully written to old file: new ---> old`);
}



// File compare
const compare = async (oldFilePath, newFilePath) => {

    if (!oldFilePath && !newFilePath) {
        console.log(base.COLOR.red,"Error : Missing path");
        return
    }

    let oldArr = []
    let newArr = []

    if (typeof oldFilePath == 'string') {
        oldArr = await readTxt(oldFilePath)
    }else{
        oldArr = oldFilePath
    }
    if (typeof newFilePath == 'string') {
        newArr = await readTxt(newFilePath)
    }else{
        newArr = newFilePath
    }


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


    addList = newList.filter(line => !oldList.includes(line));
 
    deleteList = oldList.filter(line => !newList.includes(line));

    console.log(COLOR.cyan, "add: ", addList.length, addList);
    console.log(COLOR.cyan, "delete: ", deleteList.length, deleteList)

    let result = {
        addList: addList,
        deleteList: deleteList
    }
    return result

}


// Handle file blank lines and formatting, etc
const formatFile = async (oldFilePath, message = "") => {
    let lines = await readTxt(oldFilePath)
    let path = await writeTxt(oldFilePath, lines, `${message ? message : "Read file successfully"}`)
    return path
}

// Deduplication of file data
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
        // console.log("Write check, no duplicate lines: ");
    } else {
        console.log(COLOR.red, "Write check, the number of duplicate lines is: ", duplicateList);
    }

    return temporaryList

}


module.exports = {

    writeTxt,
    writeJson,
    readTxt,
    refreshTxt,

    compare,
    formatFile,
    duplicate
}