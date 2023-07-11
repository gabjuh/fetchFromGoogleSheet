const express = require('express');
const axios = require('axios');
const fs = require('fs');

const app = express();
const port = 3003; // Change this if needed
const openSheetApiUrl = 'https://opensheet.vercel.app/';
const tableId = '1ghHCdIe2HEsWZ67Mit9WqcsAZUr99s68a495Kn-D-VI';

let obj = {};

app.get('/fetch-data', async (req, res) => {
  try {
    let isResponse = true;

    for (let i = 1; isResponse; i++) {
      // Fetch the data from the Google Sheet
      const response = await axios.get(`${openSheetApiUrl}${tableId}/${i}`); 

      if (response.status !== 400) {
        // Extract the data from the response
        const data = response.data;
        obj[data[0].sheetId] = data;
      } else {
        isResponse = false;
        console.log('No response');
      }
    }

    // Save the data as a JSON file
    fs.writeFileSync('data.json', JSON.stringify(obj, null, 2));

    res.send('Data fetched and saved as data.json');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      // Save the data as a JSON file even if there was a 400 status
      fs.writeFileSync('data.json', JSON.stringify(obj, null, 2));
      console.log('No more data to fetch');
      res.send('Data fetched and saved as data.json');
    } else {
      console.error('Error fetching data:', error);
      res.status(500).send('Error fetching data');
    }
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
