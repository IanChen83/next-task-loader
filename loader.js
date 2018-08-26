const Module = require('module')

// Respect the shape of obj
async function resolveResult(loader, obj) {
  if (Array.isArray(obj)) {
    return await Promise.all(obj.map(f => f(loader)))
  } else if (typeof obj === 'object') {
    const results = []
    await Promise.all(
      Object.entries(obj).map(async ([key, func]) => {
        results[key] = await func(loader)
      }),
    )
    return results
  } else if (typeof obj === 'function') {
    return await obj(loader)
  }
}

function exec(loader, code) {
  const filename = loader.resourcePath

  const module = new Module(filename, loader)
  module.paths = Module._nodeModulePaths(loader.context || '.')
  module.filename = filename
  module._compile(code, filename)

  return module.exports
}

module.exports = async function(content) {
  const callback = this.async()
  let results

  try {
    // Execute the module and get the exported value
    const exports = exec(this, content)
    results = await resolveResult(this, exports)
  } catch (e) {
    this.emitError(e)
  }

  return callback(null, `module.exports = ${JSON.stringify(results)}`)
}
