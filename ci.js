#!/usr/bin/env node
var spawnSync = require('child_process').spawnSync;

var nodeVersion = '' + process.argv[2];
var child;

if (0 === nodeVersion.indexOf('0')) {
  args = ['run', 'test'];
} else {
  args = ['run', 'cover'];
}

function startChild(){
  console.log("STARTING", "npm", args);
  child = spawnSync('npm',  args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
      detached: false
  });
}

process.on('SIGQUIT', function() {
  child.kill();
});

startChild();
