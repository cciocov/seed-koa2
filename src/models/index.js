'use strict';

const fs = require('fs');
const Sequelize = require('sequelize');

const config = require('../../config');

const sequelize = new Sequelize(config.get('database.url'), {
  logging: config.get('database.logging') ? console.log : false
});

fs
  .readdirSync(__dirname)
  .filter((file) => file != 'index.js' && file.match(/.+\.js$/))
  .forEach((file) => sequelize.import(`${__dirname}/${file}`));

Object.keys(sequelize.models).forEach(modelName => {
  if ('associate' in sequelize.models[modelName]) {
    sequelize.models[modelName].associate(sequelize.models);
  }
});

module.exports = sequelize.models;
