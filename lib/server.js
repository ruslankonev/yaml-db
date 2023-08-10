const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const upload = multer()

module.exports = {
  async start(db, port) {
    const app = express()
    app.use(bodyParser.json())

    // File upload request
    app.post('/upload', upload.single('file'), async (req, res, next) => {
      const { action, type, payload } = req.body

      const fileBuffer = req.file.buffer
      const filename = req.file.originalname

      await db.uploadFile(payload?.id, fileBuffer, filename)
    })

    // Routing requests
    app.post('/', async (req, res, next) => {
      const { action, type, payload } = req.body
      if (action === 'create') {
        const result = await db.createRecord({ type }, payload)
        res.send(result)
      }
      if (action === 'update') {
        await db.updateRecord({ type }, payload)
        res.send('ok')
      }
      if (action === 'upload') {
        const file = req.files.file
        const result = await db.uploadFile(payload.id, file, payload.filename)
        res.send(result)
      }
      if (action === 'delete') {
        await db.deleteRecord({ type }, payload)
        res.send('ok')
      }
      if (action === 'get') {
        await db.getRecord({ type }, payload)
        res.send('ok')
      }
      if (action === 'list') {
        await db.listRecords({ type }, payload)
        res.send('ok')
      }
    })

    const server = app.listen(port, () => {
      console.log(
        'YAML-db server is running',
        '\n'
      )
    })

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(
          'Error when starting the server: port is busy. Try to specify a different port using the `-p` option'
        )
      } else {
        console.error('Error:', error.message)
      }
      process.exit(1)
    })
  },
}
