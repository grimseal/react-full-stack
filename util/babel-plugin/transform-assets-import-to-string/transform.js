const path = require('path');
const fileToBase64 = require('./fileToBase64');
const filePath = require('./steps/filePath');
const fileHash = require('./steps/fileHash');
const replaceNode = require('./steps/replaceNode');

function transform(scope, options) {
  const ext = path.extname(scope.value);

  if (!options.extensions || options.extensions.indexOf(ext) < 0) {
    return;
  }

  const dir = path.dirname(path.resolve(scope.filename));
  const absPath = path.resolve(dir, scope.value);

  if (process.env.NODE_ENV !== 'development') {
    const fp = filePath(absPath, options);
    const fx = path.extname(fp);
    const hash = fileHash(fp, absPath, options);
    const resultPath = `${path.basename(fp, fx)}${hash}${fx}`;
    replaceNode(scope, `${options.baseUri}/${resultPath}`);
  } else {
    replaceNode(scope, fileToBase64(absPath));
  }
}

module.exports = transform;
