'use strict';

const koaPassport = require('koa-passport');
const moment = require('moment');
const config = require('../../config');
const models = require('../models');
const utils = require('../utils');

// define all strategies used for user authentication:
const strategies = {
  facebook: {
    Strategy: require('passport-facebook').Strategy,
    protocol: 'oauth2'
  },
  'facebook-token': {
    Strategy: require('passport-facebook-token'),
    configKey: 'facebook',
    protocol: 'oauth2'
  },
  google: {
    Strategy: require('passport-google-oauth20').Strategy,
    protocol: 'oauth2'
  },
  'google-token': {
    Strategy: require('passport-google-token').Strategy,
    configKey: 'google',
    protocol: 'oauth2'
  }
};

// data normalization: given data received from PassportJS upon successful
// authentication, output the data we need for the passport and user records.
function normalize(data) {
  const result = {
    passport: {
      provider: data.profile.provider,
      identifier: data.profile.id,
      token: data.token
    },
    user: {
      firstName: data.profile.name.givenName,
      lastName: data.profile.name.familyName
    }
  };

  if (data.profile.emails && data.profile.emails[0]) {
    result.passport.email = result.user.email = data.profile.emails[0].value;
  }

  if (data.profile.photos && data.profile.photos[0]) {
    let url = data.profile.photos[0].value;

    // don't store photo if it's just a placeholder:
    switch (data.profile.provider) {
      case 'facebook':
        if (data.profile._json.picture.data.is_silhouette) {
          url = null;
        }
      break;

      case 'google':
        if (data.profile._json.image && data.profile._json.image.isDefault) {
          url = null;
        }
      break;
    }

    if (url) {
      result.passport.photo = result.user.photo = url;
    }
  }

  return result;
}

// verify callbacks, based on protocol:
const callbacks = {
  oauth2: function(accessToken, refreshToken, profile, done) {
    done(null, {
      token: accessToken,
      profile
    });
  }
};

// default options for passport strategies, based on protocol:
const defaults = {
  oauth2: {
  }
};

// configure passport:
Object.keys(strategies).forEach(name => {
  const strategy = strategies[name];
  const configKey = strategy.configKey || name;
  const options = Object.assign({
    callbackURL: `${utils.getBaseUrl()}/auth/${name}/callback`
  }, defaults[strategy.protocol], config.get(`auth.${configKey}`));

  koaPassport.use(new strategy.Strategy(options, callbacks[strategy.protocol]));
});

export const _routes = [
  'ALL      ~/register              register',
  'ALL      ~/login                 login',
  'ALL      ~/logout                logout',
  'ALL      ~/:provider             initiateProviderAuth',
  'ALL      ~/:provider/:method     completeProviderAuth'
];

export const _config = {
  '*': {
    requireUser: false
  },
  initiateProviderAuth: {
    middleware: [
      koaPassport.initialize()
    ]
  },
  completeProviderAuth: {
    middleware: [
      koaPassport.initialize()
    ]
  }
};

/**
 * Initiate 3rd party authentication process.
 */
export function initiateProviderAuth(ctx, next) {
  const provider = ctx.params.provider;

  return koaPassport.authenticate(provider)(ctx, next);
}

/**
 * Complete 3rd party authentication process.
 */
export function completeProviderAuth(ctx, next) {
  const provider = ctx.params.provider;
  const method = ctx.params.method;
  const strategy = provider + (method == 'token' ? '-token' : '');

  const options = {
    session: false
  };

  return koaPassport.authenticate(strategy, options, async function(err, userData, info) {
    if (err) {
      ctx.throw(err.message);
    }

    if (!userData) {
      ctx.throw(401);
    }

    const data = normalize(userData);

    let passport = await models.passport.find({
      where: {
        provider,
        identifier: data.passport.identifier
      },
      include: [
        models.user
      ]
    });

    if (passport) {
      // this is a user login, just update passport and user data

      await passport.update(data.passport);
    }
    else {
      if (ctx.state.userId) {
        // this is an existing user adding a new passport

        const user = await ctx.getUser();
        passport = await user.createPassport(data.passport);
        passport.user = user;
      }
      else {
        // this is a new user registration

        const payload = Object.assign({}, data.passport, {
          user: data.user
        });

        // if we have an e-mail address, we assume it's already verified as it's
        // coming from a trusted 3rd party provider:
        if (payload.user.email) {
          payload.user.emailVerified = true;
        }

        passport = await models.passport.create(payload, {
          include: [
            models.user
          ]
        });
      }
    }

    createJWT.call(ctx, passport.user);
  })(ctx, next);
}

/**
 * Login a user via username/e-mail & password (local authentication).
 */
export function login(ctx) {
  if (ctx.method != 'POST') {
    ctx.throw(405);
  }
}

/**
 * Logout a user. Clears the JWT cookie.
 */
export function logout(ctx) {
  ctx.cookies.set('jwt', null);

  ctx.body = {
  };
}

/**
 * Register a user.
 */
export function register(ctx) {
  if (ctx.method != 'POST') {
    ctx.throw(405);
  }
}


/**
 * Create a JWT with a user's ID, set it in a cookie and the response to the
 * client.
 */
function createJWT(user) {
  const ctx = this;
  const jwt = utils.createJWT({userId: user.id});

  ctx.cookies.set('jwt', jwt, {
    expires: moment().add(config.get('auth.tokenTTL'), 'seconds').toDate(),
    signed: true
  });

  ctx.body = {
    jwt
  };
}
