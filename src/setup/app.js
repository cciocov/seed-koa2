'use strict';

const _ = require('lodash');
const config = require('../../config');
const models = require('../models');
const utils = require('../utils');

module.exports = function setupApp() {
  const app = this;

  app.keys = [config.get('auth.secret')];

  /**
   * Get the current user.
   */
  app.context.getUser = async function() {
    if (this.state.userId) {
      if (this.state.user === undefined) {
        this.state.user = await models.user.findById(this.state.userId);
      }

      return this.state.user;
    }

    return null;
  };

  /**
   * Render a view associated with the current controller/action.
   * Use as: ctx.view([tpl], [data]);
   */
  app.context.view = async function(tpl, data) {
    if (typeof(tpl) == 'object' && !data) {
      data = tpl;
      tpl = undefined;
    }

    if (!tpl) {
      tpl = [
        'controllers',
        this.state.controllerName.replace(/\./g, '/'),
        this.state.actionName
      ].join('/');
    }

    this.body = await utils.render(tpl, _.defaults(data, this.state));
  };
};
