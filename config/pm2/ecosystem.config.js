module.exports = {
  apps: [
    {
      name: 'web-server',
      script: 'lib/server/index.js',
      args: '',
      exec_mode: 'cluster',
      instances: 2,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS',
      source_map_support: false,
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
