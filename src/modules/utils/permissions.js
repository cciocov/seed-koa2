'use strict';

/**
 * System permissions are defined in configuration and are encoded throughout
 * the app as an array of 32-bit integers where each bit corresponds to a
 * permission ID (i.e.: IDs 0..31 are encoded in element 0 of the array,
 * IDs 32..63 are encoded in element 1 of the array, and so on...).
 */

const permissions = require('_/config').permissions;

// create a permissions map:
const map = {};
for (let i = 1; i <= permissions.length - 1; i++) {
  if (map[permissions[i].name]) {
    throw new Error('duplicate permission name found.');
  }
  
  permissions[i].id = i - 1;
  map[permissions[i].name] = permissions[i];
}


/**
 * Toggle a permission (by name) into a new or existing permission array.
 */
export function togglePermission(name, enabled, pa = []) {
  if (!map[name]) {
    throw new Error(`unknown permission '${name}'`);
  }

  // determine the index in the permissions array for this permission, based on
  // its ID:
  const idx = index(name);

  // extend the permissions array, if necessary:
  if (idx >= pa.length) {
    for (let i = pa.length; i <= idx; i++) {
      pa[i] = 0;
    }
  }

  // toggle the permission:
  const m = mask(name);
  pa[idx] = enabled ? pa[idx] | m : pa[idx] & ~m;

  return pa;
}

/**
 * Enable all given permission names.
 */
export function enablePermissions(names, pa = []) {
  names.forEach((name) => togglePermission(name, true, pa));
  return pa;
}

/**
 * Disable all given permission names.
 */
export function disablePermissions(names, pa = []) {
  names.forEach((name) => togglePermission(name, false, pa));
  return pa;
}

/**
 * Check if the given set of permission names are enabled in the given
 * permissions array.
 */
export function checkPermissions(names, pa) {
  if (!pa || !pa.length) {
    return false;
  }

  for (let i = 0; i < names.length; i++) {
    if (!map[names[i]]) {
      throw new Error(`unknown permission '${names[i]}'`);
    }

    const idx = index(names[i]);
    const m = mask(names[i]);

    if (!pa[idx] || !(pa[idx] & m)) {
      return false;
    }
  }

  return true;
}

/**
 * Get info about all the enabled permissions from a permissions array.
 */
export function getPermissionsInfo(pa, field = 'name') {
  const results = [];

  pa.forEach((x, idx) => {
    if (x) {
      x.toString(2).split('').forEach((b, bit) => {
        if (b === '1') {
          const permission = permissions[idx * 32 + bit + 1];
          if (permission) {
            results.push(field ? permission[field] : permission);
          }
        }
      });
    }
  });

  return results;
}


/**
 * Helpers
 */

// determine the index in the 'pa' array for a permission:
function index(name) {
  return Math.floor(map[name].id / 32);
}

// determine the bit number for a permission:
function bit(name) {
  return map[name].id % 32;
}

// create the mask required to check the status or toggle a permission:
function mask(name) {
  return 1 << bit(name);
}
