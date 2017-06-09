'use strict';

import { createJWT } from './utils';

const passport = require('./passport');
const moment = require('moment');
const models = require('_/models');
const { getBaseUrl } = require('_/modules/utils');
const { controller, route, middleware, requireUser } = require('_/modules/utils/decorators');

const tokenTTL = require('_/config').get('security.tokenTTL');

@controller({
  path: '/auth'
})
export default class AuthController {
  /**
   * Register a user.
   */
  @route('ALL')
  register(ctx) {
    if (ctx.method != 'POST') {
      ctx.throw(405);
    }
  }

  /**
   * Login a user via username/e-mail & password (local authentication).
   */
  @route('ALL')
  login(ctx) {
    if (ctx.method != 'POST') {
      ctx.throw(405);
    }
  }
  
  /**
   * Logout a user. Clears the JWT cookie.
   */
  @requireUser()
  @route('GET')
  logout(ctx) {
    ctx.cookies.set('jwt', null);
  
    ctx.body = {
    };
  }
  
  /**
   * Initiate 3rd party authentication process.
   */
  @route('GET', ':provider');
  @middleware([
    passport.initialize()
  ])
  initiateProviderAuth(ctx, next) {
    return koaPassport.authenticate(ctx.params.provider)(ctx, next);
  }

  /**
   * Complete 3rd party authentication process.
   */
  @route('GET', ':provider/:method');
  @middleware([
    passport.initialize()
  ])
  completeProviderAuth(ctx, next) {
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
  
      const data = this.normalize(userData);
  
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
  
      this.sendJWT(passport.user, ctx);
    })(ctx, next);
  }

  // data normalization: given data received from PassportJS upon successful
  // authentication, output the data we need for the passport and user records.
  normalize(data) {
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

  // send a user's JWT back to the client:
  sendJWT(user, ctx) {
    const payload = {
      userId: user.id
    };

    if (user.permissions) {
      payload.pa = user.permissions;
    }

    const jwt = createJWT(payload);
  
    ctx.cookies.set('jwt', jwt, {
      expires: moment().add(tokenTTL, 'seconds').toDate(),
      signed: true
    });
  
    ctx.body = {
      jwt
    };
  }
}
