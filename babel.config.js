module.exports =
  process.env.npm_lifecycle_script === process.env.npm_package_scripts_build_client
    ? require('./config/babel/babel.client.config')
    : require('./config/babel/babel.node.config');
