require('dotenv').config({patj: '/.env'});
const express = require('express');
const axios = require('axios');
const fs = require('fs');

const app = express();
const port = process.env.PORT;
const openSheetApiUrl = process.env.OPEN_SHEET_API_URL;
const tableId = process.env.TABLE_ID;
const timeStamp = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });

let obj = {
  timeStamp: timeStamp,
};

let driveIds = [];

app.get('/image-download', async (req, res) => {
  try {
    // Download the images
    for (let i = 0; i < driveIds.length; i++) {
      const driveId = driveIds[i];
      const response = await axios.get(`https://drive.google.com/uc?export=view&id=${driveId}`, { responseType: 'arraybuffer' });
      const image = Buffer.from(response.data, 'binary').toString('base64');
      obj[driveId] = image;
    }
    res.send('Images downloaded');
  } catch (error) {
    console.error('Error downloading images:', error);
    res.status(500).send('Error downloading images');
  }
});

app.get('/fetch-data', async (req, res) => {
  try {
    let isResponse = true;

    for (let i = 1; isResponse; i++) {
      // Fetch the data from the Google Sheet
      const response = await axios.get(`${openSheetApiUrl}${tableId}/${i}`); 

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
          }
        });

        // Add the data to the object
        obj[data[0].sheetId] = data;

        // Download the images
        // for (let i = 0; i < driveIds.length; i++) {
        //   const driveId = driveIds[i];
        //   const response = await axios.get(`https://drive.google.com/uc?export=view&id=${driveId}`, { responseType: 'arraybuffer' });
        //   const image = Buffer.from(response.data, 'binary').toString('base64');
        //   obj[driveId] = image;
        // }

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
      fs.writeFileSync('data.json', JSON.stringify(obj, null, 2));
      
      // Save the images as a JSON file
      fs.writeFileSync('images.json', JSON.stringify(driveIds, null, 2));
            
      res.send(`Data fetched and saved as data.json<br><br>Last rendering: ${timeStamp}`);
    } else {
      console.error('Error fetching data:', error);
      res.status(500).send('Error fetching data');
    }
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
