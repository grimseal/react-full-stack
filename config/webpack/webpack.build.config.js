/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
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
  entry: ['@babel/polyfill', './src/client/index.jsx'],
  stats: {
    entrypoints: false,
    children: false
  },
  output: {
    path: config.dist,
    publicPath: '/',
    filename: 'app.[contenthash].js',
    chunkFilename: 'vendor.[contenthash].js'
  },
  module: {
    rules: [
      {
        test: /App\.jsx$/,
        exclude: /node_modules/,
        use: [babelLoader, path.join(loader, 'app-loader.js')]
      },
      {
        test: /routes\.js$/,
        exclude: /node_modules/,
        use: [babelLoader, path.join(loader, 'routes-loader.js')]
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [babelLoader]
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { hmr: false }
          },
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'file-loader',
        options: {
          outputPath: 'assets',
          name: '[name].[contenthash].[ext]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
    alias: {
      client: clientDirectory,
      server: serverDirectory
    }
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          toplevel: true,
          mangle: true
        }
      })
    ],
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'initial'
        }
      }
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.NamedModulesPlugin(),
    new MiniCssExtractPlugin({ filename: 'style.[contenthash].css' })
  ]
};
