const config = 'config/webpack/webpack.dev.config.js';
const mode = 'development';
const devtool = 'inline-source-map';

module.exports = {
  apps: [
    {
      name: 'webpack',
      script: 'node_modules/webpack-dev-server/bin/webpack-dev-server.js',
      args: `--config ${config} --mode ${mode} --devtool ${devtool}`,
      autorestart: false,
      watch: false,
      max_memory_restart: '1G',
      source_map_support: true,
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'dev-web',
      script: 'src/server/index.es6.js',
      args: '',
      exec_mode: 'cluster',
      instances: 2,
      autorestart: true,
      watch: ['src/server'],
      ignore_watch: ['node_modules', 'src/client'],
      max_memory_restart: '1G',
      source_map_support: true,
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};
