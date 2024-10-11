const fs = require('fs').promises
const path = require('path')
const YAML = require('yaml')
const { nanoid } = require('nanoid')
const _ = require('lodash')
const { defu } = require('./utils')

/*********************************************************************
 *                                                                    *
 *                         Base Database class                        *
 *                                                                    *
 *********************************************************************/
class Database {
  constructor(dataPath) {
    this.dataPath = path.resolve(dataPath)
    this.records = {}
  }

  /**************************************************
   * Database initialization
   *************************************************/
  async init() {
    try {
      await fs.access(this.dataPath)
    } catch (error) {
      await fs.mkdir(this.dataPath, { recursive: true })
    }
    await this.loadRecords()
  }

  /**************************************************
   * Loading records into memory
   *************************************************/
  async loadRecords() {
    const recordTypes = await fs.readdir(this.dataPath)

    for (const recordType of recordTypes) {
      this.records[recordType] = {}

      const recordIds = await fs.readdir(path.join(this.dataPath, recordType))

      for (const recordId of recordIds) {
        const data = await this.getRecordData(recordId, recordType)
        this.records[recordType][recordId] = data
      }
    }
  }

  /**************************************************
   * List records by filter
   *************************************************/
  async listRecords(filter) {
    let result = []
    const records = Object.values(this.records)

    if (filter) {
      if (filter?.constructor.name === 'String') {
        result = _.filter(records, (item) =>
          _.some(Object.values(item), (value) =>
            _.includes(String(value).toLowerCase(), query.toLowerCase())
          )
        )
      } else {
        result = _.filter(records, filter)
      }
    }

    return result
  }

  /**************************************************
   * Paginate and sort records
   *************************************************/
  async paginateAndSortRecords(
    records,
    { page = 1, limit = 10, sortBy = '_meta.created_at', order = 'asc' }
  ) {
    records = _.orderBy(records, [sortBy], [order])
    records = _.chunk(records, limit)
    return records[page - 1] || []
  }

  /**************************************************
   * Function for data search with MongoDB operators support
   *************************************************/
  async find(query) {
    const records = Object.values(this.records)

    return records.filter((record) => {
      for (const [key, value] of Object.entries(query)) {
        if (typeof value === 'object' && value !== null) {
          for (const [operator, operatorValue] of Object.entries(value)) {
            switch (operator) {
              case '$eq':
                if (!_.isEqual(_.get(record, key), operatorValue)) {
                  return false
                }
                break
              case '$gt':
                if (!(_.get(record, key) > operatorValue)) {
                  return false
                }
                break
              case '$gte':
                if (!(_.get(record, key) >= operatorValue)) {
                  return false
                }
                break
              case '$lt':
                if (!(_.get(record, key) < operatorValue)) {
                  return false
                }
                break
              case '$lte':
                if (!(_.get(record, key) <= operatorValue)) {
                  return false
                }
                break
              case '$ne':
                if (_.isEqual(_.get(record, key), operatorValue)) {
                  return false
                }
                break
              case '$in':
                if (!operatorValue.includes(_.get(record, key))) {
                  return false
                }
                break
              case '$nin':
                if (operatorValue.includes(_.get(record, key))) {
                  return false
                }
                break

              default:
                return false
            }
          }
        } else {
          if (!_.isEqual(_.get(record, key), value)) {
            return false
          }
        }
      }
      return true
    })
  }

  /**************************************************
   * Retrieving a record
   *************************************************/
  get(id, recordType = 'untyped') {
    return this.records[recordType]?.[id]
  }

  /**************************************************
   *
   * Add record
   *
   * Method will support merge data with exists. Work like upsert
   *
   * @param {object} record data to store or update
   * @param {boolean} [merge=false] a «merge logic» with exist data
   *************************************************/
  async add(record, merge = false) {
    if (!record) return

    let existingData

    if (record._id && record._type) {
      existingData = this.get(record._id, record._type)
    }

    record._id = record._id || existingData?._id || nanoid()
    record._type = record._type || existingData?._type || 'untyped'
    record._created_at = record._created_at || existingData?._created_at || Date.now()
    record._updated_at = Date.now()
    record._files = record._files || existingData?._files

    const recordTypePath = path.join(this.dataPath, record._type)
    const recordPath = path.join(recordTypePath, record._id)

    try {
      await fs.access(recordTypePath)
    } catch (error) {
      await fs.mkdir(recordTypePath, { recursive: true })
    }

    await fs.mkdir(recordPath, { recursive: true })

    const dataPath = path.join(recordPath, 'data.yaml')

    if (merge) {
      record = defu(record, existingData)
    }

    !this.records[record._type] && (this.records[record._type] = {})

    this.records[record._type][record._id] = record
    await fs.writeFile(dataPath, YAML.stringify(record), 'utf8')

    return record._id
  }

  /**************************************************
   * Loading a binary file into a record
   *************************************************/
  async uploadFile(recordId, fileBuffer, filename, recordType = 'untyped') {
    const recordPath = path.join(this.dataPath, recordType, recordId)
    const filesPath = path.join(recordPath, 'files')

    const data = await this.getRecordData(recordId, recordType)

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

    data._files = data._files || []

    data._files.push({
      id: fileId,
      filename,
      created_at: Date.now(),
    })

    await fs.writeFile(path.join(recordPath, 'data.yaml'), YAML.stringify(data), 'utf8')
  }

  /**************************************************
   * Reading record data
   *************************************************/
  async getRecordData(id, recordType = 'untyped') {
    const dataPath = path.join(this.dataPath, recordType, id, 'data.yaml')
    let content
    try {
      content = await fs.readFile(dataPath, 'utf8')
      return YAML.parse(content)
    } catch (error) {
      return undefined
    }
  }
}

module.exports = Database
