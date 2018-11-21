import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './app/App';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter } from 'react-router-dom'

const app = document.getElementById('app');

ReactDOM.hydrate(

<ThemeProvider theme={{bgColor: 'red'}}>
 <BrowserRouter>
    <App />
  </BrowserRouter>
</ThemeProvider>, app);

