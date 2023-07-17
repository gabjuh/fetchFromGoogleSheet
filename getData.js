// const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const axios = require('axios');
const fs = require('fs');

const openSheetApiUrl = process.env.OPEN_SHEET_API_URL;
const tableId = process.env.TABLE_ID;
const timeStamp = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
// const logDirectory = path.join(__dirname, 'data/logs');
const today = new Date().toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' });
// const fileName = path.join(__dirname, `data/logs/log-${today}.txt`);
const currentFolder = process.env.CURRENT_FOLDER;
const fileName = currentFolder + `data/logs/log-${today}.txt`;
// const fileName = path.join(currentFolder, `data/logs/log-${today}.txt`);
// const fileName = `data/logs/log-${today}.txt`;
// const fileName = path.join(logDirectory, `log-${today}.txt`);

// Create log file if not exists
// if (!fs.existsSync(fileName)) {
//   fs.writeFileSync(fileName, '');
// }

// Create log file if not exists
fs.access(fileName, fs.constants.F_OK, (err) => {
  if (err) {
    fs.writeFileSync(fileName, ''); // Create an empty log file
    console.log('Log file created: ' + fileName);
  }
});

// Messages

let success = '';
let error = '';
let sheetIds = '';
let images = '';
const lastRendering = 'Last rendering: ' + timeStamp;


let obj = {
  timeStamp: timeStamp,
};

function log(sheetIds, images, success, error) {
  fs.readFile(fileName, 'utf8', function(err, data) {
    if (err) throw err;
    fs.writeFileSync(
      fileName,
      '#################################################\n' +
      '###### ' + lastRendering + ' ######\n' +
      '#################################################\n\n' +
      success + error + 
      '\nFollowing sheets were fetched:\n'  + sheetIds +
      '\n\nFollowing images were found:\n' + images +
      '-----------------------------------------------------------------\n\n' +
      data,
    );
  });
}


let driveIds = [];

async function getData() {
  try {
    let isResponse = true;

    for (let i = 1; isResponse; i++) {
      // Fetch the data from the Google Sheet
      const response = await axios.get(`${openSheetApiUrl}${tableId}/${i}`); 

      // fs.appendFileSync('data/log.txt', 'Last rendering: ' + timeStamp + '\n');

      if (response.status !== 400) {
        // Extract the data from the response
        const data = response.data;

        // Find images and add to the images list
        data.forEach((item) => {
          const id = item.driveId
          if (id !== undefined && id !== '') {
            // skip if already in the list
            if (driveIds.find((driveId) => driveId.driveId === id)) return;	
            driveIds.push({
              driveId: id,
              fileName: item.fileName,
            });
            images += ' - ' + item.fileName + ' (' + id + ')\n';

          }
        });

        // Add the data to the object
        obj[data[0].sheetId] = data;
        sheetIds += data[0].sheetId + ', ';
        console.log('Fetched sheet: ' + data[0].sheetId);

      } else {
        isResponse = false;
        console.log('No response');
      }
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      // Save the data as a JSON file even if there was a 400 status
      console.log('No more data to fetch');

      // Save the data as a JSON file
      fs.writeFileSync(currentFolder + 'data/data.json', JSON.stringify(obj, null, 2));
      
      // Save the images as a JSON file
      fs.writeFileSync(currentFolder + 'data/images.json', JSON.stringify(driveIds, null, 2));
            
      success = 'Data fetched and saved as data.json\n';
      console.log(lastRendering);
      console.log(success);


    } else {
      error = 'Error fetching data:\n';
      console.error(error, error);
      console.log(error);
    }
  }
  log(sheetIds, images, success, error);
}

getData()