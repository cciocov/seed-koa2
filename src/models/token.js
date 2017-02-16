'use strict';

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('token', {
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
  }, {
    classMethods: {
      associate: function(models) {
        // a token belongs to a user:
        models.token.belongsTo(models.user);
      }
    }
  });
};
