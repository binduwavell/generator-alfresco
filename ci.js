#!/usr/bin/env node
var spawn = require('child_process').spawn;

var nodeVersion = '' + process.argv[2];

var child;
if (0 === nodeVersion.indexOf('0')) {
  args = ['test'];
} else {
  args = ['run', 'cover'];
}

function startChild(){
  console.log("STARTING", process.execPath, "npm", args);
  child = spawn('npm',  args, {
      cwd: process.cwd(),
      env: process.env,
      detached: true
  });
  child.on('error', function(e){console.log(e)});
  child.stdout.pipe(process.stdout);
  console.log("STARTED with PID:", child.pid);
}

process.on('SIGQUIT', function() {
  child.kill();
  startChild();
});
startChild();
