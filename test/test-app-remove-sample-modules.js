'use strict';

var assert = require('yeoman-assert');
var constants = require('../generators/common/constants.js');
var helpers = require('yeoman-test');
var fs = require('fs');
var os = require('os');
var path = require('path');


describe('generator-alfresco:app-remove-sample-modules', function () {

  describe('remove sdk samples', function () {

    this.timeout(60000);

    before(function (done) {
      helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(path.join(os.tmpdir(), './temp-test'))
        .withOptions({ 'skip-install': false })
        .withPrompts({
          removeDefaultSourceAmps: true,
          removeDefaultSourceSamples: false,
        })
        .on('end', done);
    });

    it('does not create sample amp specific files', function () {
      assert.noFile([
        'repo-amp/pom.xml',
        'share-amp/pom.xml',
      ]);
    });
  });

  describe('remove sdk sample modules, twice', function () {

    this.timeout(60000);

    before(function (done) {
      var tmpdir = path.join(os.tmpdir(), './temp-test');
      helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(tmpdir)
        .withOptions({ 'skip-install': false })
        .withPrompts({
          removeDefaultSourceAmps: true,
          removeDefaultSourceSamples: false,
        })
        .on('end', function() {
          helpers.run(path.join(__dirname, '../generators/app'))
            .inDir(tmpdir, function(dir) {
              fs.mkdirSync( path.join(dir, constants.FOLDER_SOURCE_TEMPLATES) );
              fs.mkdirSync( path.join(dir, constants.FOLDER_SOURCE_TEMPLATES + '/repo-amp') );
              fs.writeFileSync( path.join( path.join(dir, constants.FOLDER_SOURCE_TEMPLATES + '/repo-amp/pom.xml') ), '' );
            })
            .withLocalConfig({
              removeDefaultSourceAmps: true,
              removeDefaultSourceSamples: false,
            })
            .withOptions({ 'skip-install': false })
            .on('end', done);
        });
    });

    it('does not create sample amp specific files', function () {
      assert.noFile([
        'repo-amp/pom.xml',
        'share-amp/pom.xml',
      ]);
    });
  });

});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
