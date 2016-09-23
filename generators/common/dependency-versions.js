'use strict';
var _ = require('lodash');
var deasync = require('deasync');
var fs = require('fs');
var path = require('path');
var spawn = require('cross-spawn');
var split = require('split');
var debug = require('debug')('generator-alfresco:dependency-version');

module.exports.getJavaVersion = function (cmd) {
  if (!cmd) {
    if (process.env.JAVA_HOME) {
      cmd = path.join(process.env.JAVA_HOME, '/bin/java');
    } else {
      var defaultCmds = ['/bin/java', '/usr/bin/java', '/usr/local/bin/java'];
      cmd = _.find(defaultCmds, function (c) {
        var e = fs.existsSync(c);
        debug('Checking if Java binary exists at: ' + c + ', ' + e);
        return e;
      });
      if (cmd === undefined) {
        cmd = 'java';
      }
    }
  }
  debug('Using java cmd: ' + cmd);
  var args = ['-version'];

  // java version "1.7.0_75"
  var match = this.getRegExpMatchFromProcessOutput(cmd, args, /^(?:java|openjdk) version "([^"]*)"$/);
  if (match) {
    debug('Java Version Match: ' + match[1]);
    return match[1];
  } else {
    return undefined;
  }
};

module.exports.getMavenVersion = function (cmd) {
  if (!cmd) {
    if (process.env.M2_HOME) {
      cmd = path.join(process.env.M2_HOME, '/bin/mvn');
    } else {
      var defaultCmds = ['/bin/mvn', '/usr/bin/mvn', '/usr/local/bin/mvn'];
      cmd = _.find(defaultCmds, function (c) {
        var e = fs.existsSync(c);
        debug('Checking if Maven binary exists at: ' + c + ', ' + e);
        return e;
      });
      if (cmd === undefined) {
        cmd = 'mvn';
      }
    }
  }
  var args = ['-version'];

  // Apache Maven 3.3.1 (cab6659f9874fa96462afef40fcf6bc033d58c1c; 2015-03-13T13:10:27-07:00)
  var match = this.getRegExpMatchFromProcessOutput(cmd, args, /^Apache Maven ([0-9.]*)/);
  if (match) {
    debug('Maven Version Match: ' + match[1]);
    return match[1];
  } else {
    return undefined;
  }
};

module.exports.getRegExpMatchFromProcessOutput = function (cmd, args, re) {
  var retv;
  var done = false;

  // if line matches regex return line
  var processLine = function (line) {
    debug('Checking cmd output: ' + line);
    var match = line.match(re);
    if (match !== null) {
      retv = match;
    }
  };

  var proc = spawn(cmd, args);
  proc.stdout.setEncoding('utf8');
  proc.stdout.pipe(split()).on('data', processLine);
  proc.stderr.pipe(split()).on('data', processLine);
  proc.on('error', function (code, signal) { done = true })
    .on('exit', function (code, signal) { done = true });

  deasync.loopWhile(function () { return !done });

  return retv;
};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
