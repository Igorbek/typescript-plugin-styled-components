const path = require('path');

const fs = require('fs');
 
const nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function (x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function (mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });
const getTransformer = require('./transformer');


const baseConfig  = {
  mode: 'development',
  devtool: 'eval',
  entry: {
    server: [
      path.resolve(__dirname, '../', 'src/server/index.tsx'),
    ],
  },
  output: {
    path: path.resolve(__dirname, '..', 'dist'),
     publicPath: '/',
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [ {
          loader: 'awesome-typescript-loader',
          options: {
            getCustomTransformers: getTransformer
          },
        }],
      }
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.ts', '.tsx']
  },
  target: "node",
  externals: nodeModules
};

module.exports = baseConfig;

