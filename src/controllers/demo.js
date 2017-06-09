'use strict';

import { route, requireUser } from '_/modules/utils/decorators';

/**
 * This is a demo controller to showcase a few features. You'll want to disable
 * it by either deleting this file or renaming it to "_demo.js".
 */

@requireUser(false)
export default class DemoController {
  @route('GET')
  async index(ctx) {
    ctx.body = 'Demo route.';
  }
}
