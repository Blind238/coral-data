'use strict'
const config = {
  idClasses: [ // don't change these ever. If you MUST, replace also in watson.js: assignZipsToClassifiers
    'coral',
    'seagrass',
    'sand'
  ],
  srcDir: 'images/pending/',
  destDir: 'images/zipped/',
  zipDir: 'images/zips/'
}

module.exports = config
