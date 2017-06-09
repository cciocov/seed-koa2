'use strict';

const jwt = require('jsonwebtoken');
const config = require('_/config');

/**
 * Create a JWT.
 */
export function createJWT(payload, options) {
  return jwt.sign(payload, config.get('security.secret'), Object.assign({
    expiresIn: config.get('security.tokenTTL')
  }, options));
};
