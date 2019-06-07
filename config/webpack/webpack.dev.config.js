/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin');
const config = require('../config');
const babelOptions = require('../babel/babel.client.config');

const root = path.join(__dirname, '../..');
const clientDirectory = path.join(root, 'src/client');
const serverDirectory = path.join(root, 'src/server');
const loader = path.join(root, 'util/webpack-loader');

const babelLoader = {
  loader: 'babel-loader',
  options: babelOptions
};

module.exports = {
  entry: [
    '@babel/polyfill',
    './src/client/index.jsx',
    './config/webpack/react-hot-loader.config.js'
  ],
  stats: {
    entrypoints: false,
    children: false
  },
  output: {
    path: config.dist,
    publicPath: '/',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [babelLoader, 'react-hot-loader/webpack']
      },
      {
        test: /routes\.js$/,
        exclude: /node_modules/,
        use: [path.join(loader, 'routes-loader.js')]
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { hmr: true }
          },
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000'
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
    alias: {
      'react-dom': '@hot-loader/react-dom',
      client: clientDirectory,
      server: serverDirectory
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.NamedModulesPlugin(),
    new MiniCssExtractPlugin({ filename: 'bundle.css' }),
    new ErrorOverlayPlugin()
  ],
  devtool: 'cheap-module-source-map', // 'eval' is not supported by error-overlay-webpack-plugin
  devServer: {
    port: 3000,
    proxy: {
      '**': `http://localhost:${config.port}`
    },
    hotOnly: true,
    open: false,
    overlay: false,
    serveIndex: false,
    publicPath: '/',
    stats: 'minimal'
  }
};
