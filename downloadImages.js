const axios = require('axios');
const fs = require('fs');
const path = require('path');
const jsonfile = require('jsonfile');

// async function downloadAndSaveFile(url, destination) {
//   try {
//     const response = await axios.get(url, { responseType: 'arraybuffer' });
//     await fs.promises.writeFile(destination, response.data);
//     console.log('File downloaded and saved:', destination);
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// }

async function downloadFileFromGoogleDrive(id, destination) {
  const URL = 'https://docs.google.com/uc?export=download';
  // const URL = 'https://drive.google.com/uc?export=download&id=';
  const response = await axios.get(URL, {
    params: { id },
    responseType: 'arraybuffer', // Download the file as binary data
  });

  const token = getConfirmToken(response);
  if (token) {
    const params = { id, confirm: token };
    const downloadResponse = await axios.get(URL, {
      params,
      responseType: 'arraybuffer',
    });
    await saveResponseContent(downloadResponse, destination);
  }
}

function getConfirmToken(response) {
  const setCookieHeaders = response.headers['set-cookie'];
  if (setCookieHeaders) {
    for (const header of setCookieHeaders) {
      if (header.startsWith('download_warning')) {
        return header.split(';')[0].split('=')[1];
      }
    }
  }
  return null;
}

async function saveResponseContent(response, destination) {
  try {
    await fs.writeFile(destination, response.data);
    console.log('File saved:', destination);
  } catch (err) {
    console.error('Error saving file:', destination, err.message);
    throw err;
  }
}

async function main() {
  const destinationFolder = 'data/img';
  const jsonFilePath = 'data/images.json';
  const jsonData = await jsonfile.readFile(jsonFilePath);

  try {
    for (const item of jsonData) {
      const { driveId, fileName } = item;
      const destination = path.join(destinationFolder, fileName);

      // Check if the file already exists before downloading
      if (!fs.existsSync(destination)) {
        await downloadFileFromGoogleDrive(driveId, destination);
        console.log('Downloaded:', destination);
      }
    }

    // Remove local files that are not present in the JSON object anymore
    const filesInDestinationFolder = fs.readdirSync(destinationFolder);
    for (const filename of filesInDestinationFolder) {
      const fileData = jsonData.find((p) => p.fileName === filename);
      if (!fileData) {
        const filePath = path.join(destinationFolder, filename);
        fs.unlinkSync(filePath);
        console.log('Removed:', filePath);
      }
    }

    console.log('Done!');
  } catch (err) {
    console.error('Error:', err.message);
    console.error('Error stack:', err.stack);
  }
}

main().catch((err) => console.error('Error:', err.message));