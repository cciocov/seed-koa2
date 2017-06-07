'use strict';

const koaPassport = require('koa-passport');
const config = require('_/config').get('authentication');
const _ = require('lodash');
const { getBaseUrl } = require('_/modules/utils');

// verify callbacks, based on protocol:
const callbacks = {
  oauth2: function(accessToken, refreshToken, profile, done) {
    done(null, {
      token: accessToken,
      profile
    });
  }
};

// configure passport:
_.each(config.providers, (provider, name) => {
  const cfg = _.merge({},
    provider.configKey ? config.providers[provider.configKey] : {},
    provider
  );

  const mod = require(cfg.strategy.module);
  const Strategy = cfg.strategy.path ? _.get(mod, cfg.strategy.path) : mod;

  cfg.callbackURL = `${getBaseUrl()}/auth/${name}/callback`;

  koaPassport.use(new Strategy(cfg, callbacks[cfg.strategy.protocol]));
});

// export configured passport:
module.exports = koaPassport;
