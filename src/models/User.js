'use strict';

import { Model } from 'sequelize';
import { Options, Attributes } from 'sequelize-decorators';

const { createJWT } = require('_/modules/utils');

module.exports = function(sequelize, DataTypes) {
  @Options({
    sequelize,
    tableName: 'users'
  })
  @Attributes({
    username: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'unknown'
    },
    permissions: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '[]',
      set: function(value) {
        this.setDataValue('permissions', JSON.stringify(value));
      },
      get: function() {
        return JSON.parse(this.getDataValue('permissions'));
      }
    }
  })
  class User extends Model {
    /**
     * Determine if the user profile is complete or not.
     */
    isProfileComplete() {
      return !!(
        this.email && this.firstName && this.lastName
      );
    }
  }

  /**
   * Associations
   */
  User.associate = function(models) {
    // a user has many passports:
    User.hasMany(models.Passport);

    // a user has many tokens:
    User.hasMany(models.Token);
  };

  /**
   * Hooks
   */

  // set user status according to profile information being complete or not:
  User.beforeCreate((user) => {
    user.status = user.isProfileComplete() ? 'active' : 'incomplete';
  });

  return User;
};
