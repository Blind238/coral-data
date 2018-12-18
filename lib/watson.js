"use strict";
// Watson SDK uses callbacks, which we will promisify
const VisualRecognition = require('watson-developer-cloud/visual-recognition/v3');
const fs = require('fs-extra');
const {promisify} = require('util');

// consider importing a dir file for directories and categories/classes
const zipDir = 'images/zips/';
const dirs = [
  'coral',
  'seagrass',
  'sand'
];

const creds = process.env.NODE_ENV === 'PRODUCTION' ?
  {
    apikey: process.env.IAM_APIKEY
  } : 
  {
    apikey: "X8vrYKedpanaf0vtTc1f3BHEYym34EFFy6GT8DnHUAhx"
  };

const visualRecognition = new VisualRecognition({
  version: "2018-12-01",
  iam_apikey: creds.apikey
});

// promisify visualRecognition methods
const vr = {
  listClassifiers: promisify(visualRecognition.listClassifiers).bind(visualRecognition),
  updateClassifier: promisify(visualRecognition.updateClassifier).bind(visualRecognition),
  createClassifier: promisify(visualRecognition.createClassifier).bind(visualRecognition)
};

async function updateVisualRecognition(){
  // what are we going to train?
  let response;
  try {
    response = await vr.listClassifiers(null);
  } catch (err) {
      throw err;
  }

      if (canTrain(response)) {
    try {
        let zips = await availableZipsToTrain();
        let params = await createTrainingRequest(zips, response);
      console.log('Sending request and files to update classifier ...')
      let result = await vr.updateClassifier(params);// NOTE: this might take a few minutes to get a response
      console.log('Request to updated classifier completed:', JSON.stringify(result,null,2));
    } catch (err) {
      console.log('Error while trying to update classifier:', err);
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

module.exports = updateVisualRecognition;


// is it available to train?
function canTrain(classifierResponse){
  // assuming only 1 classifier
  return classifierResponse.classifiers[0].status === 'ready';

  // assuming multiple classifiers, only proceed when all are ready
  // for (const classifier of classifierResponse.classifiers) {
  //   if (classifier.status !== 'ready') {
  //     return false;
  //   }    
  // }
}

// with what are we training?
async function availableZipsToTrain(){
  let zips = {};
  for (const dir of dirs) {
    let fileList = [];
    try {
      fileList = await fs.readdir(zipDir + dir);
    } catch (err) {
      throw err;
    }
    if (fileList.length > 0) {
      zips[dir] = fileList;
    }
  }

  return zips;
}

// ok, form (re)training request
async function createTrainingRequest(zips, classifierResponse) {
  let params = {};

  // assuming 1 classifier
  params.classifier_id = classifierResponse.classifiers[0].classifier_id;

  // only match that 1 classifier and add 1 zip file
  for (const dir of dirs) {
    if (zips[dir] !== undefined/*  && dir === classifierResponse.classifiers[0].name */){
      params[dir + '_positive_examples'] = fs.createReadStream(zipDir + dir +'/'+ zips[dir][0])
    }
  }

  return params;
}

// send (re)training request


//TODO:
// Retrieve classifier data, to then read the ID.
// Check status, only upload when ready and not (re)training
// Prepare readstreams for all classes which we have files for. 1 file per class
// Send request, which will take minutes to respond due to uploading