import * as React from 'react';
import * as express from 'express';
export const port = process.env.PORT || 3000;
import { ServerStyleSheet } from 'styled-components';
import {  renderToNodeStream } from 'react-dom/server';
import * as webpack from 'webpack';
const webpackDevMiddleware = require('webpack-dev-middleware');
import config from '../../webpack/config';
import {AppServer} from './AppServer';


const app = express();

  const compiler = webpack(config);

  app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
    historyApiFallback: true,
    hot: true,
    noInfo: true,
    stats: { colors: true },
  }));

  app.get('/', (req, res) => {
    res.contentType('text/html');
    res.write('<!DOCTYPE html>');
    const sheet = new ServerStyleSheet();
    const jsx = sheet.collectStyles(<AppServer url={req.url}/>)
    const stream = sheet.interleaveWithNodeStream(renderToNodeStream(jsx))
    stream.pipe(
      res,
      { end: false }
    )
    
  });



app.listen(port, () => {
  console.log(`[${process.env.NODE_ENV}] server running on http://localhost:${port}/`);
});
