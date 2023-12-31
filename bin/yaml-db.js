#!/usr/bin/env node

const path = require('path')
const { program } = require('commander')
const express = require('express')
const bodyParser = require('body-parser')
const server = require('../lib/server')
const Database = require('../lib/database')
const { getConfig } = require('../lib/utils')

const app = express()
app.use(bodyParser.json())

program.version(require('../package.json').version)

program
  .option('-c, --config [path]', 'Path to configuration file')
  .option('-a, --allow [allow_from]', 'Specify CORS connection string', '*')
  .option('-d, --dir [directory]', 'File storage path', './data')
  .option('-p, --port [port]', 'The port on which the server is raised', 5701)
  .parse()

let port
let dataPath

const options = program.opts()

if (options.config) {
  const configPath = path.resolve(options.config)
  const config = getConfig(configPath)
  port = config.server.port
  allowedFrom = config.server.allowedFrom
  dataPath = config.database.dataPath
}

// A command line argument overrides the config file
port = options.port || port
dataPath = options.dir || dataPath
allowedFrom = options.allow || allowedFrom

console.log(`

  ▀▄░▄▀ ▄▀▄ █▄░▄█ █░░     █▀▄ █▀▄ 
  ░░█░░ █▀█ █░█░█ █░▄     █░█ █▀█ 
  ░░▀░░ ▀░▀ ▀░░░▀ ▀▀▀     ▀▀░ ▀▀░  v.${program.version()}

  Database path: ${dataPath}
  Server port: ${port}
  Allowed CORS From: ${allowedFrom}

`)

const db = new Database(dataPath)

program
  .command('start')
  .description('Start the database server')
  .action(async () => {
    await db.init().catch((error) => {
      console.info('Error during database initialization:', error.message)
      process.exit(1)
    })
    await server.start(db, port, allowedFrom).catch((error) => {
      console.info('Error during server start:', error.message)
      process.exit(1)
    })
  })

program.parse(process.argv)
