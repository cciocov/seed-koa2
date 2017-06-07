'use strict';

const koaBodyParser = require('koa-bodyparser');
const koaCompress = require('koa-compress'); 
const koaCors = require('kcors');
const koaFavicon = require('koa-favicon');
const koaJWT = require('koa-jwt');
const koaMorgan = require('koa-morgan');
const koaResponseTime = require('koa-response-time');
const koaRouter = require('koa-router');
const koaStatic = require('koa-static');
const path = require('path');

const config = require('_/config');
const errors = require('../middleware/errors');
const notFound = require('../middleware/notFound');

const setupApp = require('./app');
const setupGraphQL = require('./graphql');
const setupRoutes = require('./routes');

module.exports = function() {
  app
    .use(koaResponseTime())
    .use(koaMorgan('combined'))
    .use(koaCompress())
    .use(koaCors())
    .use(koaFavicon(path.resolve(config.get('public.path'), 'img/favicon.ico')))
    .use(koaStatic(config.get('public.path'), {
      maxage: config.get('public.maxage')
    }))
    .use(koaBodyParser())
    .use(errors(app))
    .use(koaJWT({
      secret: config.get('authentication.secret'),
      passthrough: true,
      key: 'jwt',
      cookie: 'jwt'
    }));

  setupApp();

  // application router:
  const router = app.router = new koaRouter();

  setupGraphQL();
  setupRoutes();

  app.use(router.routes());
  app.use(router.allowedMethods({throw: true}));

  app.use(notFound());
};
