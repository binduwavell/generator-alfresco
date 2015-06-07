'use strict';

var assert = require('assert');
var chalk = require('chalk');

describe('generator-alfresco:spring-context', function () {

  describe('.hasImport()', function() {

    it('can determine if an import does not exist when there are no imports', function () {
      var contextString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<beans>',
        '</beans>',
      ].join('\n');
      var context = require('../app/spring-context.js')(contextString);
      assert.equal(context.hasImport('asdf'), false);
    });

    it('can determine if an import does not exist when there are imports', function () {
      var contextString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<beans>',
        '  <import resource="fdsa"/>',
        '</beans>',
      ].join('\n');
      var context = require('../app/spring-context.js')(contextString);
      assert.equal(context.hasImport('asdf'), false);
    });

    it('can determine if an import exists when it is the only import', function () {
      var contextString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<beans>',
        '  <import resource="asdf"/>',
        '</beans>',
      ].join('\n');
      var context = require('../app/spring-context.js')(contextString);
      assert.equal(context.hasImport('asdf'), true);
    });

    it('can determine if an import exists when it is the first import', function () {
      var contextString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<beans>',
        '  <import resource="asdf"/>',
        '  <import resource="fdsa"/>',
        '</beans>',
      ].join('\n');
      var context = require('../app/spring-context.js')(contextString);
      assert.equal(context.hasImport('asdf'), true);
    });

    it('can determine if an import exists when it is the last import', function () {
      var contextString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<beans>',
        '  <import resource="fdsa"/>',
        '  <import resource="asdf"/>',
        '</beans>',
      ].join('\n');
      var context = require('../app/spring-context.js')(contextString);
      assert.equal(context.hasImport('asdf'), true);
    });

    it('can determine if an import exists when it is a middle import', function () {
      var contextString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<beans>',
        '  <import resource="fdsa"/>',
        '  <import resource="asdf"/>',
        '  <import resource="aabb"/>',
        '</beans>',
      ].join('\n');
      var context = require('../app/spring-context.js')(contextString);
      assert.equal(context.hasImport('asdf'), true);
    });

  });

  describe('.addImport()', function() {

    it('can add an import where there is nothing', function () {
      var context = require('../app/spring-context.js')();
      assert.equal(context.hasImport('asdf'), false);
      context.addImport('asdf')
      assert.equal(context.hasImport('asdf'), true);
    });
    
    it('can add an import where there is nothing in beans', function () {
      var contextString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<beans>',
        '</beans>',
      ].join('\n');
      var context = require('../app/spring-context.js')(contextString);
      assert.equal(context.hasImport('asdf'), false);
      context.addImport('asdf')
      assert.equal(context.hasImport('asdf'), true);
    });

    it('can add an import where there are siblings but no imports', function () {
      var contextString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<beans>',
        '  <bean id="asdf"/>',
        '</beans>',
      ].join('\n');
      var context = require('../app/spring-context.js')(contextString);
      assert.equal(context.hasImport('asdf'), false);
      context.addImport('asdf')
      assert.equal(context.hasImport('asdf'), true);
    });

    it('can add an import where there is one', function () {
      var contextString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<beans>',
        '  <import resource="fdsa"/>',
        '</beans>',
      ].join('\n');
      var context = require('../app/spring-context.js')(contextString);
      assert.equal(context.hasImport('asdf'), false);
      context.addImport('asdf')
      assert.equal(context.hasImport('asdf'), true);
    });

  });

});
