'use strict';

module.exports.typeDefs = [
  `
  type Query {
    serverDateTime: DateTime
  }
  `
];

module.exports.resolvers = Object.assign({},
  {
    Query: {
      serverDateTime(root, args, context, info) {
        return new Date();
      }
    }
  }
);
