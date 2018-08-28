# next-task-loader

A Next.js plugin to load assets with custom task loader scripts.


## Why

When developing Next.js applications, we often need data from


## Installation

`npm install --save next-task-loader`

or

`yarn add next-task-loader`


## Usage

Create a `next.config.js` in your project

```
// next.config.js
const withTaskLoader = require('next-task-loader')

let config = {}

// ...rest of your config

config = withTaskLoader()(config) // Or withTaskLoader(options)(config)

module.exports = config
```

Then, any imported modules with name matching `.task.js` will be imported by
this loader.
