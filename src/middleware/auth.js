'use strict';

module.exports = function(app) {
  return async function auth(ctx, next) {
    // set current user ID, if any:
    ctx.state.userId = ctx.state.jwt ? ctx.state.jwt.userId : 0;

    // check if current controller/action require a user and/or a set of
    // permissions:
    let requireUser = ctx.state._config.requireUser;

    // by default, all resources are protected:
    if (requireUser === undefined) {
      requireUser = true;
    }

    if (requireUser) {
      if (!ctx.state.userId) {
        ctx.throw(401);
      }

      // in case specific permissions are required:
      if (requireUser !== true) {
        const user = await ctx.getUser();

        if (!(await user.hasPermissions(requireUser))) {
          ctx.throw(401);
        }
      }
    }

    await next();
  };
};
