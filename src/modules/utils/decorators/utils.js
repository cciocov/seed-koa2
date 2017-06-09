'use strict';

export function decorate(fn) {
  return function(target, key, descriptor) {
    fn(target.prototype || target, key, descriptor);
  };
}
