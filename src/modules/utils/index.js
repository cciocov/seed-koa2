'use strict';

const _ = require('lodash');
const consolidate = require('consolidate');
const path = require('path');
const config = require('_/config');

/**
 * Render a template.
 */
module.exports.render = function(tpl, data) {
  let ext = path.extname(tpl).slice(1);
  if (!ext) {
    ext = config.get('views.defaultExt');
    tpl += '.' + ext;
  }

  if (tpl.charAt(0) != '/') {
    tpl = path.resolve(config.get('views.path'), tpl);
  }

  const map = config.has('views.map') ? config.views.map : null;
  const engine = map && map[ext] ? map[ext] : ext;
  const render = consolidate[engine];

  if (!render) {
    return Promise.reject(new Error(`Cannot render .${ext} files.`));
  }

  return render(tpl, _.defaults(data, config.views.options));
};

/**
 * Get base URL, as per configuration.
 */
module.exports.getBaseUrl = function() {
  if (config.has('appUrl') && config.appUrl) {
    return config.appUrl;
  }

  const proto = config.proto || 'http://';
  const host = config.host || 'localhost';
  const port = config.port || 3000;

  return `${proto}${host}${port != 80 ? ':' + port : ''}`;
};

/**
 * Custom errors.
 */
module.exports.error = function(err, status = 500, extra) {
  if (typeof(err) == 'string') {
    err = new Error(err);
  }

  err.status = status;
  err.extra = extra;

  return err;
};

/**
 * Transform from "camelCaseXYZ" to "camel-case-xyz".
 */
module.exports.uncamelize = function(camel, sep = '-') {
  return (
    camel
      .replace(/([A-Z])([a-z])/g, sep + '$1$2')
      .replace(/([a-z])([A-Z])/g, '$1' + sep + '$2')
      .toLowerCase()
  );
};
