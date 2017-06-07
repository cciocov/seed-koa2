'use strict';

const debug = require('debug')('app:setup:routes:mount');
const koaCompose = require('koa-compose');
const _ = require('lodash');
const config = require('_/config');

const cache = {};

// if overridePath is specified, this will be used as prefix for controller
// actions; if overridePath is not specified but defaultPath is, this will be
// used as prefix unless a prefix is defined at controller level
module.exports = function(ctrlClass, overridePath, defaultPath) {
  const ctrl = new ctrlClass();
  const name = ctrl.constructor.name;
  const path = overridePath || _.get(ctrl, '_config.path', defaultPath) || '/';

  _.each(ctrl._routes, (route) => {
    const routePath = (!route.path.match(/^\//) ? path : '') + '/' + route.path;
    const mw = compose(ctrl, route.method);
    if (mw) {
      debug(route.verb.toUpperCase(), routePath, '->', `${name}.${route.method}`);
      app.router[route.verb.toLowerCase()](routePath, mw);
    }
  });
};

/**
 * Compose all middleware for a route.
 */
function compose(controller, actionName) {
  let mw = [];

  const action = controller[actionName].bind(controller);

  config.middleware.forEach(name => {
    switch (name) {
      case '$routeInfo':
        mw.push(async function handlerInfo(ctx, next) {
          _.extend(ctx.state, {
            actionName,
            controller
          });

          await next();
        });
      break;

      case '$actionMiddleware':
        const middleware = _.get(controller, `_middleware.${actionName}`);
        if (_.isArray(middleware) && middleware.length) {
          mw = mw.concat(load(middleware));
        }
      break;

      case '$action':
        mw.push(action);
      break;

      default:
        mw = mw.concat(load(name));
    }
  });

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

      return cache[mw] || (cache[mw] = require('_/src/middleware/' + mw)());
    });
  }
}
