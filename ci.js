#!/usr/bin/env node
require('shelljs/global');

var nodeVersion = '' + process.argv[2];
var cmd;

if (0 === nodeVersion.indexOf('0')) {
  cmd = 'npm run test:color';
} else {
  cmd = 'npm run cover:color';
}

exec(cmd, {stdin: 'inherit'});
