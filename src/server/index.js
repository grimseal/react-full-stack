import moduleAlias from 'module-alias';
import path from 'path';

const root = path.resolve(__dirname, '../..');
const src = path.resolve(__dirname, '..');

moduleAlias.addAliases({
  config: path.resolve(root, 'config/config.js'),
  server: path.resolve(src, 'server'),
  client: path.resolve(src, 'client')
});

require('./server');
