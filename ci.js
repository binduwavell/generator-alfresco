#!/usr/bin/env node
/* eslint-env node, shelljs */
require('shelljs/global');

var nodeVersion = String(process.argv[2]);
var testCommand = 'npm run test:color';
if (nodeVersion === 'v7') {
  testCommand = 'npm run codecov:color';
}

var proc = exec(testCommand, {stdin: 'inherit'});
if (proc === undefined || proc === null) {
  echo('ERROR: unable to execute tests');
  exit(1);
} else if (proc.code !== 0) {
  echo('ERROR: unable to execute tests');
  exit(proc.code);
}
