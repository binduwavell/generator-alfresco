'use strict';

var assert = require('assert');
var _ = require('lodash');
var filters = require('../generators/app/prompt-filters.js')

describe('generator-alfresco:prompt-filters', function () {

  describe('.booleanFilter()', function() {

    it('handles invalid input', function () {
      assert.equal(filters.booleanFilter(undefined), undefined);
      assert.equal(filters.booleanFilter(null), undefined);
      assert.equal(filters.booleanFilter({}), undefined);
    });

    it('handles falsey input', function () {
      assert.equal(filters.booleanFilter(false), false);
      assert.equal(filters.booleanFilter('false'), false);
    });

    it('handles truthey input', function () {
      assert.equal(filters.booleanFilter(true), true);
      assert.equal(filters.booleanFilter('true'), true);
    });

  });

  describe('.booleanTextFilter()', function() {

    it('handles invalid input', function () {
      assert.equal(filters.booleanTextFilter(undefined), undefined);
      assert.equal(filters.booleanTextFilter(null), undefined);
      assert.equal(filters.booleanTextFilter({}), undefined);
    });

    it('handles falsey input', function () {
      assert.equal(filters.booleanTextFilter(undefined), undefined);
      assert.equal(filters.booleanTextFilter(false), 'false');
      assert.equal(filters.booleanTextFilter('false'), 'false');
    });

    it('handles truthey input', function () {
      assert.equal(filters.booleanTextFilter(true), 'true');
      assert.equal(filters.booleanTextFilter('true'), 'true');
    });

  });

  describe('.chooseOneFilter()', function() {

    it('detects invalid input', function () {
      var choices = ['one', 'two', 'three'];
      assert.equal(filters.chooseOneFilter(undefined, choices), undefined);
      assert.equal(filters.chooseOneFilter(null, choices), undefined);
      assert.equal(filters.chooseOneFilter('', choices), undefined);
      assert.equal(filters.chooseOneFilter(true, choices), undefined);
      assert.equal(filters.chooseOneFilter(false, choices), undefined);
      assert.equal(filters.chooseOneFilter('four', choices), undefined);
      assert.equal(filters.chooseOneFilter('O', choices), undefined);
      assert.equal(filters.chooseOneFilter('twobyfour', choices), undefined);
    });

    it('handles exact match for first item in list in case insensitive manner', function () {
      var choices = ['One', 'two', 'three'];
      assert.equal(filters.chooseOneFilter('one', choices), 'One');
      assert.equal(filters.chooseOneFilter('One', choices), 'One');
    });

    it('handles exact match for middle item in list in case insensitive manner', function () {
      var choices = ['one', 'twO', 'three'];
      assert.equal(filters.chooseOneFilter('twO', choices), 'twO');
      assert.equal(filters.chooseOneFilter('tWo', choices), 'twO');
    });

    it('handles exact matche for last item in list', function () {
      var choices = ['one', 'two', 'threE'];
      assert.equal(filters.chooseOneFilter('three', choices), 'threE');
      assert.equal(filters.chooseOneFilter('threE', choices), 'threE');
    });

  });

  describe('.chooseOneStartsWithFilter()', function() {

    it('detects invalid input', function () {
      var choices = ['one', 'two', 'three'];
      assert.equal(filters.chooseOneStartsWithFilter(undefined, choices), undefined);
      assert.equal(filters.chooseOneStartsWithFilter(null, choices), undefined);
      assert.equal(filters.chooseOneStartsWithFilter('', choices), undefined);
      assert.equal(filters.chooseOneStartsWithFilter(true, choices), undefined);
      assert.equal(filters.chooseOneStartsWithFilter(false, choices), undefined);
      assert.equal(filters.chooseOneStartsWithFilter('four', choices), undefined);
    });

    it('handles partial matches', function () {
      var choices = ['one', 'two', 'three'];
      assert.equal(filters.chooseOneStartsWithFilter('one', choices), 'one');
      assert.equal(filters.chooseOneStartsWithFilter('ONE', choices), 'one');
      assert.equal(filters.chooseOneStartsWithFilter('O', choices), 'one');
    });

    it('handles partial matches where first match wins', function () {
      var choices = ['one', 'two', 'three'];
      assert.equal(filters.chooseOneStartsWithFilter('t', choices), 'two');
      assert.equal(filters.chooseOneStartsWithFilter('tH', choices), 'three');
    });

    it('handles exact match when partial matche exists first', function () {
      var choices = ['one', 'twobyfour', 'three', 'two'];
      assert.equal(filters.chooseOneStartsWithFilter('Two', choices), 'two');
    });

  });

  describe('.optionalTextFilter()', function() {

    it('handles invalid input', function () {
      assert.equal(filters.optionalTextFilter(undefined), undefined);
      assert.equal(filters.optionalTextFilter(null), undefined);
    });

    it('handles empty input', function () {
      assert.equal(filters.optionalTextFilter(true), '');
      assert.equal(filters.optionalTextFilter(''), '');
    });

    it('handles textual input', function () {
      assert.equal(filters.optionalTextFilter('asdf'), 'asdf');
    });

  });

  describe('.requiredTextFilter()', function() {

    it('handles invalid input', function () {
      assert.equal(filters.requiredTextFilter(undefined), undefined);
      assert.equal(filters.requiredTextFilter(null), undefined);
      assert.equal(filters.requiredTextFilter(true), undefined);
      assert.equal(filters.requiredTextFilter(''), undefined);
    });

    it('handles textual input', function () {
      assert.equal(filters.requiredTextFilter('asdf'), 'asdf');
    });

  });

  describe('.requiredTextListFilter()', function() {

    it('handles invalid input', function () {
      var choices = ['one', 'two', 'three'];
      assert.equal(filters.requiredTextListFilter(undefined, '^'), undefined);
      assert.equal(filters.requiredTextListFilter(null, '^'), undefined);
      assert.equal(filters.requiredTextListFilter('', '^'), undefined);
      assert.deepEqual(filters.requiredTextListFilter(true, '^'), undefined);
      assert.deepEqual(filters.requiredTextListFilter('four', '^', choices), undefined);
    });

    it('can handle arbitrary data when no choices are provided', function () {
      assert.deepEqual(filters.requiredTextListFilter('one^two^Three', '^'), ['one','two','Three']);
    });

    it('can handle multipe inputs and filter based on choices', function () {
      var choices = ['one', 'two', 'threE'];
      assert.deepEqual(filters.requiredTextListFilter('Three^tWo^one', '^', choices), ['one','two','threE']);
    });

    it('filters out values not included in the choices list', function () {
      var choices = ['one', 'two', 'threE'];
      assert.deepEqual(filters.requiredTextListFilter('four^Three^tWo^two and a half^one^zerO', '^', choices), ['one','two','threE']);
    });

    it('handles first match in a case insensitive way', function () {
      var choices = ['one', 'two', 'three'];
      assert.deepEqual(filters.requiredTextListFilter('One', '^', choices), ['one']);
    });

    it('handles middle match in a case insensitive way', function () {
      var choices = ['one', 'two', 'three'];
      assert.deepEqual(filters.requiredTextListFilter('tWo', '^', choices), ['two']);
    });

    it('handles last match in a case insensitive way', function () {
      var choices = ['one', 'two', 'Three'];
      assert.deepEqual(filters.requiredTextListFilter('threE', '^', choices), ['Three']);
    });

  });

  describe('.textListFilter()', function() {

    it('handles invalid input', function () {
      assert.equal(filters.textListFilter(undefined, '^'), undefined);
      assert.equal(filters.textListFilter(null, '^'), undefined);
    });

    it('can handle empty lists', function () {
      var choices = ['one', 'two', 'three'];
      assert.deepEqual(filters.textListFilter(true, '^'), []);
      assert.deepEqual(filters.textListFilter('', '^'), []);
      assert.deepEqual(filters.textListFilter('four', '^', choices), []);
    });

    it('can handle arbitrary data when no choices are provided', function () {
      assert.deepEqual(filters.textListFilter('one^two^Three', '^'), ['one','two','Three']);
    });

    it('can handle multipe inputs and filter based on choices', function () {
      var choices = ['one', 'two', 'threE'];
      assert.deepEqual(filters.textListFilter('Three^tWo^one', '^', choices), ['one','two','threE']);
    });

    it('filters out values not included in the choices list and return in choice list order', function () {
      var choices = ['one', 'two', 'threE'];
      assert.deepEqual(filters.textListFilter('four^Three^tWo^two and a half^one^zerO', '^', choices), ['one','two','threE']);
    });

    it('handles first match in a case insensitive way', function () {
      var choices = ['one', 'two', 'three'];
      assert.deepEqual(filters.textListFilter('One', '^', choices), ['one']);
    });

    it('handles middle match in a case insensitive way', function () {
      var choices = ['one', 'two', 'three'];
      assert.deepEqual(filters.textListFilter('tWo', '^', choices), ['two']);
    });

    it('handles last match in a case insensitive way', function () {
      var choices = ['one', 'two', 'Three'];
      assert.deepEqual(filters.textListFilter('threE', '^', choices), ['Three']);
    });

  });

});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
