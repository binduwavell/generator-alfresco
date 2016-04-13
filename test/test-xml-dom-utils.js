'use strict';
/* eslint-env node, mocha */
var assert = require('assert');
var pd = require('pretty-data').pd;
var xmldom = require('xmldom');
var domutils = require('../generators/common/xml-dom-utils.js');

describe('generator-alfresco:xml-dom-utils', function () {
  describe('.createChild()', function () {
    it('create top level element in empty root', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns:ns="http://www.example.com/"/>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var element = domutils.createChild(rootElement, 'ns', 'node');
      assert.ok(element);
      var docStr = pd.xml(new xmldom.XMLSerializer().serializeToString(doc));
      assert.equal(docStr, [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root ',
        '  xmlns:ns="http://www.example.com/">',
        '  <node/>',
        '</root>',
      ].join('\n'));
    });

    it('adding child defaults to adding at the end', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns:ns="http://www.example.com/">',
        '  <element/>',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var element = domutils.createChild(rootElement, 'ns', 'node');
      assert.ok(element);
      var docStr = pd.xml(new xmldom.XMLSerializer().serializeToString(doc));
      assert.equal(docStr, [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root ',
        '  xmlns:ns="http://www.example.com/">',
        '  <element/>',
        '  <node/>',
        '</root>',
      ].join('\n'));
    });

    it('adding child can be set to add to add at the beginning', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns:ns="http://www.example.com/">',
        '  <element/>',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var element = domutils.createChild(rootElement, 'ns', 'node', true);
      assert.ok(element);
      var docStr = pd.xml(new xmldom.XMLSerializer().serializeToString(doc));
      assert.equal(docStr, [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root ',
        '  xmlns:ns="http://www.example.com/">',
        '  <node/>',
        '  <element/>',
        '</root>',
      ].join('\n'));
    });
  });

  describe('.getChild()', function () {
    it('get top level element', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns="http://www.example.com/">',
        '  <element />',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var element = domutils.getChild(rootElement, 'ns', 'element');
      assert.ok(element);
      assert.ok(element.nodeType === element.ELEMENT_NODE);
    });

    it('undefined for non-existent child', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns="http://www.example.com/">',
        '  <element />',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var element = domutils.getChild(rootElement, 'ns', 'garbage');
      assert.equal(element, undefined);
    });
  });

  describe('.removeChild()', function () {
    it('delete top level element', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns:ns="http://www.example.com/">',
        '  <ns:element />',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      domutils.removeChild(rootElement, 'ns', 'element');
      var docStr = pd.xml(new xmldom.XMLSerializer().serializeToString(doc));
      assert.equal(docStr, [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root ',
        '  xmlns:ns="http://www.example.com/">',
        '</root>',
      ].join('\n'));
    });
  });

  describe('.removeParentsChild()', function () {
    it('deletes top level element', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns:ns="http://www.example.com/">',
        '  <ns:element />',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var element = domutils.getChild(rootElement, 'ns', 'element');
      domutils.removeParentsChild(rootElement, element);
      var docStr = pd.xml(new xmldom.XMLSerializer().serializeToString(doc));
      assert.equal(docStr, [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root ',
        '  xmlns:ns="http://www.example.com/">',
        '</root>',
      ].join('\n'));
    });

    it('does not delete if not parent/child', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns:ns="http://www.example.com/">',
        '  <ns:element />',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var element = domutils.getChild(rootElement, 'ns', 'element');
      domutils.removeParentsChild(element, rootElement);
      var docStr = pd.xml(new xmldom.XMLSerializer().serializeToString(doc));
      assert.equal(docStr, [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root ',
        '  xmlns:ns="http://www.example.com/">',
        '  <ns:element/>',
        '</root>',
      ].join('\n'));
    });
  });

  describe('.getOrCreateChild()', function () {
    it('get top level element', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns="http://www.example.com/">',
        '  <element foo="bar"/>',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var element = domutils.getOrCreateChild(rootElement, 'ns', 'element');
      assert.ok(element);
      assert.ok(element.nodeType === element.ELEMENT_NODE);
      var elementStr = pd.xml(new xmldom.XMLSerializer().serializeToString(element));
      assert.equal(elementStr, '<element foo="bar"/>');
    });

    it('create top level element', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns="http://www.example.com/">',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var element = domutils.getOrCreateChild(rootElement, 'ns', 'element');
      assert.ok(element);
      assert.ok(element.nodeType === element.ELEMENT_NODE);
      var elementStr = pd.xml(new xmldom.XMLSerializer().serializeToString(element));
      assert.equal(elementStr, '<element/>');
    });
  });

  describe('.getNextElementSibling()', function () {
    it('Get undefined when no node', function () {
      var sibling = domutils.getNextElementSibling();
      assert.equal(sibling, undefined);
    });

    it('Get null when no sibling', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns="http://www.example.com/">',
        '  <element />',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var element = domutils.getChild(rootElement, 'ns', 'element');
      assert.ok(element);
      var sibling = domutils.getNextElementSibling(element);
      assert.equal(sibling, null);
    });

    it('Get sibling when exists', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns="http://www.example.com/">',
        '  <element /><element2 />',
        '  <element3 />',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      var element = domutils.getChild(rootElement, 'ns', 'element');
      assert.ok(element);
      var sibling1 = domutils.getNextElementSibling(element);
      assert.ok(sibling1);
      assert.ok(sibling1.nodeType === sibling1.ELEMENT_NODE);
      var sibling1Str = pd.xml(new xmldom.XMLSerializer().serializeToString(sibling1));
      assert.equal(sibling1Str, '<element2/>');
      var sibling2 = domutils.getNextElementSibling(sibling1);
      assert.ok(sibling2);
      assert.ok(sibling2.nodeType === sibling2.ELEMENT_NODE);
      var sibling2Str = pd.xml(new xmldom.XMLSerializer().serializeToString(sibling2));
      assert.equal(sibling2Str, '<element3/>');
    });
  });

  describe('.setOrClearChildText()', function () {
    it('can add text to existing element', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns="http://www.example.com/">',
        '  <element />',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      domutils.setOrClearChildText(rootElement, 'ns', 'element', 'it worked');
      var element = domutils.getChild(rootElement, 'ns', 'element');
      assert.ok(element);
      assert.equal(element.textContent, 'it worked');
    });

    it('adds element if necessary', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns="http://www.example.com/">',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      domutils.setOrClearChildText(rootElement, 'ns', 'element', 'it worked');
      var element = domutils.getChild(rootElement, 'ns', 'element');
      assert.ok(element);
      assert.equal(element.textContent, 'it worked');
    });

    it('removes element when text is contra indicated', function () {
      var xmlString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Comment -->',
        '<root xmlns="http://www.example.com/">',
        '  <element />',
        '</root>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
      assert.ok(doc);
      var rootElement = doc.documentElement;
      assert.ok(rootElement);
      domutils.setOrClearChildText(rootElement, 'ns', 'element', 'it is contra indicated', 'it is contra indicated');
      var element = domutils.getChild(rootElement, 'ns', 'element');
      assert.equal(element, undefined);
    });
  });

  describe('.getFirstNodeMatchingXPath()', function () {
    it('finds element in a document using an absolute xpath', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <stuff/>',
        '  <profiles>',
        '    <profile>',
        '      <id>foo</id>',
        '      <build>',
        '        <plugins>',
        '          <plugin>this is the first wrong one</plugin>',
        '          <plugin>this is the wrong two</plugin>',
        '        </plugins>',
        '      </build>',
        '    </profile>',
        '    <profile>',
        '      <id>functional-testing</id>',
        '      <build>',
        '        <plugins>',
        '          <plugin>you found me</plugin>',
        '          <plugin>this is the other wrong one</plugin>',
        '        </plugins>',
        '      </build>',
        '    </profile>',
        '  </profiles>',
        '  <otherstuff/>',
        '</project>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(pomString, 'text/xml');
      assert.ok(doc);
      var xp = "/pom:project/pom:profiles/pom:profile[pom:id='functional-testing']/pom:build/pom:plugins/pom:plugin[1]";
      var element = domutils.getFirstNodeMatchingXPath(xp, doc);
      // console.log(pd.xml(new xmldom.XMLSerializer().serializeToString(element)));
      assert.equal(pd.xml(new xmldom.XMLSerializer().serializeToString(element)), '<plugin>you found me</plugin>');
    });

    it('finds element under an using a relative xpath', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <stuff/>',
        '  <profiles>',
        '    <profile>',
        '      <id>foo</id>',
        '      <build>',
        '        <plugins>',
        '          <plugin>this is the first wrong one</plugin>',
        '          <plugin>this is the wrong two</plugin>',
        '        </plugins>',
        '      </build>',
        '    </profile>',
        '    <profile>',
        '      <id>functional-testing</id>',
        '      <build>',
        '        <plugins>',
        '          <plugin>you found me</plugin>',
        '          <plugin>this is the other wrong one</plugin>',
        '        </plugins>',
        '      </build>',
        '    </profile>',
        '  </profiles>',
        '  <otherstuff/>',
        '</project>',
      ].join('\n');
      var doc = new xmldom.DOMParser().parseFromString(pomString, 'text/xml');
      assert.ok(doc);
      var xp1 = "/pom:project/pom:profiles/pom:profile[pom:id='functional-testing']";
      var element1 = domutils.getFirstNodeMatchingXPath(xp1, doc);
      // console.log(pd.xml(new xmldom.XMLSerializer().serializeToString(element1)));
      var xp2 = 'pom:build/pom:plugins/pom:plugin[1]';
      var element2 = domutils.getFirstNodeMatchingXPath(xp2, element1);
      // console.log(pd.xml(new xmldom.XMLSerializer().serializeToString(element2)));
      assert.equal(pd.xml(new xmldom.XMLSerializer().serializeToString(element2)), '<plugin>you found me</plugin>');
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
