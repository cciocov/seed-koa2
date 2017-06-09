'use strict';

import { decorate } from '_/modules/utils/decorators/utils';
import { set } from 'lodash';

/**
 * @requirePermissions
 */
export function requirePermissions(...names) {
  return decorate((target, key, descriptor) => {
    if (names.length) {
      set(target, `_permissions[${key || '*'}]`, names);
    }
  });
}
