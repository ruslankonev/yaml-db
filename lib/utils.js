const fs = require('fs')
const YAML = require('yaml')

const ob2Str = (val) => {
  return {}.toString.call(val)
}
const isObject = (val) => {
  return ob2Str(val) === '[object Object]' && !isArray(val)
}

const isArray = (val) => {
  return Array.isArray(val)
}

function defu(_obj, _defaults) {
  if (!isObject(_obj) || !isObject(_defaults)) {
    return _obj
  }

  const obj = Object.assign({}, _defaults)

  for (const key in _obj) {
    if (key === '__proto__' || key === 'constructor') {
      continue
    }

    const val = _obj[key]

    if (val === null) {
      continue
    }

    if (isObject(val) && isObject(obj[key])) {
      obj[key] = defu(val, obj[key])
    } else {
      obj[key] = val
    }
  }

  return obj
}

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

  defu,
}
