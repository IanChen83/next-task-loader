module.exports.loadTask = (loader, request) => new Promise((resolve, reject) => {
  try {
    loader.loadModule(request, (err, source) => {
      if (err) throw err
      resolve(eval(source))
    })
  } catch (err) {
    reject(err)
  }
})
