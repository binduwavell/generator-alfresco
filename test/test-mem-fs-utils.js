'use strict';

var assert = require('assert');
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
      this.fs.write('/asdf/fdsa/file.txt', 'some content');
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf/fdsa/file.txt'), true);
    });

    it('finds an file in an editor', function () {
      this.fs.write('/asdf/fdsa/file.txt', 'some content');
      assert.equal(memFsUtils.existsInMemory(this.fs, '/asdf/fdsa/file.txt'), true);
    });

    it('finds an folder in a store', function () {
      this.fs.write('/asdf/fdsa/file.txt', 'some content');
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf'), true);
    });

    it('finds an folder in an editor', function () {
      this.fs.write('/asdf/fdsa/file.txt', 'some content');
      assert.equal(memFsUtils.existsInMemory(this.fs, '/asdf'), true);
    });

    it('finds folder if at least one sub-file has not been deleted', function () {
      this.fs.write('/asdf/fdsa/file1.txt', 'some content 1');
      this.fs.write('/asdf/fdsa/file2.txt', 'some content 2');
      this.fs.delete('/asdf/fdsa/file1.txt');
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf'), true);
    });

    it('does not find anything when store is empty', function () {
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf'), false);
    });

    it('does not find file when it has been deleted', function () {
      this.fs.write('/asdf/fdsa/file.txt', 'some content');
      this.fs.delete('/asdf/fdsa/file.txt');
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf/fdsa/file.txt'), false);
    });

    it('does not find folder when all sub-files have been deleted', function () {
      this.fs.write('/asdf/fdsa/file1.txt', 'some content 1');
      this.fs.write('/asdf/fdsa/file2.txt', 'some content 2');
      this.fs.delete('/asdf/fdsa/file1.txt');
      this.fs.delete('/asdf/fdsa/file2.txt');
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf'), false);
    });

  });

  describe('.inMemoryCopy()', function() {

    it('copies files from a folder', function () {
      this.fs.write('/asdf/fdsa/file1.txt', 'some content 1');
      this.fs.write('/asdf/fdsa/file2.txt', 'some content 2');
      memFsUtils.inMemoryCopy(this.store, '/asdf/fdsa', '/asdf/asdf');
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf/fdsa/file1.txt'), true);
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf/fdsa/file2.txt'), true);
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf/asdf/file1.txt'), true);
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf/asdf/file2.txt'), true);
    });

    it('copies a single file', function () {
      this.fs.write('/asdf/fdsa/file1.txt', 'some content 1');
      this.fs.write('/asdf/fdsa/file2.txt', 'some content 2');
      memFsUtils.inMemoryCopy(this.store, '/asdf/fdsa/file1.txt', '/asdf/asdf');
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf/fdsa/file1.txt'), true);
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf/fdsa/file2.txt'), true);
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf/asdf/file1.txt'), true);
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf/asdf/file2.txt'), false);
    });

  });

  describe('.inMemoryMove()', function() {

    it('moves files from a folder', function () {
      this.fs.write('/asdf/fdsa/file1.txt', 'some content 1');
      this.fs.write('/asdf/fdsa/file2.txt', 'some content 2');
      memFsUtils.inMemoryMove(this.store, '/asdf', '/fdsa');
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf/fdsa/file1.txt'), false);
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf/fdsa/file2.txt'), false);
      assert.equal(memFsUtils.existsInMemory(this.store, '/fdsa/fdsa/file1.txt'), true);
      assert.equal(memFsUtils.existsInMemory(this.store, '/fdsa/fdsa/file2.txt'), true);
    });

    it('moves a single file', function () {
      this.fs.write('/asdf/fdsa/file1.txt', 'some content 1');
      this.fs.write('/asdf/fdsa/file2.txt', 'some content 2');
      memFsUtils.inMemoryMove(this.store, '/asdf/fdsa/file1.txt', '/asdf/asdf');
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf/fdsa/file1.txt'), false);
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf/fdsa/file2.txt'), true);
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf/asdf/file1.txt'), true);
      assert.equal(memFsUtils.existsInMemory(this.store, '/asdf/asdf/file2.txt'), false);
    });

  });

  describe('.dumpFileNames()', function() {

    beforeEach(function () {
      this.names = [];
      this.capture = function(msg) {
        this.names.push(msg);
      }.bind(this);
    });

    it('lists files we have added', function () {
      this.fs.write('/asdf/fdsa/file1.txt', 'some content 1');
      this.fs.write('/asdf/fdsa/file2.txt', 'some content 2');
      memFsUtils.dumpFileNames(this.store, this.capture);
      assert.equal(this.names.length, 2);
      assert.equal(this.names[0], '/asdf/fdsa/file1.txt [STATE:modified]');
      assert.equal(this.names[1], '/asdf/fdsa/file2.txt [STATE:modified]');
    });

    it('lists files we have deleted', function () {
      this.fs.write('/asdf/fdsa/file1.txt', 'some content 1');
      this.fs.write('/asdf/fdsa/file2.txt', 'some content 2');
      this.fs.delete('/asdf/fdsa/file1.txt');
      this.fs.delete('/asdf/fdsa/file2.txt');
      memFsUtils.dumpFileNames(this.store, this.capture);
      assert.equal(this.names.length, 2);
      assert.equal(this.names[0], '/asdf/fdsa/file1.txt [STATE:deleted]');
      assert.equal(this.names[1], '/asdf/fdsa/file2.txt [STATE:deleted]');
    });

    it('lists files we have added and deleted', function () {
      this.fs.write('/asdf/fdsa/file1.txt', 'some content 1');
      this.fs.write('/asdf/fdsa/file2.txt', 'some content 2');
      this.fs.delete('/asdf/fdsa/file1.txt');
      memFsUtils.dumpFileNames(this.store, this.capture);
      assert.equal(this.names.length, 2);
      assert.equal(this.names[0], '/asdf/fdsa/file1.txt [STATE:deleted]');
      assert.equal(this.names[1], '/asdf/fdsa/file2.txt [STATE:modified]');
    });
  });

});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
