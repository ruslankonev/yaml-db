const fs = require('fs').promises
const path = require('path')
const YAML = require('yaml')
const { nanoid } = require('nanoid')
const _ = require('lodash')

class Database {
  constructor(dataPath) {
    this.dataPath = path.resolve(dataPath)
    this.records = {}
  }

  // Database initialization
  async init() {
    try {
      await fs.access(this.dataPath)
    } catch (error) {
      await fs.mkdir(this.dataPath, { recursive: true })
    }
    await this.loadRecords()
  }

  // Uploading meta-information of records
  async loadRecords() {
    const recordIds = await fs.readdir(this.dataPath)

    for (const recordId of recordIds) {
      const meta = await this.getRecordMeta(recordId)
      this.records[recordId] = meta
    }
  }

  //
  async listRecords(filter) {
    const records = Object.values(this.records)
    if (filter) {
      if (filter?.constructor.name === 'String') {
        result = _.filter(records, (item) =>
          _.some(Object.values(item), (value) =>
            _.includes(String(value).toLowerCase(), query.toLowerCase())
          )
        )
      } else {
        result = _.filter(records, (item) => {})
      }
    }
    return records
  }

  // Creating a new record with data
  async createRecord(meta, recordData) {
    const recordId = nanoid()
    const recordPath = path.join(this.dataPath, recordId)

    await fs.mkdir(recordPath, { recursive: true })

    meta = {
      id: recordId,
      created_at: new Date().toISOString(),
      files: [],
      ...meta,
    }

    const metaPath = path.join(recordPath, 'meta.yaml')
    await fs.writeFile(metaPath, YAML.stringify(meta), 'utf8')

    const dataPath = path.join(recordPath, 'data.yaml')
    await fs.writeFile(dataPath, YAML.stringify(recordData), 'utf8')

    return recordId
  }

  // Updating the record data
  async updateRecord(recordId, updatedData) {
    if (typeof recordId !== 'string' && typeof recordId !== 'object') {
      return
    }

    recordId = recordId || updatedData.id

    const recordPath = path.join(this.dataPath, recordId)
    const dataPath = path.join(this.dataPath, recordId, 'data.yaml')
    const dataContent = await fs.readFile(dataPath, 'utf8')
    const existingData = YAML.parse(dataContent)

    const newData = { ...existingData, ...updatedData }
    await fs.writeFile(dataPath, YAML.stringify(newData), 'utf8')

    const metaPath = path.join(recordPath, 'meta.yaml')
    const metaContent = await fs.readFile(metaPath, 'utf8')
    const meta = YAML.parse(metaContent)

    const newMeta = { ...meta, ...{ updated_at: new Date().toISOString() } }

    await fs.writeFile(metaPath, YAML.stringify(newMeta), 'utf8')
  }

  // Loading a binary file into a record
  async uploadFile(recordId, fileBuffer, filename) {
    const recordPath = path.join(this.dataPath, recordId)
    const filesPath = path.join(recordPath, 'files')

    try {
      await fs.access(filesPath)
    } catch (error) {
      await fs.mkdir(filesPath).catch((err) => {
        console.error(`Error creating directory: ${err}`)
      })
    }

    const fileId = nanoid()
    const filePath = path.join(filesPath, `${fileId}_${filename}`)
    await fs.writeFile(filePath, fileBuffer)

    const metaPath = path.join(recordPath, 'meta.yaml')
    const metaContent = await fs.readFile(metaPath, 'utf8')
    const meta = YAML.parse(metaContent)

    meta.files.push({
      id: fileId,
      filename,
      created_at: new Date().toISOString(),
    })

    await fs.writeFile(metaPath, YAML.stringify(meta), 'utf8')
  }

  // Retrieving a record
  async getRecord(recordId) {
    // const meta = await this.getRecordMeta(recordId)
    // const data = await this.getRecordData(recordId)
    // return { ...meta, ...data }
    const meta = this.records[recordId]
    if (!meta) {
      return
    }
    if (meta.type !== 'file') {
      const data = await this.getRecordData(recordId)
      return { meta, data }
    }
  }

  // Reading meta-information about a record
  async getRecordMeta(recordId) {
    const metaPath = path.join(this.dataPath, recordId, 'meta.yaml')
    const metaContent = await fs.readFile(metaPath, 'utf8')
    return YAML.parse(metaContent)
  }

  // Reading record data
  async getRecordData(recordId) {
    const dataPath = path.join(this.dataPath, recordId, 'data.yaml')
    const dataContent = await fs.readFile(dataPath, 'utf8')
    return YAML.parse(dataContent)
  }

  // Search for records by meta-information
  async searchRecords(query) {
    const recordIds = await fs.readdir(this.dataPath)
    const results = []

    for (const recordId of recordIds) {
      const meta = await this.getRecordMeta(recordId)
      if (meta.id.includes(query)) {
        results.push(meta)
      }
    }

    return results
  }
}

module.exports = Database
