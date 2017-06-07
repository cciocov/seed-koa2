'use strict';

require('babel-polyfill');
require('babel-register')({
  presets: ['latest'],
  plugins: ['transform-async-to-generator', 'transform-decorators-legacy']
});

require('dotenv').config();

const Koa = require('koa');
const app = global.app = new Koa();

require('./setup')();

const config = require('../config');
const host = config.get('host');
const port = config.get('port');

app.listen(port, host, function() {
  console.log('Listening on http://%s:%s', host, port);
});
