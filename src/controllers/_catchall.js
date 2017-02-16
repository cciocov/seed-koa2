'use strict';

/**
 * This is a special controller used to catch all unhandled GET requests, so as
 * to provide deep-linking support for a single-page client app.
 */

const config = require('../../config');

export const _config = {
  '*': {
    requireUser: false
  }
};

// list of paths to ignore (strings or regexps):
const ignoredPaths = [
  /^\/auth\//,
  '/graphql',
  /^\/api\//
];

export async function index(ctx, next) {
  if (ctx.method != 'GET' || shouldIgnorePath(ctx.request.path)) {
    return await next();
  }

  await ctx.view(config.get('public.path') + '/index.html');
}


// determine if given path should be ignored:
function shouldIgnorePath(p) {
  for (let i = 0; i < ignoredPaths.length; i++) {
    let pattern = ignoredPaths[i];
    
    if (typeof(pattern) == 'string') {
      if (p == pattern) {
        return true;
      }
    }
    else {
      if (pattern.test(p)) {
        return true;
      }
    }
  }

  return false;
}
