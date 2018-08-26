const Module = require('module')

async function resolveResult(obj) {
  // Respect the shape of obj
  if (Array.isArray(obj)) {
    return await Promise.all(obj.map(f => f(this)))
  } else if (typeof obj === 'object') {
    const results = []
    await Promise.all(
      Object.entries(obj).map(async ([key, func]) => {
        results[key] = await func(this)
      }),
    )
    return results
  } else if (typeof obj === 'function') {
    return await obj(this)
  }
}

module.exports = async function(content) {
  function exec(code, filename) {
    const module = new Module(filename, this)
    module.paths = Module._nodeModulePaths(this.context || '.')
    module.filename = filename
    module._compile(code, filename)
    return module.exports
  }

  const callback = this.async()
  let results

  try {
    // Execute the module and get the exported value
    const exports = exec(content, this.resourcePath)

    results = await resolveResult(exports)
  } catch (e) {
    this.emitError(e)
  }

  return callback(null, `module.exports = ${JSON.stringify(results)}`)
}
