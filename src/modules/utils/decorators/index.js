'use strict';

import { decorate } from './utils';
import { uncamelize } from '../';
import { set } from 'lodash';

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
    set(target, `_middleware[${key || '*'}]`, mws);
  });
}

/**
 * @requireUser
 */
export function requireUser(sw = true) {
  return decorate((target, key, descriptor) => {
    set(target, `_requireUser[${key || '*'}]`, sw);
  });
}
