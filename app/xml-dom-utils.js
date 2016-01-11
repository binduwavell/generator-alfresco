'use strict';
var xmldom = require('xmldom');
var xpath = require('xpath');

module.exports = {

  resolver: {
    mappings: {
      "ns": "http://www.example.com/",
      "pom": "http://maven.apache.org/POM/4.0.0",
      "xsi": "http://www.w3.org/2001/XMLSchema-instance"
    },
    lookupNamespaceURI: function(prefix) {
      return this.mappings[prefix];
    }
  },

  createChild: function(doc, node, ns, tag) {
    var child = doc.createElementNS(this.resolver.lookupNamespaceURI(ns), tag);
    node.appendChild(child);
    return child;
  },

  getChild: function(node, ns, tag) {
    var child = xpath.selectWithResolver(ns + ':' + tag, node, this.resolver, true);
    return child;
  },

  removeChild: function(node, ns, tag) {
    var child = this.getChild(node, ns, tag)
    if (child) {
      var parent = child.parentNode;
      if (parent) {
        parent.removeChild(child);
      }
    }
  },

  removeParentsChild: function(parent, child) {
    if (parent && child && parent == child.parentNode) {
      parent.removeChild(child);
    }
  },

  getOrCreateChild: function(doc, node, ns, tag) {
    var child = xpath.selectWithResolver(ns + ':' + tag, node, this.resolver, true);
    if (!child) {
      child = doc.createElementNS(this.resolver.lookupNamespaceURI(ns), tag);
      node.appendChild(child);
    }
    return child;
  },

  getNextElementSibling: function(node) {
    if (!node) return undefined;
    var next = node;
    do {
      next = next.nextSibling;
    } while (next && next.nodeType !== next.ELEMENT_NODE);
    return next;
  }

};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
