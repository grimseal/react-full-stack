/* eslint-disable import/no-dynamic-require,global-require,no-param-reassign */
import path from 'path';
import fs from 'fs';
import render from 'server/common/render';

const routeDir = path.resolve(__dirname, '../routes');

const routes = {};
fs.readdirSync(routeDir)
  .filter(file => file.match(/.+\.js$/))
  .forEach(file => {
    const module = require(path.resolve(routeDir, file)).default;
    const ext = path.extname(file);
    module.name = path.basename(file, ext);
    routes[module.name] = module;
  });

function notEmpty(object) {
  return object && Object.keys(object).length;
}

function isSet(value) {
  return value || value === null;
}

/**
 * Route view contains form and need to set scrf token
 */
function csrfToken(route, req, res, data) {
  if (route.csrf) {
    if (!data.data) data.data = {};
    data.data.csrfToken = req.session.csrfToken;
  }
}

function html(req, res, route, data) {
  if (!isSet(data.user) && req.user) data.user = req.user.mappingData();
  csrfToken(route, req, res, data);
  data.route = route.name;
  res.send(render(data));
}

Object.defineProperty(routes, 'apply', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: ((routeList, app) => {
    app.use((req, res, next) => {
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      console.log(`${ip} ${req.method} ${req.path}`);

      if (req.method !== 'GET' && req.method !== 'POST') {
        res.header('Allow', 'GET, POST').sendStatus(405);
      } else {
        req.acceptJson = req.accepts(['text/html', 'application/json']) === 'application/json';
        res.data = {};
        next();
      }
    });

    routeList.forEach(route => {
      const appRoute = app.route(route.path);

      if (route.handlers) route.handlers(appRoute);

      // if route not have html view
      appRoute.get((req, res, next) => {
        if (!req.acceptJson && !route.view) res.sendStatus(400);
        else next();
      });

      // render page or send json
      appRoute.all((req, res) => {
        const data = {};
        if (notEmpty(res.data)) data.data = res.data;
        if (isSet(res.user)) data.user = res.user;
        if (req.acceptJson) {
          if (res.redirectUrl) data.redirect = res.redirectUrl;
          if (notEmpty(data)) res.send(data);
          else res.end();
        } else {
          html(req, res, route, data);
        }
      });
    });
  }).bind(null, Object.values(routes))
});

export default routes;
