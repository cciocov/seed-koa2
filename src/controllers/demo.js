'use strict';

const { controller, route, auth } = require('_/modules/utils/decorators');

/**
 * This is a demo controller to showcase a few features. You'll want to disable
 * it by either deleting this file or renaming it to "_demo.js".
 */

@controller()
@auth(['admin'])
export default class DemoController {
  @route('GET')
  async index(ctx) {
    ctx.body = 'Demo route.';
  }
}
