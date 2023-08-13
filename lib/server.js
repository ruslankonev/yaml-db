const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const upload = multer()

module.exports = {
  async start(db, port, allowedFrom) {
    const app = express()
    app.use(bodyParser.json())

    // CORS
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', allowedFrom)
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
      next()
    })

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
      let result
      if (action === 'create') {
        result = await db.createRecord({ type }, payload)
        return res.send(result)
      }
      if (action === 'update') {
        await db.updateRecord({ type }, payload)
        return res.send('ok')
      }
      if (action === 'upload') {
        const file = req.files.file
        result = await db.uploadFile(payload.id, file, payload.filename)
        return res.send(result)
      }
      if (action === 'delete') {
        await db.deleteRecord({ type }, payload)
        return res.send('ok')
      }
      if (action === 'get') {
        await db.getRecord({ type }, payload)
        return res.send('ok')
      }
      if (action === 'list') {
        result = await db.listRecords({ type }, payload)
        return res.send(result)
      }

      return res.status(404)
    })

    app.get('/', async (req, res, next) => {
      return res.status(404)
    })

    const server = app.listen(port, () => {
      console.log('YAML-db server is running', '\n')
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
