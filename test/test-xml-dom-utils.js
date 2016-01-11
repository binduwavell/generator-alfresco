'use strict';

var assert = require('assert');
var chalk = require('chalk');
var inspect = require('eyes').inspector({maxLength: false});
var pd = require('pretty-data').pd;
var xmldom = require('xmldom');
var domutils = require('../app/xml-dom-utils.js');

describe('generator-alfresco:xml-dom-utils', function () {

  describe('.createChild()', function() {

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
      var element = domutils.createChild(doc, rootElement, 'ns', 'node');
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
  });

  describe('.getChild()', function() {

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
  });

  describe('.removeChild()', function() {

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

  describe('.removeParentsChild()', function() {

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

  describe('.getOrCreateChild()', function() {

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
      var element = domutils.getOrCreateChild(doc, rootElement, 'ns', 'element');
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
      var element = domutils.getOrCreateChild(doc, rootElement, 'ns', 'element');
      assert.ok(element);
      assert.ok(element.nodeType === element.ELEMENT_NODE);
      var elementStr = pd.xml(new xmldom.XMLSerializer().serializeToString(element));
      assert.equal(elementStr, '<element/>');
    });
  });

  describe('.getNextElementSibling()', function() {

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

});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
