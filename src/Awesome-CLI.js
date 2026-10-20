const { Run, COLOR } = require('../utils/base')
const auto = require('../utils/automation')
const file = require('../utils/file')
const processing = require('../utils/processing')
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

require('dotenv').config();

const oldFilePath = process.env.Awesome_CLI_oldFilePath
const newFilePath = process.env.Awesome_CLI_newFilePath
const resultFilePath = process.env.Awesome_CLI_result
const processingFilePath = process.env.Awesome_CLI_processing
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
    processing.addRepositories(processingFilePath, res.addList)
    await createIssuesForAddedRepositories(res.addList)
    await updateProcessingFromIssues(res.addList)
    await file.removeTxtItems(oldFilePath, res.deleteList, "Remove deleted templates from old data")

}

const updateProcessingFromIssues = async (addList) => {
    const updates = []
    const records = processing.readProcessing(processingFilePath)

    for (const record of records) {
        const repository = record.repoLink
        if (addList.includes(repository)) continue
        if (!['no reply', 'replyed', 'closed as not planned', 'closed as completed'].includes(record.state)) continue
        const match = repository.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/?$/i)
        if (!match) continue

        const [, owner, name] = match
        const repo = `${owner}/${name}`
        const { stdout } = await execFileAsync('gh', [
            'issue', 'list',
            '--repo', repo,
            '--state', 'all',
            '--limit', '20',
            '--json', 'number,state,comments,stateReason,title,url'
        ])
        const issues = JSON.parse(stdout)
        const issue = issues.find(item => item.title === '[Optional] Publish to azure samples browser')
        if (!issue) continue

        let state = issue.state === 'OPEN'
            ? (issue.comments > 0 ? 'replyed' : 'no reply')
            : issue.stateReason === 'COMPLETED'
                ? 'closed as completed'
                : 'closed as not planned'
        updates.push({ repoLink: repository, IssueLink: issue.url, state })
    }

    processing.updateAutomaticStates(processingFilePath, updates)
}

const readmeContainsSamplePageType = async (repo) => {
    try {
        const { stdout } = await execFileAsync('gh', [
            'api', `repos/${repo}/readme`,
            '--jq', '.content'
        ])
        const readme = Buffer.from(stdout.trim(), 'base64').toString('utf8')
        return /page_type:\s*sample/i.test(readme)
    } catch (error) {
        console.warn(`Unable to read README for ${repo}; continue issue processing: ${error.message}`)
        return false
    }
}

const createIssuesForAddedRepositories = async (repositories) => {
    const commentPath = path.join(__dirname, 'comment.md')
    const commentTemplate = fs.readFileSync(commentPath, 'utf8')
    const titleMatch = commentTemplate.match(/^## title\s*\r?\n\s*\r?\n([^\r\n]+)/m)
    const contentMatch = commentTemplate.match(/^## content\s*\r?\n\s*\r?\n([\s\S]*?)(?=^## |$)/m)
    const title = titleMatch ? titleMatch[1].trim() : ''
    const content = contentMatch ? contentMatch[1].trim() : ''

    if (!title || !content) {
        throw new Error(`Invalid issue template: ${commentPath}`)
    }

    for (const repository of repositories) {
        const match = repository.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/?$/i)
        if (!match) {
            console.warn(`Skip invalid GitHub repository URL: ${repository}`)
            continue
        }

        const [, owner, name] = match
        const repo = `${owner}/${name}`
        if (await readmeContainsSamplePageType(repo)) {
            console.log(COLOR.yellow, `Skip issue because README contains page_type: sample: ${repo}`)
            continue
        }

        const { stdout } = await execFileAsync('gh', [
            'issue', 'list',
            '--repo', repo,
            '--state', 'all',
            '--limit', '20',
            '--json', 'title'
        ])
        const issues = JSON.parse(stdout)
        if (issues.some(issue => issue.title === title)) {
            console.log(COLOR.yellow, `Skip issue with existing title in ${repo}: ${title}`)
            continue
        }

        const body = content.replace(/<arthur>/g, owner)
        console.log(COLOR.cyan, `Creating issue in ${repo}`)
        await execFileAsync('gh', [
            'issue', 'create',
            '--repo', repo,
            '--title', title,
            '--body', body
        ])
    }
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

