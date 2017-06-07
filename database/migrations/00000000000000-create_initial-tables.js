'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.resolve()
      .then(function() {
        return queryInterface.createTable('users', {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
          },
          username: {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true
          },
          email: {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true
          },
          emailVerified: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
          },
          firstName: {
            type: Sequelize.STRING,
            allowNull: true
          },
          lastName: {
            type: Sequelize.STRING,
            allowNull: true
          },
          photo: {
            type: Sequelize.STRING,
            allowNull: true
          },
          status: {
            type: Sequelize.STRING,
            allowNull: false
          },
          permissions: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: '[]'
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false
          }
        });
      })
      .then(function() {
        return queryInterface.createTable('passports', {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
          },
          userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
          },
          provider: {
            type: Sequelize.STRING,
            allowNull: false
          },
          identifier: {
            type: Sequelize.STRING,
            allowNull: false
          },
          token: {
            type: Sequelize.STRING,
            allowNull: false
          },
          email: {
            type: Sequelize.STRING,
            allowNull: true
          },
          photo: {
            type: Sequelize.STRING,
            allowNull: true
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false
          }
        });
      })
      .then(function() {
        return queryInterface.addIndex('passports', ['provider', 'identifier'], {
          indicesType: 'UNIQUE'
        });
      })
      .then(function() {
        return queryInterface.createTable('tokens', {
          id: {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true
          },
          userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
          },
          scope: {
            type: Sequelize.STRING,
            allowNull: false
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false
          }
        });
      });
  },

  down: function (queryInterface, Sequelize) {
    return Promise.resolve()
      .then(function() {
        return queryInterface.dropTable('tokens');
      })
      .then(function() {
        return queryInterface.dropTable('passports');
      })
      .then(function() {
        return queryInterface.dropTable('users');
      });
  }
};
