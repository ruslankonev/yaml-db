const fs = require('fs-extra')
const path = require('path')
const YAML = require('yaml')

const configPath = path.join(__dirname, 'data', 'config.yaml')

// Чтение конфигурации из файла config.yaml
module.exports = {
  getConfig: (configPath) => {
    try {
      const configContent = fs.readFileSync(configPath, 'utf8')
      return YAML.parse(configContent)
    } catch (error) {
      console.error('Ошибка при чтении конфигурации:', error.message)
      process.exit(1)
    }
  },
	
  // Запись конфигурации в файл config.yaml
  saveConfig: (config) => {
    try {
      const configContent = YAML.stringify(config)
      fs.writeFileSync(configPath, configContent, 'utf8')
    } catch (error) {
      console.error('Ошибка при сохранении конфигурации:', error.message)
      process.exit(1)
    }
  },
}
