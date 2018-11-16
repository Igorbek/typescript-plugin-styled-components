import * as path from 'path';

import * as webpack from 'webpack';

import * as getTransformer from './transformer';

const baseConfig : webpack.Configuration = {
  mode: 'development',
  devtool: 'eval',
  entry: {
    app: [path.resolve('src/AppClient.tsx')],
  },
  output: {
    path: path.resolve('dist'),
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
};

export default baseConfig;

