'use strict';
var _ = require('lodash');
var debug = require('debug')('generator-alfresco:prompt-filters');

/**
 * These filters are used to check if an option has been provided, in which case
 * a non-undefined value must be returned. They are also used to process user
 * input in the form. If we return undefined that means that the value was
 * invalid.
 *
 * For filter functions that take more than one argument we provide a Factory
 * alternative that takes all of the arguments except the input and returns
 * a function that takes the input and in order to call the original filter
 * with the input and the captured arguments.
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
  booleanFilter: function (input) {
    debug('booleanFilter(%s)', input);
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
  booleanTextFilter: function (input) {
    debug('booleanTextFilter(%s)', input);
    var retv = module.exports.booleanFilter(input);
    return (retv === undefined
           ? undefined
           : (retv === false
             ? 'false'
             : 'true'));
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
    debug('chooseOneFilter(%s, %s)', input, JSON.stringify(list));
    if (input === true) return undefined;
    if (_.isString(input)) {
      if (_.isEmpty(input)) return undefined;
      var ilc = input.toLocaleLowerCase();
      for (var idx = 0; idx < list.length; idx++) {
        var item = list[idx];
        if (item.toLocaleLowerCase() === ilc) return item;
      }
    }
    return undefined;
  },
  chooseOneFilterFactory: function (list) {
    return function (input) {
      return module.exports.chooseOneFilter(input, list);
    };
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
    debug('chooseOneStartsWithFilter(%s, %s)', input, JSON.stringify(list));
    if (input === true) return undefined;
    var retv;
    if (_.isString(input)) {
      if (input === '') return undefined;
      var ilc = input.toLocaleLowerCase();
      _.forEach(list, function (item) {
        var it = item.toLocaleLowerCase();
        if (_.startsWith(it, ilc)) retv = retv || item;
        if (it === ilc) retv = item;
      });
    }
    return retv;
  },
  chooseOneStartsWithFilterFactory: function (list) {
    return function (input) {
      return module.exports.chooseOneStartsWithFilter(input, list);
    };
  },

  /**
   * Check if input exists as a key or value in a map in a case insensitive
   * manner. Will return the value from value from the map rather than the
   * user input so the values in the map can control the final case.
   *
   * NOTE 1: The map may not contain, undefined, null or the empty string.
   * NOTE 2: If there are multiple matches, the first one wins.
   *
   * @param {(string|boolean|undefined|null)} input
   * @param {Object.<string, string>} map
   * @returns {(string|undefined)}
   */
  chooseOneMapFilter: function (input, map) {
    debug('chooseOneMapFilter(%s, %s)', input, JSON.stringify(map));
    if (input === true) return undefined;
    var retv;
    if (_.isString(input)) {
      if (_.isEmpty(input)) return undefined;
      var ilc = input.toLocaleLowerCase();
      _.forOwn(map, function (value, key) {
        if (retv) return;
        var kit = key.toLocaleLowerCase();
        var vit = value.toLocaleLowerCase();
        if (kit === ilc) retv = value;
        if (vit === ilc) retv = value;
      });
    }
    return retv;
  },
  chooseOneMapFilterFactory: function (map) {
    return function (input) {
      return module.exports.chooseOneMapFilter(input, map);
    };
  },

  /**
   * Check if any keys in the map start with the input in a case insensitive
   * manner. Will return the value from the map rather than the user input so
   * the map can control the final case. If there is an exact case insensitive
   * match to a value, the value will be returned.
   *
   * NOTE 1: The map may not contain, undefined, null or the empty string.
   * NOTE 2: If there are multiple partial matches, the first one wins.
   * NOTE 3: If there is an exact match, it will be returned even if there is
   *         a prior partial match.
   * NOTE 4: If there are multiple exact matches (e.g. duplicate values) then
   *         the last exact match will be returned.
   *
   * @param {(string|boolean|undefined|null)} input
   * @param {Object.<string, string>} map
   * @returns {(string|undefined)}
   */
  chooseOneMapStartsWithFilter: function (input, map) {
    // TODO(bwavell): write tests
    debug('chooseOneMapStartsWithFilter(%s, %s)', input, JSON.stringify(map));
    if (input === true) return undefined;
    var retv;
    if (_.isString(input)) {
      if (input === '') return undefined;
      var ilc = input.toLocaleLowerCase();
      _.forOwn(map, function (value, key) {
        var kit = key.toLocaleLowerCase();
        var vit = value.toLocaleLowerCase();
        if (_.startsWith(kit, ilc)) retv = retv || value;
        if (kit === ilc) retv = value;
        if (vit === ilc) retv = value;
      });
    }
    return retv;
  },
  chooseOneMapStartsWithFilterFactory: function (map) {
    // TODO(bwavell): write tests
    return function (input) {
      return module.exports.chooseOneMapStartsWithFilter(input, map);
    };
  },

  /**
   * Given some text or the empty string return it.
   * If we receive true return empty string.
   * If we receive a number convert it to a string and return it.
   * Otherwise return undefined.
   *
   * @param {(string|boolean|number|undefined|null)} input
   * @returns {(string|undefined)}
   */
  optionalTextFilter: function (input) {
    debug('optionalTextFilter(%s)', input);
    if (_.isString(input)) return input;
    if (_.isBoolean(input)) return (input ? '' : undefined);
    if (_.isNumber(input)) return '' + input;
    return undefined;
  },

  /**
   * Given some none empty text return it.
   * If we receive a number convert it to a string and return it.
   * Otherwise return undefined.
   *
   * @param {(string|boolean|undefined|null)} input
   * @returns {(string|undefined)}
   */
  requiredTextFilter: function (input) {
    debug('requiredTextFilter(%s)', input);
    if (_.isString(input) && !_.isEmpty(input)) return input;
    if (_.isNumber(input)) return '' + input;
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
  requiredTextListFilter: function (input, sep, choices) {
    debug('requiredTextListFilter(%s, %s, %s)', input, sep, (choices ? JSON.stringify(choices) : 'undefined'));
    // if we already have a list, just return it. We may
    // want to add validation that the items are in the
    // choices list
    if (_.isArray(input) && input.length > 0) return input;
    if (!_.isString(input)) return undefined;
    var retv = input.split(new RegExp('s*\\' + sep + '\\s*'));
    // remove any empty input items
    retv = retv.filter(function (r) {
      return (!_.isEmpty(r));
    });
    // If a choice list is provided we will return only items
    // that match the choice in a case insensitive way, using
    // whatever case is provided in the choice list.
    if (choices !== undefined) {
      var lcretv = retv.map(function (lc) {
        return lc.toLocaleLowerCase();
      });
      retv = choices.filter(function (c) {
        return (lcretv.indexOf(c.toLocaleLowerCase()) > -1);
      });
    }
    if (_.isEmpty(retv)) return undefined;
    return retv;
  },
  requiredTextListFilterFactory: function (sep, choices) {
    return function (input) {
      return module.exports.requiredTextListFilter(input, sep, choices);
    };
  },

  /**
   * Given some input text, a separator and a list of choices, we
   * split the input using the separator. We remove any empty items
   * from the list.
   *
   * We provide all choices that start-with in a case-insensitive
   * manner one of the inputs. We return in the order provided in
   * the choices list and using the case provided in the choices list.
   *
   * An empty list is not allowed (undefined will be returned.)
   *
   * @param input
   * @param sep
   * @param choices
   * @returns {(string[]|undefined)}
   */
  requiredTextStartsWithListFilter: function (input, sep, choices) {
    debug('requiredTextStartsWithListFilter(%s, %s, %s)', input, sep, (choices ? JSON.stringify(choices) : 'undefined'));
    // if we already have a list, just return it. We may
    // want to add validation that the items are in the
    // choices list
    if (_.isArray(input) && input.length > 0) return input;
    if (choices === undefined) return undefined;
    if (!_.isString(input)) return undefined;
    var inputs = input.split(new RegExp('s*\\' + sep + '\\s*'));
    // remove any empty input items
    inputs = inputs.filter(function (i) {
      return (!_.isEmpty(i));
    });
    var lcis = inputs.map(function (i) {
      return i.toLocaleLowerCase();
    });
    var retv = choices.filter(function (c) {
      var lc = c.toLocaleLowerCase();
      return (_.find(lcis, function (li) {
        return (_.startsWith(lc, li));
      }) !== undefined);
    });
    if (_.isEmpty(retv)) return undefined;
    return retv;
  },
  requiredTextStartsWithListFilterFactory: function (sep, choices) {
    return function (input) {
      return module.exports.requiredTextStartsWithListFilter(input, sep, choices);
    };
  },

  /**
   * Given some none empty text return it.
   * If the text starts with "VERSION-", remove that text
   *   This is a stupid hack because Yeoman is messing
   *   with our numeric options.
   * If we receive a number convert it to a string and return it.
   * Otherwise return undefined.
   *
   * @param {(string|boolean|undefined|null)} input
   * @returns {(string|undefined)}
   */
  requiredVersionFilter: function (input) {
    debug('requiredTextFilter(%s)', input);
    if (_.isString(input) && !_.isEmpty(input)) {
      if (_.startsWith(input, 'VERSION-')) {
        return input.substr(8);
      }
      return input;
    }
    if (_.isNumber(input)) return '' + input;
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
   * An empty list is possible
   *
   * @param input
   * @param sep
   * @param choices
   * @returns {(string[]|undefined)}
   */
  textListFilter: function (input, sep, choices) {
    debug('textListFilter(%s, %s, %s)', input, sep, (choices ? JSON.stringify(choices) : 'undefined'));
    // if we already have a list, just return it. We may
    // want to add validation that the items are in the
    // choices list
    if (_.isArray(input)) return input;
    if (input === true) return [];
    if (!_.isString(input)) return undefined;
    var retv = input.split(new RegExp('s*\\' + sep + '\\s*'));
    // remove any empty input items
    retv = retv.filter(function (r) {
      return (!_.isEmpty(r));
    });
    // If a choice list is provided we will return only items
    // that match the choice in a case insensitive way, using
    // whatever case is provided in the choice list.
    if (choices !== undefined) {
      var lcretv = retv.map(function (lc) {
        return lc.toLocaleLowerCase();
      });
      retv = choices.filter(function (c) {
        return (lcretv.indexOf(c.toLocaleLowerCase()) > -1);
      });
    }
    return retv;
  },
  textListFilterFactory: function (sep, choices) {
    return function (input) {
      return module.exports.textListFilter(input, sep, choices);
    };
  },

  /**
   * Given some input text and a array of filters,
   * we sequentially apply the filters to get the final value
   *
   * @param filterArray
   * @returns function
   */
  sequentialFilterFactory: function (filterArray) {
    return function (input) {
      return filterArray.reduce(function (previousValue, filter) {
        return filter.call(this, previousValue);
      }.bind(this), input);
    };
  },
};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
