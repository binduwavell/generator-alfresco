'use strict';

//
// A very simple templating engine that uses regular expressions to find
// and replace values with a specific prefix and suffix. By default the
// prefix and suffix are both "@@".
//
// The name of this module is is a portmanteau of the words regular-expression
// and template : regu[lar-expression] + [temp]late = regulate.
//
module.exports = {
  render: function(template, context, options) {
    var options = options || {};
    var prefix = options.prefix || '@@';
    var suffix = options.suffix || '@@';
    Object.keys(context).forEach(function(key) {
      var val = context[key];
      var re = new RegExp(prefix + key + suffix, 'g');
      template = template.replace(re, val)
    });
    return template;
  }
}
