'use strict';

module.exports = function() {
  return async function notFound(ctx) {
    ctx.status = 404;
    ctx.body = {message: 'Not Found'};
  };
};
