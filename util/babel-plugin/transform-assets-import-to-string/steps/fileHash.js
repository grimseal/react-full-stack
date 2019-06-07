const createHash = require('webpack').util.createHash;
const fs = require('fs');

function getHash(fp, path, options) {
  if (!options.hash) {
    return '';
  }
  return `.${createHash('md5').update(fs.readFileSync(path, 'utf8')).digest('hex')}`;
}

module.exports = getHash;
