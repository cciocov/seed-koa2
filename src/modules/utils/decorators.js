'use strict';

const { uncamelize } = require('./');
const _ = require('lodash');

function decorate(fn) {
  return function(target, key, descriptor) {
    fn(target.prototype || target, key, descriptor);
  };
}

/**
 * @controller
 */
export function controller(config) {
  return decorate((target, key, descriptor) => {
    target._config = Object.assign({}, config);
  });
}

/**
 * @route
 */
export function route(verbs, path) {
  return decorate((target, key, descriptor) => {
    const _routes = target._routes || (target._routes = []);
    if (!path) {
      path = (key != 'index' ? uncamelize(key) : '');
    }

    verbs.split(/\s+/).forEach((verb) => {
      if (verb) {
        _routes.push({verb, path, method: key});
      }
    });
  });
}

/**
 * @middleware
 */
export function middleware(mws) {
  return decorate((target, key, descriptor) => {
    _.set(target, `_middleware[${key || '*'}]`, mws);
  });
}

/**
 * @auth
 */
export function auth(roles) {
  return decorate((target, key, descriptor) => {
    _.set(target, `_auth[${key || '*'}]`, roles);
  });
}
