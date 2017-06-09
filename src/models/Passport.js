'use strict';

import { Model } from 'sequelize';
import { Options, Attributes } from 'sequelize-decorators';

module.exports = function(sequelize, DataTypes) {
  @Options({
    sequelize,
    tableName: 'passports'
  })
  @Attributes({
    provider: {
      type: DataTypes.STRING,
      allowNull: false
    },
    identifier: {
      type: DataTypes.STRING,
      allowNull: false
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true
    }
  })
  class Passport extends Model {
  }

  /**
   * Associations
   */
  Passport.associate = function(models) {
    // a passport belongs to a user:
    Passport.belongsTo(models.User);
  };

  return Passport;
};
