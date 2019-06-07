import path from 'path';
import fs from 'fs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from 'client/App';

import template from './template';

const dev = process.env.NODE_ENV === 'development';

function getRequireCache(name, list = []) {
  if (name.includes('node_modules') || (name.includes('server') && !name.includes('route'))) {
    return list;
  }
  list.push(name);
  Object.keys(require.cache).forEach(key => {
    if (require.cache[key].parent && require.cache[key].parent.id === name)
      getRequireCache(key, list);
  });
  return list;
}

const routeDir = path.resolve(__dirname, '../routes');
const routes = [];
fs.readdirSync(routeDir)
  .filter(file => file.match(/.+\.js$/))
  .forEach(file => {
    routes.push(path.resolve(routeDir, file));
  });

function AppNonCache() {
  const app = 'client/App';
  const cache = [
    ...getRequireCache(require.resolve(app)),
    ...getRequireCache(require.resolve('./routes')),
    ...routes.reduce((all, route) => [...all, ...getRequireCache(require.resolve(route))], [])
  ];
  cache.forEach(module => delete require.cache[module]);
  // eslint-disable-next-line import/no-dynamic-require,global-require
  return require(app).default;
}

function getApp() {
  return dev ? AppNonCache() : App;
}

const { log } = console;
const logMock = () => {};
export default function render(props) {
  const app = getApp();
  //console.log = logMock;
  const h = template(renderToString(React.createElement(app, props)), props);
  //console.log = log;
  return h;
}
