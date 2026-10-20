const fs = require('fs')

const AUTOMATIC_STATES = new Set([
    'no reply',
    'replyed',
    'closed as not planned',
    'closed as completed'
])

const readProcessing = (filePath) => {
    if (!fs.existsSync(filePath)) {
        return []
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    if (!Array.isArray(data)) {
        throw new Error(`Processing file must contain an array: ${filePath}`)
    }
    return data
}

const writeProcessing = (filePath, records) => {
    fs.writeFileSync(filePath, JSON.stringify(records, null, 2) + '\n', 'utf8')
}

const normalizeRepo = (repoLink) => repoLink.trim().replace(/\/$/, '').toLowerCase()

const addRepositories = (filePath, repositories) => {
    const records = readProcessing(filePath)
    const byRepo = new Map(records.map(record => [normalizeRepo(record.repoLink), record]))

    for (const repoLink of repositories) {
        const key = normalizeRepo(repoLink)
        if (!byRepo.has(key)) {
            const record = { id: null, repoLink: repoLink.trim(), state: 'no reply' }
            records.push(record)
            byRepo.set(key, record)
        }
    }

    writeProcessing(filePath, records)
    return records
}

const updateAutomaticStates = (filePath, updates) => {
    const records = readProcessing(filePath)
    const byRepo = new Map(updates.map(update => [normalizeRepo(update.repoLink), update]))

    for (const record of records) {
        if (!AUTOMATIC_STATES.has(record.state)) {
            continue
        }

        const update = byRepo.get(normalizeRepo(record.repoLink))
        if (update) {
            record.id = update.id
            record.state = update.state
        }
    }

    writeProcessing(filePath, records)
    return records
}

const markPublished = (filePath, publishedRepositories) => {
    const records = readProcessing(filePath)
    const published = new Set(publishedRepositories.map(normalizeRepo))

    for (const record of records) {
        if (published.has(normalizeRepo(record.repoLink))) {
            record.state = 'published'
        }
    }

    writeProcessing(filePath, records)
    return records
}

module.exports = {
    addRepositories,
    updateAutomaticStates,
    markPublished,
    readProcessing
}
