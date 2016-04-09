'use strict';
var pd = require('pretty-data').pd;
var xmldom = require('xmldom');
var xpath = require('xpath');

module.exports = {

  resolver: {
    mappings: {
      'ns': 'http://www.example.com/',
      'pom': 'http://maven.apache.org/POM/4.0.0',
      'xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    },
    lookupNamespaceURI: function (prefix) {
      return this.mappings[prefix];
    },
  },

  /**
   * Given a string representation of some XML, parse the string and return the
   * associated DOM.
   *
   * @param {string} xmlString
   * @returns {Document} the parsed xml document
   */
  parseFromString: function (xmlString) {
    var doc = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
    return doc;
  },

  /**
   * Create an element and add it to the given node in the given document
   *
   * @param {!Node} node
   * @param {string} ns
   * @param {string} tag
   * @param {boolean} addFirstChild - default to false
   * @returns {Element}
     */
  createChild: function (node, ns, tag, addFirstChild) {
    var addFirst = addFirstChild || false;
    var doc = node.ownerDocument;
    var child = doc.createElementNS(this.resolver.lookupNamespaceURI(ns), tag);
    if (addFirst && node.hasChildNodes()) {
      node.insertBefore(child, node.childNodes[0]);
    } else {
      node.appendChild(child);
    }
    return child;
  },

  /**
   * Given a node, find a child with a given namespace and tag. Returns undefined if the child is not found.
   *
   * @param {!Node} node
   * @param {string} ns
   * @param {string} tag
   * @returns {(Element|undefined)}
   */
  getChild: function (node, ns, tag) {
    if (!node || !ns || !tag) throw new Error('All parameters to xml-dom-utils:getChild() are required');
    var child = this.getFirstNodeMatchingXPath(ns + ':' + tag, node);
    return child;
  },

  /**
   * If we find a node with the given namespace and tag as a child of the the given node, we remove
   * the child.
   *
   * @param {!Node} node
   * @param {string} ns
   * @param {string} tag
   * @returns {undefined}
   */
  removeChild: function (node, ns, tag) {
    var child = this.getChild(node, ns, tag);
    if (child) {
      var parent = child.parentNode;
      if (parent) {
        parent.removeChild(child);
      }
    }
  },

  /**
   * Assuming parent is the parent of child, child is removed from parent.
   *
   * @param {!Node} parent
   * @param {!Node} child
   * @returns {undefined}
   */
  removeParentsChild: function (parent, child) {
    if (parent && child && parent === child.parentNode) {
      parent.removeChild(child);
    }
  },

  /**
   * Find a child with the given namespace and tag within the given node, if not found, we create such a child.
   *
   * @param {!Node} node
   * @param {string} ns
   * @param {string} tag
   * @returns {Element}
   */
  getOrCreateChild: function (node, ns, tag) {
    if (!node || !ns || !tag) throw new Error('All parameters to xml-dom-utils:getOrCreateChild() are required');
    var child = this.getFirstNodeMatchingXPath(ns + ':' + tag, node);
    if (!child) {
      var doc = node.ownerDocument;
      child = doc.createElementNS(this.resolver.lookupNamespaceURI(ns), tag);
      node.appendChild(child);
    }
    return child;
  },

  /**
   * Given a textual value that is not contra indicated, we make sure we have a child with the given text.
   * If the text is empty or is contra indicated we make sure there is no child.
   *
   * @param {!Node} node
   * @param {string} ns
   * @param {string} tag
   * @param {(string|undefined)} text
   * @param {(string|undefined)} contraIndicatedText
   * @returns {undefined}
   */
  setOrClearChildText: function (node, ns, tag, text, contraIndicatedText) {
    // console.log('setOrClearChildText(' + (node ? 'node' : 'undefined') + ',' + ns + ':' + tag + ')');
    if (!node || !ns || !tag) throw new Error('All parameters except text and contraIndicatedText to xml-dom-utils:setOrClearChildText() are required');
    if (text && text !== contraIndicatedText) {
      var child = this.getChild(node, ns, tag);
      if (!child) {
        child = this.getOrCreateChild(node, ns, tag);
      }
      child.textContent = text;
    } else {
      this.removeChild(node, ns, tag);
    }
  },

  /**
   * Given a node, search through subsequent siblings until we find an element
   *
   * @param {!Node} node
   * @returns {(Node|undefined)}
   */
  getNextElementSibling: function (node) {
    if (!node) return undefined;
    var next = node;
    do {
      next = next.nextSibling;
    } while (next && next.nodeType !== next.ELEMENT_NODE);
    return next;
  },

  /**
   * Attempts to find the first item matching the provided xpath expression
   * starting from the provided document or element.
   *
   * @param {string} xpath
   * @param {!(Document|Element)} docOrElement
   * @returns {?*}
   */
  getFirstNodeMatchingXPath: function (expression, docOrElement) {
    var match = xpath.selectWithResolver(expression, docOrElement, this.resolver, true);
    return match;
  },

  /**
   * Attempts to find stuff matching the provided xpath expression
   * starting from the provided document or element.
   *
   * @param {string} xpath
   * @param {!(Document|Element)} docOrElement
   * @returns {?*}
   */
  selectMatchingXPath: function (expression, docOrElement) {
    var matches = xpath.selectWithResolver(expression, docOrElement, this.resolver, false);
    return matches;
  },

  /**
   * Given a dom object, produce a pretty printed xml representation as a string.
   *
   * @param {!Document} doc
   * @returns {(string|undefined}}
     */
  prettyPrint: function (doc) {
    return pd.xml(new xmldom.XMLSerializer().serializeToString(doc));
  },

  /**
   * Given an attribute a value and a separator add the value to the attribute
   * value. If there is an existing value use the separator.
   *
   * @param {!Attr} attr
   * @param {string} value
   * @param {string} sep
   * @returns {undefined}
   */
  // TODO(bwavell): add tests for this
  appendToAttributeValueList: function (attr, value, sep) {
    var val = attr.value;
    if (val && val.length > 0) {
      val = val + sep + value;
    } else {
      val = value;
    }
    attr.value = val;
  },

  /**
   * Given an attribute a value and a separator, split the attribute using the
   * separator and see if you can find the value, if so, remove it and put the
   * list back together with the separator.
   *
   * @param {!Attr} attr
   * @param {string} value
   * @param {string} sep
   * @returns {undefined}
   */
  // TODO(bwavell): add tests for this
  removeFromAttributeValueList: function (attr, value, sep) {
    var re = new RegExp('\\s*' + sep + '\\s*');
    var list = attr.value.split(re);
    var idx = list.indexOf(value);
    if (idx > -1) {
      list.splice(idx, 1);
    }
    attr.value = list.join(sep);
  },

};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
