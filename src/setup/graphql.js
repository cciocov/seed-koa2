'use strict';

import { graphiqlKoa, graphqlKoa } from 'graphql-server-koa';

const schema = require('../graphql');

module.exports = function(router) {
  router.get('/graphiql', graphiqlKoa({endpointURL: '/graphql'}));

  router.post('/graphql', graphqlKoa(ctx => {
    return {
      schema,
      context: {
      }
    };
  }));
};
