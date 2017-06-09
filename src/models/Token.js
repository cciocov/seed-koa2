'use strict';

import { Model } from 'sequelize';
import { Options, Attributes } from 'sequelize-decorators';

module.exports = function(sequelize, DataTypes) {
  @Options({
    sequelize,
    tableName: 'tokens'
  })
  @Attributes({
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    scope: {
      type: DataTypes.STRING,
      allowNull: false
    }
  })
  class Token extends Model {
  }

  /**
   * Associations
   */
  Token.associate = function(models) {
    // a token belongs to a user:
    Token.belongsTo(models.User);
  };

  return Token;
};
