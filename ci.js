#!/usr/bin/env node
require('shelljs/global');

var nodeVersion = '' + process.argv[2];
var cmd;

if ('5.1' === nodeVersion) {
  cmd = 'npm run cover:color';
} else {
  cmd = 'npm run test:color';
}

var proc = exec(cmd, {stdin: 'inherit'});
if (undefined === proc || null === proc) {
  echo('ERROR: unable to execute tests');
  exit(1);
} else if (0 !== proc.code) {
  echo('ERROR: unable to execute tests');
  exit(proc.code);
}
