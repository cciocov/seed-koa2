'use strict';

import { get, isArray } from 'lodash';
import { checkPermissions } from '_/modules/permissions';

const publicAPI = require('_/config').get('security.publicAPI');

module.exports = function() {
  return async function auth(ctx, next) {
    // set current user ID, if any:
    ctx.state.userId = get(ctx.state, 'jwt.userId', 0);

    const ctrl = ctx.state.controller;
    const actionName = ctx.state.actionName;

    // determine if we need a user for this action:
    if (!ctx.state.userId) {
      if (get(ctrl, `_requireUser[${actionName}]`, get(ctrl, '_requireUser[*]', !publicAPI))) {
        ctx.throw(401);
      }
    }

    // check against auth set at controller level:
    await check(ctx, get(ctrl, '_permissions[*]'));
    
    // check against auth set at action level:
    await check(ctx, get(ctrl, `_permissions[${actionName}]`));

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
    if (isArray(permissions) && permissions.length) {
      if (!checkPermissions(permissions, get(ctx.state, 'jwt.pa'))) {
        ctx.throw(401);
      }
    }
  }
}
