'use strict';

var assert = require('assert');
var process = require('process');
var memFs = require('mem-fs');
var editor = require('mem-fs-editor');
var memFsUtils = require('../generators/app/mem-fs-utils.js');

describe('generator-alfresco:mem-fs-utils', function () {

  beforeEach(function () {
    this.store = memFs.create();
    this.fs = editor.create(this.store);
  });

  describe('.existsInMemory()', function() {

    it('finds an file in a store', function () {
      this.fs.write("/asdf/fdsa/file.txt", "some content");
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf/fdsa/file.txt'), true);
    });

    it('finds an file in an editor', function () {
      this.fs.write("/asdf/fdsa/file.txt", "some content");
      assert.equal(memFsUtils.existsInMemory(this.fs, '/asdf/fdsa/file.txt'), true);
    });

    it('finds an folder in a store', function () {
      this.fs.write("/asdf/fdsa/file.txt", "some content");
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf'), true);
    });

    it('finds an folder in an editor', function () {
      this.fs.write("/asdf/fdsa/file.txt", "some content");
      assert.equal(memFsUtils.existsInMemory(this.fs, '/asdf'), true);
    });

    it('finds folder if at least one sub-file has not been deleted', function () {
      this.fs.write("/asdf/fdsa/file1.txt", "some content 1");
      this.fs.write("/asdf/fdsa/file2.txt", "some content 2");
      this.fs.delete("/asdf/fdsa/file1.txt");
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf'), true);
    });

    it('does not find anything when store is empty', function () {
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf'), false);
    });

    it('does not find file when it has been deleted', function () {
      this.fs.write("/asdf/fdsa/file.txt", "some content");
      this.fs.delete("/asdf/fdsa/file.txt");
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf/fdsa/file.txt'), false);
    });

    it('does not find folder when all sub-files have been deleted', function () {
      this.fs.write("/asdf/fdsa/file1.txt", "some content 1");
      this.fs.write("/asdf/fdsa/file2.txt", "some content 2");
      this.fs.delete("/asdf/fdsa/file1.txt");
      this.fs.delete("/asdf/fdsa/file2.txt");
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf'), false);
    });

  });
  describe('.inMemoryCopy()', function() {

    it('copies files from a folder', function () {
      this.fs.write("/asdf/fdsa/file1.txt", "some content 1");
      this.fs.write("/asdf/fdsa/file2.txt", "some content 2");
      memFsUtils.inMemoryCopy(this.store, '/asdf/fdsa', '/asdf/asdf');
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf/asdf/file1.txt'), true);
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf/asdf/file2.txt'), true);
    });

    it('copies a single file', function () {
      this.fs.write("/asdf/fdsa/file1.txt", "some content 1");
      this.fs.write("/asdf/fdsa/file2.txt", "some content 2");
      memFsUtils.inMemoryCopy(this.store, '/asdf/fdsa/file1.txt', '/asdf/asdf');
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf/asdf/file1.txt'), true);
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf/asdf/file2.txt'), false);
    });

  });

});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
