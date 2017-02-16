'use strict';

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('passport', {
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
  }, {
    classMethods: {
      associate: function(models) {
        // a passport belongs to a user:
        models.passport.belongsTo(models.user);
      }
    }
  });
};
