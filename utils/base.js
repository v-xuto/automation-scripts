
const auto = require('../utils/automation')
 
 const COLOR = {
    bright: '\x1B[1m%s\x1B[0m',
    grey: '\x1B[2m%s\x1B[0m',
    italic: '\x1B[3m%s\x1B[0m',
    underline: '\x1B[4m%s\x1B[0m',
    reverse: '\x1B[7m%s\x1B[0m',
    hidden: '\x1B[8m%s\x1B[0m',
    black: '\x1B[30m%s\x1B[0m',
    red: '\x1B[31m%s\x1B[0m',
    green: '\x1B[32m%s\x1B[0m',
    yellow: '\x1B[33m%s\x1B[0m',
    blue: '\x1B[34m%s\x1B[0m',
    magenta: '\x1B[35m%s\x1B[0m',
    cyan: '\x1B[36m%s\x1B[0m',
    white: '\x1B[37m%s\x1B[0m',
    blackBG: '\x1B[40m%s\x1B[0m',
    redBG: '\x1B[41m%s\x1B[0m',
    greenBG: '\x1B[42m%s\x1B[0m',
    yellowBG: '\x1B[43m%s\x1B[0m',
    blueBG: '\x1B[44m%s\x1B[0m',
    magentaBG: '\x1B[45m%s\x1B[0m',
    cyanBG: '\x1B[46m%s\x1B[0m',
    whiteBG: '\x1B[47m%s\x1B[0m'
}


const Run = async (bool, cb) => {
    console.log(COLOR.blueBG, "-----------------START------------------");
    let page = null
    if (bool) {
        page = await auto.connectChrome()
    } else {
        page = await auto.defaultBrowser()
    }
    await cb(page)
    await page.close()

    console.log(COLOR.blueBG, "------------------End--------------------");
    process.exit()
}




module.exports = {
    Run,
    COLOR,
}