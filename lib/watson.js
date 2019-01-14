'use strict'
// Watson SDK uses callbacks, which we will promisify
const VisualRecognition = require('watson-developer-cloud/visual-recognition/v3')
const fs = require('fs-extra')
const { promisify } = require('util')
const config = require('./../config')

const creds = process.env.NODE_ENV === 'PRODUCTION'
  ? {
    apikey: process.env.IAM_APIKEY
  }
  : {
    apikey: 'X8vrYKedpanaf0vtTc1f3BHEYym34EFFy6GT8DnHUAhx'
  }

const visualRecognition = new VisualRecognition({
  version: '2018-12-01',
  iam_apikey: creds.apikey
})

// promisify visualRecognition methods (3rd party libs need to be bound)
const vr = {
  listClassifiers: promisify(visualRecognition.listClassifiers).bind(visualRecognition),
  updateClassifier: promisify(visualRecognition.updateClassifier).bind(visualRecognition),
  createClassifier: promisify(visualRecognition.createClassifier).bind(visualRecognition)
}

async function updateClassifiers () {
  // what are we going to train?
  let classifiers = await listClassifiers

  if (canTrain(classifiers)) {
    try {
      let zips = await availableZipsToTrain()
      let params = await createTrainingRequests(zips, classifiers)
      console.log('Sending requests and files to update classifiers ...')
      let results = await Promise.all(Object.keys(params).map(key => vr.updateClassifier(params[key])))
      // let result = await vr.updateClassifier(params)// NOTE: this might take a few minutes to get a response
      console.log('Request to updated classifier completed:', JSON.stringify(results, null, 2))
    } catch (err) {
      console.log('Error while trying to update classifier:', err)
    }
  }

  // visualRecognition.listClassifiers(null, async (err, response) => {
  //   if (err) {
  //     throw err;
  //   } else {
  //     if (canTrain(response)) {
  //       let zips = await availableZipsToTrain();
  //       let params = await createTrainingRequest(zips, response);
  //       visualRecognition.updateClassifier(params, (err, response) => {
  //         // NOTE: this might take a few minutes to get a response
  //         if (err) {
  //           console.log(err);
  //         } else {
  //           console.log(JSON.stringify(response, null, 2))
  //         }
  //       });
  //     }
  //   }
  // });
}

module.exports = {
  listClassifiers,
  updateClassifiers,
  createClassifiers
}

function canTrain (classifiers) {
  // assuming multiple classifiers, only proceed when all are ready
  for (const classifier of classifiers) {
    if (classifier.status !== 'ready') {
      return false
    }
  }
  return true
}

async function availableZipsToTrain () {
  let zipLists = {}
  for (const dir of config.idClasses) {
    let fileList = []
    try {
      fileList = await fs.readdir(config.zipDir + dir)
    } catch (err) {
      throw err
    }
    if (fileList.length > 0) {
      zipLists[dir] = fileList
    }
  }

  return zipLists
}

function createTrainingRequests (zipLists, classifiers) {
  let params = assignZipsToClassifiers(zipLists, classifiers)

  for (const classifier of classifiers) {
    params[classifier.name].classifier_id = classifier.classifier_id
  }

  return params
}

async function listClassifiers () {
  let response
  try {
    response = await vr.listClassifiers(null)
  } catch (err) {
    throw err
  }
  return response.classifiers
}

async function createClassifiers (zipLists) {
  // ensure we have a zip for each class we want to train
  if (Object.keys(zipLists).length >= config.idClasses.length &&
      Object.keys(zipLists).length === 3 && zipLists.hasOwnProperty('other')) {
    throw new Error('not enough zips of the required classifiers present')
  }

  let classifiers = config.idClasses.map(name => ({ name }))

  let params = assignZipsToClassifiers(zipLists, classifiers)

  let paramPromises = Object.keys(params).map((name) => {
    params[name].name = name
    return vr.createClassifier(params[name])
  })

  return Promise.all(paramPromises)
}

function assignZipsToClassifiers (zipLists, classifiers) {
  let params = {}

  for (const classifier of classifiers) {
    params[classifier.name] = {}

    for (const zipListName of Object.keys(zipLists)) {
      // some rules:
      // if training coral, seagrass should be negative example
      // if training seagrass, coral should be negative example
      // all, including sand, include sand as positive examples
      // if training sand, 'other' should be negative example
      // 'other' is not included in training coral and seagreass
      switch (classifier.name) {
        case 'coral':
          if (zipListName === 'seagrass') {
            params[classifier.name]['negative_examples'] = fs.createReadStream(config.zipDir + zipListName + '/' + zipLists[zipListName][0])
          } else if (zipListName !== 'other') {
            params[classifier.name][zipListName + '_positive_examples'] = fs.createReadStream(config.zipDir + zipListName + '/' + zipLists[zipListName][0])
          }
          break
        case 'seagrass':
          if (zipListName === 'coral') {
            params[classifier.name]['negative_examples'] = fs.createReadStream(config.zipDir + zipListName + '/' + zipLists[zipListName][0])
          } else if (zipListName !== 'other') {
            params[classifier.name][zipListName + '_positive_examples'] = fs.createReadStream(config.zipDir + zipListName + '/' + zipLists[zipListName][0])
          }
          break
        case 'sand':
          if (zipListName === 'other') {
            params[classifier.name]['negative_examples'] = fs.createReadStream(config.zipDir + zipListName + '/' + zipLists[zipListName][0])
          } else {
            params[classifier.name][zipListName + '_positive_examples'] = fs.createReadStream(config.zipDir + zipListName + '/' + zipLists[zipListName][0])
          }
          break
      }
    }
  }

  return params
}
