'use strict';

const debug = require('debug')('app:setup:routes');
const koaCompose = require('koa-compose');
const path = require('path');
const _ = require('lodash');
const config = require('../../config');
const utils = require('../utils');

const cache = {};

// load all controllers:
const ctrls = require('require-all')(path.resolve(__dirname, '../controllers'));

module.exports = function(router) {
  const app = this;
  const routes = [];

  (function addRoutes(obj, prefix = '') {
    // add the routes defined in controller's _routes array:
    const seenActions = [];
    obj._routes && obj._routes.forEach(route => {
      route = route.replace('~', '/' + prefix.replace('.', '/'));
      route = route.trim().split(/\s+/);

      seenActions.push(route[route.length - 1]);

      route[route.length - 1] = prefix + '.' + route[route.length - 1];

      routes.push(route.join(' '));
    });

    // add routes for all other exported controller functions:
    Object.keys(obj).forEach(key => {
      if (_.isPlainObject(obj[key]) && !key.match(/^_/)) {
        addRoutes(obj[key], prefix + (prefix ? '.' : '') + key);
      }
      else if (_.isFunction(obj[key]) && _.indexOf(seenActions, key) == -1) {
        const handler = prefix + '.' + key;
        const path = prefix.split('.').filter(p => p != 'index');

        if (key != 'index') {
          path.push(utils.uncamelize(key));
        }

        routes.push([
          'ALL', '/' + path.join('/').toLowerCase(), handler
        ].join(' '));
      }
    });
  })(ctrls);

  routes.forEach(route => {
    route = route.trim().split(/\s+/);

    const verb = route.length == 3 ? route[0].toLowerCase() : 'all';
    const path = route.length == 3 ? route[1] : route[0];
    const handler = route[route.length - 1];

    const mw = compose.call(app, handler);

    if (mw) {
      debug(verb.toUpperCase(), path, '->', handler);
      router[verb](path, mw);
    }
  });
};

// export our compose function as well:
module.exports.compose = compose;


function compose(handler) {
  const app = this;
  let mw = [];

  if (handler.match(/^view:/)) {
    // handler is a simple view:

    mw.push(async function(ctx) {
      await ctx.render(handler.substr(5));
    });
  }
  else {
    // handler is a controller/action:

    // break handler into controller and action:
    const matches = handler.match(/^(.*)\.(.*)$/);

    const controllerName = matches[1];
    const actionName = matches[2];
    const controller = _.at(ctrls, controllerName)[0];
    const action = controller[actionName];
    let _config = controller._config || {};

    // merge global controller config with action specific config:
    _config = _.extend({}, _config['*'], _config[actionName]);

    config.middleware.forEach(name => {
      switch (name) {
        case '$handlerInfo':
          mw.push(async function handlerInfo(ctx, next) {
            _.extend(ctx.state, {
              controllerName,
              actionName,
              _config
            });

            await next();
          });
        break;

        case '$handlerMiddleware':
          if (_.isArray(_config.middleware) && _config.middleware.length) {
            mw = mw.concat(load(_config.middleware));
          }
        break;

        case '$handler':
          mw.push(action);
        break;

        default:
          mw = mw.concat(load(name));
      }
    });
  }

  return koaCompose(mw);


  // load middleware:
  function load(mw) {
    if (!_.isArray(mw)) {
      mw = [mw];
    }

    return _.map(mw, mw => {
      if (typeof(mw) == 'function') {
        return mw;
      }

      return cache[mw] || (cache[mw] = require('../middleware/' + mw)(app));
    });
  }
}
