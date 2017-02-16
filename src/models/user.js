'use strict';

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
      profileComplete: function() {
        return !!(
          this.email && this.firstName && this.lastName
        );
      },

      /**
       * Check if this user has the given set of permissions.
       */
      hasPermissions: async function(permissions) {
        return true;
      }
    },

    hooks: {
      beforeCreate: function(user) {
        user.status = user.profileComplete() ? 'active' : 'incomplete';
      }
    }
  });
};
