const path = require('path');
const fs = require('fs');

const extensionDataType = {
  '.gif': 'image/gif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function fileToBase64(file) {
  const ext = path.extname(file);
  if (!Object.prototype.hasOwnProperty.call(extensionDataType, ext)) return '';
  const dataType = extensionDataType[ext];
  return `data:${dataType};base64,${fs.readFileSync(file).toString('base64')}`;
}

module.exports = fileToBase64;