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
    

    let toZip = [];
    // select files to be zipped
    let imageLimit = fileList.length > MAX_IMAGES ? MAX_IMAGES : fileList.length;
    let totalBytes = 0;
    
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
    
    for (const fileName of fileList) {
      let stats = await fs.stat(srcDir + dirName + '/' + fileName)
      if (stats.size + totalBytes < MAX_FILE_SIZE) {
        totalBytes += stats.size;
        toZip.push(fileName);
      }
      else {
        break;
      }
    }

    console.log(totalBytes);

    
    // BELOW ONLY APPLIES TO CLASSIFYING, NOT UPDATING CLASSES
    // was first thinking of going through all files, not needed if max is 20.
    // also with subjects being images, 20 images will not pass 100 MB, so file
    //  size check is not needed


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

async function selectUpToMaxSize(files, dir) {
  for (const fileName of fileList) {
    let stats = await fs.stat(dir + '/' + fileName)
    if (stats.size + totalBytes < MAX_FILE_SIZE) {
      totalBytes += stats.size;
      toZip.push(fileName);
    }
    else {
      break;
    }
  }
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