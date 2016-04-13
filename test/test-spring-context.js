'use strict';
/* eslint-env node, mocha */
var assert = require('assert');

describe('generator-alfresco:spring-context', function () {
  describe('.hasImport()', function () {
    it('can determine if an import does not exist when there are no imports', function () {
      var contextString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<beans>',
        '</beans>',
      ].join('\n');
      var context = require('../generators/common/spring-context.js')(contextString);
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
      var context = require('../generators/common/spring-context.js')(contextString);
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
      var context = require('../generators/common/spring-context.js')(contextString);
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
      var context = require('../generators/common/spring-context.js')(contextString);
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
      var context = require('../generators/common/spring-context.js')(contextString);
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
      var context = require('../generators/common/spring-context.js')(contextString);
      assert.equal(context.hasImport('asdf'), true);
    });
  });

  describe('.addImport()', function () {
    it('can add an import where there is nothing', function () {
      var context = require('../generators/common/spring-context.js')();
      assert.equal(context.hasImport('asdf'), false);
      context.addImport('asdf');
      assert.equal(context.hasImport('asdf'), true);
    });

    it('can add an import where there is nothing in beans', function () {
      var contextString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<beans>',
        '</beans>',
      ].join('\n');
      var context = require('../generators/common/spring-context.js')(contextString);
      assert.equal(context.hasImport('asdf'), false);
      context.addImport('asdf');
      assert.equal(context.hasImport('asdf'), true);
    });

    it('can add an import where there is a completely empty beans element', function () {
      var contextString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<beans/>',
      ].join('\n');
      var context = require('../generators/common/spring-context.js')(contextString);
      assert.equal(context.hasImport('asdf'), false);
      context.addImport('asdf');
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
      var context = require('../generators/common/spring-context.js')(contextString);
      assert.equal(context.hasImport('asdf'), false);
      context.addImport('asdf');
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
      var context = require('../generators/common/spring-context.js')(contextString);
      assert.equal(context.hasImport('asdf'), false);
      context.addImport('asdf');
      assert.equal(context.hasImport('asdf'), true);
    });

    it('can add an import where there is one and some other stuff', function () {
      var contextString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<beans>',
        '  <import resource="fdsa"/>',
        '  <stuff/>',
        '</beans>',
      ].join('\n');
      var context = require('../generators/common/spring-context.js')(contextString);
      assert.equal(context.hasImport('asdf'), false);
      context.addImport('asdf');
      assert.equal(context.hasImport('asdf'), true);
    });
  });

  describe('.removeImport()', function () {
    it('can remove an import where there is nothing', function () {
      var context = require('../generators/common/spring-context.js')();
      assert.equal(context.hasImport('asdf'), false);
      context.removeImport('asdf');
      assert.equal(context.hasImport('asdf'), false);
    });

    it('can remove an import where there is nothing in beans', function () {
      var contextString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<beans>',
        '</beans>',
      ].join('\n');
      var context = require('../generators/common/spring-context.js')(contextString);
      assert.equal(context.hasImport('asdf'), false);
      context.removeImport('asdf');
      assert.equal(context.hasImport('asdf'), false);
    });

    it('can remove an import where there are siblings but no imports', function () {
      var contextString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<beans>',
        '  <bean id="asdf"/>',
        '</beans>',
      ].join('\n');
      var context = require('../generators/common/spring-context.js')(contextString);
      assert.equal(context.hasImport('asdf'), false);
      context.removeImport('asdf');
      assert.equal(context.hasImport('asdf'), false);
    });

    it('can remove an import where there is one', function () {
      var contextString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<beans>',
        '  <import resource="fdsa"/>',
        '</beans>',
      ].join('\n');
      var context = require('../generators/common/spring-context.js')(contextString);
      assert.equal(context.hasImport('fdsa'), true);
      context.removeImport('fdsa');
      assert.equal(context.hasImport('fdsa'), false);
    });

    it('can remove first of many imports', function () {
      var contextString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<beans>',
        '  <import resource="asdf"/>',
        '  <import resource="fdsa"/>',
        '  <import resource="aaff"/>',
        '  <import resource="ffaa"/>',
        '</beans>',
      ].join('\n');
      var context = require('../generators/common/spring-context.js')(contextString);
      assert.equal(context.hasImport('asdf'), true);
      assert.equal(context.hasImport('fdsa'), true);
      assert.equal(context.hasImport('aaff'), true);
      assert.equal(context.hasImport('ffaa'), true);
      context.removeImport('asdf');
      assert.equal(context.hasImport('asdf'), false);
      assert.equal(context.hasImport('fdsa'), true);
      assert.equal(context.hasImport('aaff'), true);
      assert.equal(context.hasImport('ffaa'), true);
    });

    it('can remove middle of many imports', function () {
      var contextString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<beans>',
        '  <import resource="asdf"/>',
        '  <import resource="fdsa"/>',
        '  <import resource="aaff"/>',
        '  <import resource="ffaa"/>',
        '</beans>',
      ].join('\n');
      var context = require('../generators/common/spring-context.js')(contextString);
      assert.equal(context.hasImport('asdf'), true);
      assert.equal(context.hasImport('fdsa'), true);
      assert.equal(context.hasImport('aaff'), true);
      assert.equal(context.hasImport('ffaa'), true);
      context.removeImport('fdsa');
      assert.equal(context.hasImport('asdf'), true);
      assert.equal(context.hasImport('fdsa'), false);
      assert.equal(context.hasImport('aaff'), true);
      assert.equal(context.hasImport('ffaa'), true);
    });

    it('can remove last of many imports', function () {
      var contextString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<beans>',
        '  <import resource="asdf"/>',
        '  <import resource="fdsa"/>',
        '  <import resource="aaff"/>',
        '  <import resource="ffaa"/>',
        '</beans>',
      ].join('\n');
      var context = require('../generators/common/spring-context.js')(contextString);
      assert.equal(context.hasImport('asdf'), true);
      assert.equal(context.hasImport('fdsa'), true);
      assert.equal(context.hasImport('aaff'), true);
      assert.equal(context.hasImport('ffaa'), true);
      context.removeImport('ffaa');
      assert.equal(context.hasImport('asdf'), true);
      assert.equal(context.hasImport('fdsa'), true);
      assert.equal(context.hasImport('aaff'), true);
      assert.equal(context.hasImport('ffaa'), false);
    });

    it('can remove many imports', function () {
      var contextString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<beans>',
        '  <import resource="asdf"/>',
        '  <import resource="fdsa"/>',
        '  <import resource="aaff"/>',
        '  <import resource="ffaa"/>',
        '</beans>',
      ].join('\n');
      var context = require('../generators/common/spring-context.js')(contextString);
      assert.equal(context.hasImport('asdf'), true);
      assert.equal(context.hasImport('fdsa'), true);
      assert.equal(context.hasImport('aaff'), true);
      assert.equal(context.hasImport('ffaa'), true);
      context.removeImport('asdf');
      context.removeImport('fdsa');
      context.removeImport('aaff');
      context.removeImport('ffaa');
      assert.equal(context.hasImport('asdf'), false);
      assert.equal(context.hasImport('fdsa'), false);
      assert.equal(context.hasImport('aaff'), false);
      assert.equal(context.hasImport('ffaa'), false);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
