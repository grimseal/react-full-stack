/* eslint-disable import/no-extraneous-dependencies */
import fs from 'fs';
import config from 'config';
import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import yaml from 'js-yaml';

function buildJson() {
  const openapi = fs.readFileSync(path.resolve(config.root, 'src/server/openapi.yaml'), 'utf8');
  const conf = yaml.safeLoad(openapi);
  const swaggerSpec = swaggerJSDoc({
    swaggerDefinition: {
      components: {}
    },
    apis: [
      path.resolve(config.root, 'src/server/models/*.js'),
      path.resolve(config.root, 'src/server/routes/*.js')
    ]
  });
  const json = {
    ...swaggerSpec,
    ...conf,
    components: { ...swaggerSpec.components, ...conf.components }
  };
  delete json.swagger;
  return json;
}

const redocPath = path.resolve(config.root, 'node_modules/redoc/bundles/redoc.standalone.js');
const redocScript = fs.readFileSync(redocPath, 'utf-8').toString();

const html = `<!DOCTYPE html>
<html>
  <head>
    <title>Docs</title>
    <!-- needed for adaptive design -->
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />    
    <!-- ReDoc doesn't change outer page styles -->
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <!-- we provide is specification here -->
    <redoc spec-url='/api.json' expand-responses="all"></redoc>
    <script src="/redoc.standalone.js"></script>
  </body>
</html>`;

export default (req, res, next) => {
  if (req.path === '/api.json') {
    res.setHeader('Content-Type', 'application/json; charset=utf8');
    res.send(buildJson());
    return;
  }

  if (req.path === '/redoc.standalone.js') {
    res.setHeader('Content-Type', 'text/javascript; charset=utf8');
    res.send(redocScript);
  }

  if (req.path === '/docs') {
    res.setHeader('Content-Type', 'text/html; charset=utf8');
    res.send(html);
    return;
  }

  next();
};
