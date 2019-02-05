const express = require('express');
const proxy = require('http-proxy-middleware');
const app = express();
const PORT = process.env.PORT || 8080;
const INDEX_FILE = process.env.INDEX_FILE || 'index.html';
const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.API_PORT || 3000;

app.use(proxy('/api', { target: 'http://localhost:3000', pathRewrite: { '^/api': '/' } }));

app.get('/*', (req, res) => {
  const options = {
    root: __dirname + '/src',
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };

  res.sendFile(req.originalUrl, options, (err) => {
    if (err) {
      res.status(404).send('404 Not found');
    }
  });
});

app.get('/', (req, res) => {
  res.redirect(INDEX_FILE);
});

app.listen(PORT);
console.log(`Front-end web server started at port ${PORT}.`);
