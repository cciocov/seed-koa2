'use strict';

const _ = require('lodash');
const { checkPermissions } = require('_/modules/utils/permissions');

module.exports = function(app) {
  return async function auth(ctx, next) {
    // set current user ID, if any:
    ctx.state.userId = _.get(ctx.state, 'jwt.userId', 0);

    // check against auth set at controller level:
    await check(ctx, _.get(ctx.state.controller, '_auth[*]'));
    
    // check against auth set at action level:
    await check(ctx, _.get(ctx.state.controller, `_auth[${ctx.state.actionName}]`));

    await next();
  };
};

// check a set of authentication requirements against current context:
async function check(ctx, permissions) {
  if (permissions) {
    if (!ctx.state.userId) {
      ctx.throw(401);
    }

    // specific permissions required:
    if (_.isArray(permissions) && permissions.length) {
      if (!checkPermissions(permissions, _.get(ctx.state, 'jwt.pa'))) {
        ctx.throw(401);
      }
    }
  }
}
