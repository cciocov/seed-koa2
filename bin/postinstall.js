'use strict';

var fs = require('fs-extra'),
    path = require('path'),
    child_process = require('child_process');

// create links in node_modules to some of our app directories, for easy
// require's from anywhere in our codebase:

// paths are relative to node_modules:
var links = [
  { source: '../config/', target: '_/config' },
  { source: '../src/modules/', target: '_/modules' },
  { source: '../src/models/', target: '_/models' },
  { source: '../src/', target: '_/src' }
];

var node_modules = path.resolve(__dirname, '../node_modules');

links.forEach(function(link) {
  var src = path.resolve(node_modules, link.source),
      dst = path.resolve(node_modules, link.target);

  fs.ensureSymlinkSync(src, dst);
});

// this prevents some NPM warnings:
if (!fs.existsSync(path.resolve(node_modules, '_/package.json'))) {
  fs.writeJsonSync(path.resolve(node_modules, '_/package.json'), {
    name: '_',
    version: '0.0.0'
  });
}

// run npm install on all modules that have a package.json file:
var modules = path.resolve(__dirname, '../src/modules');

fs.readdirSync(modules).forEach(function(module) {
  var modulePath = path.join(modules, module);

  if (fs.existsSync(path.join(modulePath, 'package.json'))) {
    child_process.spawn('npm', ['i'], {
      env: process.env,
      cwd: modulePath,
      stdio: 'inherit'
    });
  }
});
