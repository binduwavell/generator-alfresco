'use strict';
var _ = require('lodash');
var debug = require('debug')('generator-alfresco:java-properties');

var commentRE = /^\s*[#!]/;
var continuationRE = /\\$/;
var kvRE = /^\s*((?:\\\s|\\:|\\=|[^\s:=])*)\s*[=:]?\s*(.*)$/;
var propEscapeRE = /\\([\s:=])/g;
var unicodeEscapeRE = /\\([0-9a-zA-Z]{4})/g;

/*
 * Given a properties file, the parse method from this module will help
 * us grab the keys and values as an object. Everything is treated as strings.
 *
 * Information on the properties file format obtained from wikipedia:
 * https://en.wikipedia.org/wiki/.properties
 *
 * Usage:
 * var props = require('./java-properties.js')
 *   .parse('key1=value1\nkey2 : value2\n key3 value3 ');
 *
 * Will return:
 * {
 *   key1: 'value1',
 *   key2: 'value2',
 *   key3: 'value3 ',
 * }
 */

module.exports = {
  parse: function (propStr) {
    if (!_.isString(propStr) || _.isEmpty(propStr)) return {};
    return _.split(propStr, /\n/g)
      .map(removeLeadingWhitespace)
      .filter(isBlankLine)
      .filter(isCommentLine)
      .reduce(processLineFactory(this), {});
  },
};

/**
 * Detects if a line is blank
 *
 * @param {string} line
 * @returns {boolean}
 */
function isBlankLine (line) {
  var isEmpty = _.isEmpty(line);
  if (isEmpty) {
    debug('removing blank line');
  }
  return !isEmpty;
}

/**
 * Detects if a line is a comment.
 *
 * @param {string} line
 * @returns {boolean}
 */
function isCommentLine (line) {
  var isCmnt = commentRE.test(line);
  if (isCmnt) {
    debug('removing comment: %s', line);
  }
  return !isCmnt;
}

/**
 * Uses a regular expression to extract a key
 * and value from the line.
 *
 * @param {string} line
 * @returns {{key: undefined, value: undefined}}
 */
function extractKeyValue (line) {
  var kv = {
    key: undefined,
    value: undefined,
  };

  var matches = kvRE.exec(line);
  if (matches !== null && matches.length === 3) {
    kv.key = matches[1];
    kv.value = matches[2];
  }

  return kv;
}

/**
 * Detects in a line ends with \
 *
 * @param {string} line
 * @returns {boolean}
 */
function hasNewlineContinuation (line) {
  return continuationRE.test(line);
}

/**
 * This method is called with each non-blank and non-comment
 * line from the properties file. It builds up the object
 * representation of the properties data in the accumulator.
 * It uses instance object to store state when lines are
 * being continued.
 *
 * @param {Object} instance
 * @param {Object} acc
 * @param {string} line
 * @returns {Object}
 */
function processLine (instance, acc, line) {
  debug('processing: %s', line);
  // if previous line was continued then capture this line verbatim
  // of course we need to handle if this is also a continuation too
  if (instance.key) {
    var hasCont = hasNewlineContinuation(line);
    if (hasCont) {
      debug('removing line continuation');
      line = removeContinuation(line);
    }
    line = unescape(line);
    debug('saving %s=>%s', instance.key, line);
    acc[instance.key] += line;
    if (!hasCont) {
      instance.key = undefined;
    }
  } else {
    var kv = extractKeyValue(line);
    kv.key = unescape(kv.key);
    if (hasNewlineContinuation(kv.value)) {
      debug('removing line continuation');
      kv.value = removeContinuation(kv.value);
      instance.key = kv.key;
    }
    kv.value = unescape(kv.value);
    debug('saving %s=>%s', kv.key, kv.value);
    acc[kv.key] = kv.value;
  }
  return acc;
}

/**
 * Captures the instance we store our key information in
 *
 * @param {Object} instance
 * @returns {Function}
 */
function processLineFactory (instance) {
  return function (acc, line) {
    return processLine(instance, acc, line);
  };
}

/**
 * Remove trailing \ from a line
 *
 * @param {string} line
 * @returns {string}
 */
function removeContinuation (line) {
  return _.replace(line, continuationRE, '');
}

/**
 * Remove whitespace from the beginning of a line
 *
 * @param {string} line
 * @returns {string}
 */
function removeLeadingWhitespace (line) {
  return _.trimStart(line);
}

/**
 * Resolve property esacpe sequences in a line.
 * Also resolves unicode escapes.
 *
 * @param {string} line
 * @returns {string}
 */
function unescape (line) {
  var retv = _.replace(line, propEscapeRE, '$1');
  retv = _.replace(line, unicodeEscapeRE, function (m) {
    return String.fromCharCode(parseInt(m, 16));
  });
  if (retv !== line) {
    debug('removed escapes from: %s => %s', line, retv);
  }
  return retv;
}

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
