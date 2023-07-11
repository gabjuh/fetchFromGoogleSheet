const express = require('express');
const axios = require('axios');
const fs = require('fs');

const app = express();
const port = 3003; // Change this if needed
const openSheetApiUrl = 'https://opensheet.elk.sh/';
const tableId = '1ghHCdIe2HEsWZ67Mit9WqcsAZUr99s68a495Kn-D-VI';
const sheetName = 'home';

app.get('/fetch-data', async (req, res) => {
  try {
    // const response = await axios.get('https://opensheet.vercel.app/YOUR_SPREADSHEET_ID'); // Replace with your Google Sheet ID
    // const response = await axios.get(`https://opensheet.elk.sh/1ghHCdIe2HEsWZ67Mit9WqcsAZUr99s68a495Kn-D-VI/home`); // Replace with your Google Sheet ID
    const response = await axios.get(`https://opensheet.vercel.app/1ghHCdIe2HEsWZ67Mit9WqcsAZUr99s68a495Kn-D-VI/home`); // Replace with your Google Sheet ID
    // 1ghHCdIe2HEsWZ67Mit9WqcsAZUr99s68a495Kn-D-VI
    // https://opensheet.elk.sh
    // https://opensheet.vercel.app
    // https://docs.google.com/spreadsheets/d/1ghHCdIe2HEsWZ67Mit9WqcsAZUr99s68a495Kn-D-VI/edit?usp=sharing

    // const response = fetch(`${openSheetApiUrl}${tableId}/${sheetName}`)
      // .then((res) => res.json());
    
    // Extract the data from the response
    const data = response.data;
    
    // Save the data as a JSON file
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    
    res.send('Data fetched and saved as data.json');
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});