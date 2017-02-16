'use strict';

const Kind = require('graphql').Kind;

module.exports.typeDefs = [
  `
  # A string representing a date and time in ISO 8601 format, such as "YYYY-MM-DDTHH:mm:ss.sssZ".
  scalar DateTime
  `
];

module.exports.resolvers = Object.assign({},
  {
    DateTime: {
      __parseValue(value) {
        return value;
      },

      __parseLiteral(ast) {
        if (ast.kind == Kind.STRING) {
          return new Date(ast.value);
        }
        return null;
      },

      __serialize(date) {
        return date.toISOString();
      }
    }
  }
);
