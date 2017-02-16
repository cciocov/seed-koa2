'use strict';

module.exports = function(app) {
  return async function errors(ctx, next) {
    try {
      await next();
    }
    catch (err) {
      ctx.status = err.status || 500;
      ctx.body = Object.assign({
        message: err.message
      }, err);

      app.emit('error', err);
    }
  };
};
