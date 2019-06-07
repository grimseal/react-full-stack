import fs from 'fs';
import config from 'config';

function linkTag(href) {
  return `<link rel="stylesheet" href="/${href}" />`;
}
function scriptTag(src, props) {
  if (!src) return '';
  if (!props) return `<script src="/${src}"></script>`;

  const data = Buffer.from(JSON.stringify(props)).toString('base64');

  return `<script src="/${src}" data-props='${data}'></script>`;
}

let cssBundle = 'bundle.css';
let appBundle = 'bundle.js';
let vendorBundle = '';

if (process.env.NODE_ENV !== 'development' && fs.existsSync(config.dist)) {
  fs.readdirSync(config.dist).forEach(file => {
    if (file.includes('app')) appBundle = file;
    else if (file.includes('vendor')) vendorBundle = file;
    else if (file.includes('css')) cssBundle = file;
  });
}

const lang = 'en';
const title = 'React Full Stack';

export default (app, props) => `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <title>${title}</title>
  ${linkTag(cssBundle)}
</head>
<body>
  <div id="root">${app}</div>
  ${scriptTag(vendorBundle)}
  ${scriptTag(appBundle, props)}
</body>
</html>`;
