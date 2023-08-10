const fs = require('fs')
const YAML = require('yaml')

// Reading configuration from a file
module.exports = {
  getConfig: (configPath) => {
    try {
      const configContent = fs.readFileSync(configPath, 'utf8')
      return YAML.parse(configContent)
    } catch (error) {
      console.error('Error reading the configuration:', error.message)
      process.exit(1)
    }
  },
}
