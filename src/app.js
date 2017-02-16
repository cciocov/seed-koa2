'use strict';

const Koa = require('koa');
const app = new Koa();

require('./setup')(app);

module.exports = app;
