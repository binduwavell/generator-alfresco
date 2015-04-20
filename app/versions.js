'use strict';
var deasync = require('deasync');
var path = require('path');
var spawn = require('cross-spawn');
var split = require('split');

module.exports.getJavaVersion = function() {
  var cmd = 'java';
  if(process.env.JAVA_HOME) {
    cmd = path.join(process.env.JAVA_HOME, '/bin/java');
  }
  var args = ['-version'];

  // java version "1.7.0_75"
  var match = getRegExpMatchFromProcessOutput(cmd, args, /^java version "([^"]*)"$/)
  if (match) {
    return match[1];
  }
}

module.exports.getMavenVersion = function() {
  var cmd = 'mvn';
  var args = ['-version'];

  // Apache Maven 3.3.1 (cab6659f9874fa96462afef40fcf6bc033d58c1c; 2015-03-13T13:10:27-07:00)
  var match = getRegExpMatchFromProcessOutput(cmd, args, /^Apache Maven ([0-9.]*)/)
  if (match) {
    return match[1];
  }
}

function getRegExpMatchFromProcessOutput(cmd, args, re) {
  var retv = undefined;
  var done = false;

  // if line matches regex return line
  var processLine = function(line) {
    var match = line.match(re);
    if (null != match) {
      retv = match;
    }
  };

  var proc = spawn(cmd, args);
  proc.stdout.setEncoding('utf8');
  proc.stdout.pipe(split()).on('data', processLine);
  proc.stderr.pipe(split()).on('data', processLine);
  proc.on('error', function(code, signal) { done = true; })
      .on('exit', function(code, signal) { done = true; });

  while (!done) {
    deasync.sleep(100);
  }

  return retv;
}
