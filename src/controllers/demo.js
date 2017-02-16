'use strict';

/**
 * This is a demo controller to showcase a few features. You'll want to disable
 * it by either deleting this file or renaming it to "_demo.js".
 */

export const _config = {
  '*': {
    requireUser: false
  },

  secure: {
    requireUser: true
  }
};

export async function index(ctx) {
  await ctx.view();
}

export function state(ctx) {
  ctx.body = ctx.state;
}

export async function secure(ctx) {
  const user = await ctx.getUser();
  ctx.body = `Nice, you are logged in! Hello ${user.firstName}!`;
}
