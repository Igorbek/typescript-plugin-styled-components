import * as React from 'React'
import { ThemeProvider } from 'styled-components';
import { StaticRouter } from 'react-router-dom'
import App from '../app/App';
export const AppServer = (url) => (
    <StaticRouter
        location={url}
        context={{}}
    >
        <ThemeProvider theme={{ bgColor: 'red' }}>
            <html>
                <head>
                    <title>Test App</title>
                </head>
                <body>
                    <div id="app"><App /></div>                    
                    <script src="./app.js"></script>
                </body>
            </html>
        </ThemeProvider>
    </StaticRouter>)