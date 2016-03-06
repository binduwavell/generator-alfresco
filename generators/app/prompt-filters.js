'use strict';
var _ = require('lodash');

/**
 * These filters are used to check if an option has been provided, in which case
 * a non-undefined value must be returned. They are also used to process user
 * input in the form. If we return undefined that means that the value was
 * invalid.
 */

module.exports = {

  /**
   * If we are given a boolean value return it.
   * If we are given a string with the value 'false' return false
   * If we are given a string with the value 'true' return true
   * Otherwise return undefined
   *
   * @param {(boolean|string|undefined|null)} input
   * @returns {(true|false|undefined)}
   */
  booleanFilter: function(input) {
    if (_.isBoolean(input)) return input;
    if (_.isString(input)) {
      var lc = input.toLocaleLowerCase();
      var pos = ['false', 'true'].indexOf(lc);
      if (pos > -1) return (pos > 0);
    }
    return undefined;
  },

  /**
   * Same as booleanFilter but but return 'true' and 'false'
   * in place of true and false respectively.
   *
   * @param {(boolean|string|undefined|null)} input
   * @returns {('true'|'false'|undefined)}
     */
  booleanTextFilter: function(input) {
    var retv = this.booleanFilter(input);
    return (undefined === retv
           ? undefined
           : (false === retv
             ? 'false'
             : 'true'))
  },

  /**
   * Check if input exists in list in a case insensitive manner. Will return
   * the value from the list rather than the user input so the list can control
   * the final case.
   *
   * NOTE 1: The list may not contain, undefined, null or the empty string.
   * NOTE 2: If there are multiple matches, the first one wins.
   *
   * @param {(string|boolean|undefined|null)} input
   * @param {string[]} list
   * @returns {(string|undefined)}
     */
  chooseOneFilter: function (input, list) {
    if (true === input) return undefined;
    var retv = undefined;
    if (_.isString(input)) {
      if ('' === input) return undefined;
      var i = input.toLocaleLowerCase();
      list.forEach(function(item) {
        var ilc = item.toLocaleLowerCase();
        if (ilc === i) retv = item;
      });
    }
    return retv;
  },

  /**
   * Check if any items in the list start with the input in a case insensitive
   * manner. Will return the value from the list rather than the user input so
   * the list can control the final case.
   *
   * NOTE 1: The list may not contain, undefined, null or the empty string.
   * NOTE 2: If there are multiple partial matches, the first one wins.
   * NOTE 3: If there is an exact match, it will be returned even if there is
   *         a prior partial match.
   *
   * @param {(string|boolean|undefined|null)} input
   * @param {string[]} list
   * @returns {(string|undefined)}
   */
  chooseOneStartsWithFilter: function (input, list) {
    if (true === input) return undefined;
    var retv = undefined;
    if (_.isString(input)) {
      if ('' === input) return undefined;
      var i = input.toLocaleLowerCase();
      list.forEach(function(item) {
        var ilc = item.toLocaleLowerCase();
        if (_.startsWith(ilc, i)) retv = retv || item;
        if (ilc === i) retv = item;
      });
    }
    return retv;
  },

  /**
   * Given some text or the empty string return it.
   * If we receive true return empty string.
   * Otherwise return undefined.
   *
   * @param {(string|boolean|undefined|null)} input
   * @returns {(string|undefined)}
   */
  optionalTextFilter: function(input) {
    if (_.isString(input)) return input;
    if (_.isBoolean(input)) return (input ? '' : undefined);
    return undefined;
  },

  /**
   * Given some none empty text return it.
   * Otherwise return undefined.
   *
   * @param {(string|boolean|undefined|null)} input
   * @returns {(string|undefined)}
   */
  requiredTextFilter: function(input) {
    if (_.isString(input) && !_.isEmpty(input)) return input;
    return undefined;
  },

  /**
   * Given some input text, a separator and an optional list of
   * choices, we split the input using the separator. We remove
   * any empty items from the list.
   *
   * If choices are provided then we only provide values that
   * match the choices in a case insensitive way and we return
   * in the order provided in the choices list and using the
   * case provided in the choices list.
   * 
   * An empty list is not allowed (undefined will be returned.)
   *
   * @param input
   * @param sep
   * @param choices
   * @returns {(string[]|undefined)}
   */
  requiredTextListFilter: function(input, sep, choices) {
    if (undefined === input || null === input || true == input) return undefined;
    var retv = input.split(new RegExp('s*\\' + sep + '\\s*'));
    // remove any empty input items
    retv = retv.filter(function(r) {
      return (!_.isEmpty(r));
    });
    // If a choice list is provided we will return only items
    // that match the choice in a case insensitive way, using
    // whatever case is provided in the choice list.
    if (undefined != choices) {
      var lcretv = retv.map(function(lc) {
        return lc.toLocaleLowerCase();
      });
      retv = choices.filter(function(c) {
        return (lcretv.indexOf(c.toLocaleLowerCase()) > -1)
      });
    }
    if (0 === retv.length) retv = undefined;
    return retv;
  },

  /**
   * Given some input text, a separator and an optional list of
   * choices, we split the input using the separator. We remove
   * any empty items from the list.
   *
   * If choices are provided then we only provide values that
   * match the choices in a case insensitive way and we return
   * in the order provided in the choices list and using the
   * case provided in the choices list.
   * 
   * An empty list is possible
   *
   * @param input
   * @param sep
   * @param choices
   * @returns {(string[]|undefined)}
   */
  textListFilter: function(input, sep, choices) {
    if (undefined === input || null === input) return undefined;
    if (true === input) return [];
    var retv = input.split(new RegExp('s*\\' + sep + '\\s*'));
    // remove any empty input items
    retv = retv.filter(function(r) {
      return (!_.isEmpty(r));
    });
    // If a choice list is provided we will return only items
    // that match the choice in a case insensitive way, using
    // whatever case is provided in the choice list.
    if (undefined != choices) {
      var lcretv = retv.map(function(lc) {
        return lc.toLocaleLowerCase();
      });
      retv = choices.filter(function(c) {
        return (lcretv.indexOf(c.toLocaleLowerCase()) > -1)
      });
    }
    return retv;
  }

};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
