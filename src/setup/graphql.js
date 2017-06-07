'use strict';

const koaRouter = require('koa-router');
import { graphiqlKoa, graphqlKoa } from 'graphql-server-koa';

const schema = require('../graphql');

module.exports = function() {
  const router = new koaRouter();

  router.get('/graphiql', graphiqlKoa({endpointURL: '/graphql'}));

  router.post('/graphql', graphqlKoa(ctx => {
    return {
      schema,
      context: {
      }
    };
  }));

  return router;
};
