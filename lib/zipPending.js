"use strict";
const fs = require('fs-extra');
const archiver = require('archiver');

const MAX_IMAGES = 10000,
  MAX_FILE_SIZE = 100000000; //in bytes, equals 100MB

const dirs = [
  'coral',
  'seagrass',
  'sand'
];

const srcDir = 'images/pending/';
const destDir = 'images/zipped/';
const zipDir = 'images/zips/';

async function zipPending() {
  // make sure directories exist, else node errors
  await ensureDirs(dirs);
  
  for (const dirName of dirs) {
    let fileList = []

    try {
      fileList = await fs.readdir(srcDir + dirName);
    } catch (err) {
      throw err;
    }
    
    // select files to be zipped
    // NOTE: image limit is huge, so not needed until watson API changes
    // let imageLimit = fileList.length > MAX_IMAGES ? MAX_IMAGES : fileList.length;
    const toZip = await selectFromDirUpToSize(fileList, srcDir + dirName, MAX_FILE_SIZE);
    
    // zip files
    let output = fs.createWriteStream(zipDir + dirName + '/' + dirName + '_' + Date.now() + '.zip');
    let archive = archiver('zip');

    output.on('close', () => {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
    })

    output.on('end', function () {
      console.log('Data has been drained');
    });
    
    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        // log warning
      } else {
        // throw error
        throw err;
      }
    });

    archive.on('error', function (err) {
      throw err;
    });

    archive.pipe(output);

    // append files
    for (const fileName of toZip) {
      archive.file(srcDir + dirName + '/' + fileName, { name: fileName });
    }

    // finalize the archive (ie we are done appending files but streams have to finish yet)
    // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    // output.on('open', () => {
    //   archive.finalize();
    // })
    archive.finalize();
  }

}

module.exports = zipPending;

async function ensureDirs(dirs) {
  for (const dir of dirs) {
    try {
      await fs.ensureDir(srcDir + dir)
      await fs.ensureDir(destDir + dir)
      await fs.ensureDir(zipDir + dir)
    } catch (err) {
      throw err;
    }
  }
}

async function selectFromDirUpToSize(files, dir, size) {
  let toZip = [];
  let totalBytes = 0;

  for (const fileName of files) {
    let stats = await fs.stat(dir + '/' + fileName)
    if (stats.size + totalBytes < size) {
      totalBytes += stats.size;
      toZip.push(fileName);
    }
  }

  return toZip;

  // let i = 0;
  // while(i < imageLimit) {
  //   const fileName = fileList[i];
  //   let stats = await fs.stat(srcDir + dirName + '/' + fileName)
  //   if(stats.size + totalBytes < MAX_FILE_SIZE) {
  //     toZip[dirName].push(fileName);
  //     totalBytes += stats.size;
  //   }
  //   else {
  //     break;
  //   }

  //   i++
  // }

  // this fills up while still calling all file stats. fills up meaning:
  // if a later item does fit, it will be added to the zip. benchmark both implementations,
  // note storage disk type in results.
  // benchmark for 100, 1000, 10000 (which is MAX_IMAGES at time of writing)
  // toZip = fileList.filter( async fileName => {
  //   let stats = await fs.stat(srcDir + dirName + '/' + fileName)
  //   if (stats.size + totalBytes < MAX_FILE_SIZE) {
  //     totalBytes += stats.size;
  //     return true;
  //   }
  //   else {
  //     return false;
  //   }
  // })
}

/**
 * NEXT STEPS: either save file names in db while adding images, to then
 *             trigger prepping zips
 *                pro: more control of process
 *                con: stray files not known to system
 *             OR use chokidar to monitor folders, and execute prepping zips
 *             when lockfile is not present
 *                pro: automated process
 *                pro: no stray files in folder
 *             OR stop being fancy and have button to process pending images, HURR DURR
 * 
 * NOTE: there is no way do detect duplicates right now. perhaps it's still best
 *  to have processed images be tracked in DB, and compare checksums for new files??
 */