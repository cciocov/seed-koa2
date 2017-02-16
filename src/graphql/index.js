'use strict';

const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;

const common = require('./common');
const query = require('./query');

const typeDefs = [
  `
  schema {
    query: Query
  }
  `,
  ...common.typeDefs,
  ...query.typeDefs
];

const resolvers = Object.assign({},
  common.resolvers,
  query.resolvers
);

module.exports = makeExecutableSchema({
  typeDefs,
  resolvers
});
