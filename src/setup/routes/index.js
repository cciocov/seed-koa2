'use strict';

const local = require('./local');
const mount = require('./mount');

const authentication = require('_/modules/authentication');

module.exports = function() {
  // load local controllers:
  local();

  // load controllers defined in modules:
  mount(authentication.controller, '/auth');
};
