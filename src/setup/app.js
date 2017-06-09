'use strict';

const _ = require('lodash');
const config = require('_/config');
const models = require('_/models');
const { render } = require('_/modules/utils');

module.exports = function setupApp() {
  app.keys = [config.get('security.secret')];

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

    this.body = await render(tpl, _.defaults(data, this.state));
  };
};
