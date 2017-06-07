'use strict';

const mount = require('./mount');
const path = require('path');
const _ = require('lodash');

// load all local controllers:
const ctrls = require('require-all')({
  dirname: path.resolve(__dirname, '../../controllers'),
  resolve: function(module) {
    return (module.default ? module.default : module);
  }
});

module.exports = function() {
  (function addRoutes(obj, prefix = '') {
    _.each(obj, (value, key) => {
      if (key.match(/^_/)) {
        return;
      }

      const newPrefix = `${prefix}/${key}`;

      if (typeof(value) == 'function') {
        const defaultPath = newPrefix.split('.').filter(p => p != 'index').join('/');
        mount(value, null, defaultPath);
      }
      else {
        addRoutes(value, newPrefix);
      }
    });
  })(ctrls);
};
