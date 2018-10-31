const Module = require('module')
const loaderUtils = require('loader-utils')

// Respect the shape of obj
async function resolveResult(loader, obj, query) {
  if (Array.isArray(obj)) {
    return await Promise.all(obj.map(f => f(loader, query)))
  } else if (typeof obj === 'object') {
    const results = []
    await Promise.all(
      Object.entries(obj).map(async ([key, func]) => {
        results[key] = await func(loader, query)
      }),
    )
    return results
  } else if (typeof obj === 'function') {
    return await obj(loader, query)
  }
}

function exec(code, filename, context) {
  const m = new Module(filename)

  m.paths = Module._nodeModulePaths(context || '.')
  m.filename = filename
  m._compile(code, filename)

  return m.exports
}

module.exports = async function(content) {
  const { reload = true } = Object.assign({}, loaderUtils.getOptions(this))

  const callback = this.async()
  let results
  let query

  if (this.resourceQuery) {
    query = loaderUtils.parseQuery(this.resourceQuery)
  }

  const reloadStubName = `__webpack_reload_${this.resourcePath}__`
  const reloadStr = reload
    ? `
if (module.hot) {
  module.hot.dispose(function() {
    window['${reloadStubName}'] = true
  })
  if (window['${reloadStubName}']) {
    module.hot['${reloadStubName}'] = false
    window.location.reload()
  }
}
`
    : ''

  try {
    // Execute the module and get the exported value
    const exports = exec(content, this.resourcePath, this.context)
    results = await resolveResult(this, exports, query)
  } catch (e) {
    results = {}
    this.emitError(e)
  }

  return callback(
    null,
    `${reloadStr}module.exports = ${JSON.stringify(results)}`,
  )
}
