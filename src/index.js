'use strict';

require('babel-polyfill');
require('babel-register')({
  presets: ['latest'],
  plugins: ['transform-async-to-generator']
});

require('dotenv').config();

const app = require('./app');

const config = require('../config');
const host = config.host || 'localhost';
const port = config.port || 3000;

app.listen(port, host, function() {
  console.log('Listening on http://%s:%s', host, port);
});
