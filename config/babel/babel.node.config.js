module.exports = {
  presets: [['@babel/preset-env', { targets: { node: true } }], '@babel/preset-react'],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    [
      './util/babel-plugin/transform-assets-import-to-string/index.js',
      {
        baseUri: '/assets',
        hash: 'md5',
        extensions: ['.gif', '.jpeg', '.jpg', '.png', '.svg', '.css', '.scss']
      }
    ]
  ]
};
