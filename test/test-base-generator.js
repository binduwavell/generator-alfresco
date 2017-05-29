'use strict';
/* eslint-env node, mocha */
let assert = require('yeoman-assert');
let helpers = require('yeoman-test');
let os = require('os');
let path = require('path');
let BaseGenerator = require('../generators/base-generator.js');
let filters = require('generator-alfresco-common').prompt_filters;

let state = { };

class TestGenerator extends BaseGenerator {
  constructor (args, opts) {
    super(args, opts);

    this.prompts = [
      {
        type: 'input',
        name: 'myargument',
        argument: { name: 'myargument', config: { required: false, type: String } },
        when: false,
        message: 'What is the value of your argument?',
        commonFilter: filters.optionalTextFilter,
        valueRequired: false,
      },
      {
        type: 'input',
        name: 'myprompt',
        option: { name: 'myprompt', config: { alias: 'p', desc: 'Prompt item', type: String } },
        when: function () {
          return true;
        },
        message: 'What is the value of your prompt?',
        commonFilter: filters.requiredTextFilter,
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'bail',
        option: { name: 'bail', config: { alias: 'b', desc: 'Bail item', type: String } },
        when: function (readonlyProps) {
          if (readonlyProps.myprompt === 'bail') {
            this.bail = true;
          }
          return true;
        },
        message: 'What is the value of your bail?',
        commonFilter: filters.optionalTextFilter,
        valueRequired: false,
      },
      {
        type: 'input',
        name: 'bailed',
        option: { name: 'bailed', config: { alias: 'B', desc: 'Bail item', type: String } },
        message: 'What is the value of your bailed?',
        commonFilter: filters.optionalTextFilter,
        valueRequired: false,
      },
    ];

    this.setupArgumentsAndOptions(this.prompts);
  }

  prompting () {
    return this.subgeneratorPrompt(this.prompts, 'base-generator-mock', function (props) {
      state.generator = this;
      state.bail = this.bail;
      state.myargument = props.myargument;
      state.myprompt = props.myprompt;
    });
  }
};

describe('generator-alfresco:base-generator', function () {
  this.timeout(300);
  let osTempDir = path.join(os.tmpdir(), 'temp-test');

  describe('withOptions', function () {
    // We need a test project setup before we begin
    before(function () {
      return helpers.run(TestGenerator)
        .inDir(osTempDir)
        .withArguments(['my-argument'])
        .withOptions({'myprompt': 'option value'})
        .toPromise();
    });

    it('handles option values', function () {
      assert.equal(state.bail, false);
      assert.equal(state.myargument, 'my-argument');
      assert.equal(state.myprompt, 'option value');
    });

    it('sets appropriate filter function', function () {
      let myprompt = state.generator.processedPrompts[1];
      assert.ok(myprompt.hasOwnProperty('filter'));
      let filter = myprompt.filter;
      let v = filter('');
      assert.equal(v, undefined);
      v = filter(123);
      assert.equal(v, '123');
    });

    it('sets appropriate validate function', function () {
      let myprompt = state.generator.processedPrompts[1];
      assert.ok(myprompt.hasOwnProperty('validate'));
      let validate = myprompt.validate;
      let v = validate('');
      assert.equal(v, 'The required \u001b[33mmyprompt\u001b[39m value is missing or invalid');
      v = validate('a value');
      assert.equal(v, true);
    });

    it('uses validate invalidMessage string for generated validate function', function () {
      let origprompt = state.generator.prompts[1];
      let myprompt = state.generator.processedPrompts[1];
      assert.ok(myprompt.hasOwnProperty('validate'));
      let validate = myprompt.validate;
      origprompt.invalidMessage = 'Bad stuff';
      let v = validate('');
      delete origprompt.invalidMessage;
      assert.equal(v, 'Bad stuff');
    });

    it('uses validate invalidMessage function for generated validate function', function () {
      let origprompt = state.generator.prompts[1];
      let myprompt = state.generator.processedPrompts[1];
      assert.ok(myprompt.hasOwnProperty('validate'));
      let validate = myprompt.validate;
      origprompt.invalidMessage = function () {
        return 'Your input is bad';
      };
      let v = validate('');
      delete origprompt.invalidMessage;
      assert.equal(v, 'Your input is bad');
    });
  });

  describe('withPrompts', function () {
    // We need a test project setup before we begin
    before(function () {
      return helpers.run(TestGenerator)
        .inDir(osTempDir)
        .withArguments(['your-argument'])
        .withPrompts({'myprompt': 'prompt value'})
        .toPromise();
    });

    it('handles prompt values', function () {
      assert.equal(state.bail, false);
      assert.equal(state.myargument, 'your-argument');
      assert.equal(state.myprompt, 'prompt value');
    });
  });

  describe('when bailing', function () {
    // We need a test project setup before we begin
    before(function () {
      state.myprompt = 'not overridden when we bail';
      return helpers.run(TestGenerator)
        .inDir(osTempDir)
        .withPrompts({'myprompt': 'bail'})
        .toPromise();
    });

    it('does not run prompting result function', function () {
      assert.equal(state.myprompt, 'not overridden when we bail');
    });
  });

  describe('when required property not set', function () {
    // We need a test project setup before we begin
    before(function () {
      state.myprompt = 'not overridden when required property not set';
      return helpers.run(TestGenerator)
        .inDir(osTempDir)
        .toPromise();
    });

    it('handles prompt values', function () {
      assert.equal(state.myprompt, 'not overridden when required property not set');
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
