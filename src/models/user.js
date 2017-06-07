'use strict';

const { createJWT } = require('_/modules/utils');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
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
  }, {
    classMethods: {
      associate: function(models) {
        // a user has many passports:
        models.user.hasMany(models.passport);

        // a user has many tokens:
        models.user.hasMany(models.token);
      }
    },

    instanceMethods: {
      /**
       * Determine if the user profile is complete or not.
       */
      isProfileComplete: function() {
        return !!(
          this.email && this.firstName && this.lastName
        );
      },

      /**
       * Create a JWT for this user.
       */
      createJWT: async function() {
        return createJWT({
          userId: this.id,
          pa: this.permissions
        });
      }
    },

    hooks: {
      beforeCreate: function(user) {
        user.status = user.isProfileComplete() ? 'active' : 'incomplete';
      }
    }
  });
};
