'use strict';
/* eslint-env node, mocha */
var assert = require('assert');
var javaprops = require('../generators/common/java-properties');

describe('generator-alfresco:java-properties', function () {
  it('can handle undefined input', function () {
    var props = javaprops.parse(undefined);
    assert.deepEqual(props, {});
  });

  it('can handle an empty file', function () {
    var props = javaprops.parse('');
    assert.deepEqual(props, {});
  });

  it('can handle file with only empty lines', function () {
    var props = javaprops.parse('\n   \n\t\t  \n  \t\n  \n');
    assert.deepEqual(props, {});
  });

  it('can handle single basic kv pair', function () {
    var props = javaprops.parse('key=value');
    assert.deepEqual(props, {key: 'value'});
  });

  it('can trim whitespace', function () {
    var props = javaprops.parse(' \t key \t = value');
    assert.deepEqual(props, {key: 'value'});
  });

  it('does not trim trailing whitespace', function () {
    var props = javaprops.parse(' \t key \t = value  \t  ');
    assert.deepEqual(props, {key: 'value  \t  '});
  });

  it('can handle empty lines in input', function () {
    var props = javaprops.parse('\nkey=value\n\n');
    assert.deepEqual(props, {key: 'value'});
  });

  it('can drop comments', function () {
    var props = javaprops.parse('# hash comment\nkey=value\n! bang comment\n#! multi comment !#');
    assert.deepEqual(props, {key: 'value'});
  });

  it('can combine continued lines', function () {
    var props = javaprops.parse('key = value1, \\\n    value2,\t\\\nfake-key=value3');
    assert.deepEqual(props, {key: 'value1, value2,\tfake-key=value3'});
  });

  it('can handle escapes in key', function () {
    var props = javaprops.parse('key\\ 1 = value1');
    assert.deepEqual(props, {'key\\ 1': 'value1'});
  });

  it('can handle unicode escapes in value', function () {
    var props = javaprops.parse('key1= value\u00091');
    assert.deepEqual(props, {'key1': 'value\t1'});
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
