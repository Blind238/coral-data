// const path = require('path')

module.exports = {
  entry: './src/script/map.js',
  module: {
    rules: [
      { test: /\.css$/, use: ['css-loader', 'style-loader'] }
    ]
  }
}
