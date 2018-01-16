'use strict';
const _ = require('lodash');
const chalk = require('chalk');
const debug = require('debug')('generator-alfresco:dashlet');
const path = require('path');
const trace = require('debug')('generator-alfresco-trace:dashlet');
const constants = require('generator-alfresco-common').constants;
const filters = require('generator-alfresco-common').prompt_filters;
const SourceSelectingSubGenerator = require('../source-selecting-subgenerator');

const FRAMEWORK = ['surf', 'aikau'];
const FAMILY = ['user-dashlet', 'site-dashlet', 'dashlet'];

class DashletSubGenerator extends SourceSelectingSubGenerator {
  constructor (args, opts) {
    trace('constructor');
    opts[constants.PROP_WAR] = constants.WAR_TYPE_SHARE;
    super(args, opts);

    this.out.docs(
      'The Share web application has a special page called Dashboard, which contains windows of content called Dashlets. Currently most of these Dashlets are Spring Surf Dashlets, but they will eventually be converted to Aikau Dashlets.',
      'http://docs.alfresco.com/5.1/concepts/dev-extensions-share-aikau-dashlets.html');

    const defPackage = packageFilter(this.config.get(constants.PROP_PROJECT_PACKAGE));

    this.prompts = [
      {
        type: 'input',
        name: 'kind',
        option: { name: 'kind', config: { alias: 'k', desc: 'Fully qualified kind for webscript', type: String } },
        when: () => {
          this.out.docs(
            'Different kinds of web scripts can be created. When this attribute is specified it allows a web script kind other than the default to be specified. An example kind is org.alfresco.repository.content.stream. This kind of web script returns a binary stream from the repository back to the client. This might be useful for returning a thumbnail binary to the client for example. It is also possible to create additional web script kinds according to your needs.',
            'http://docs.alfresco.com/5.1/references/api-wsdl-webscript.html');
          return true;
        },
        message: 'What <webscript ' + chalk.yellow('@kind') + '> would you like to create?',
        commonFilter: filters.optionalTextFilter,
        valueRequired: false,
      },
      {
        type: 'input',
        name: 'id',
        option: { name: 'id', config: { alias: 'i', desc: 'Dashlet id', type: String } },
        when: () => {
          this.out.docs(
            'Creating a Surf Dashlet is the same thing as creating a Surf Web Script. The dashlet id identifies the dashlet and must be unique within a package.',
            'http://docs.alfresco.com/5.1/concepts/dev-extensions-share-surf-web-scripts.html');
          return true;
        },
        message: 'What ' + chalk.yellow('dashlet id') + ' should we use?',
        invalidMessage: 'The ' + chalk.yellow('dashlet id') + ' value is required',
        commonFilter: idFilter,
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'package',
        option: { name: 'package', config: { alias: 'p', desc: 'Dashlet package', type: String } },
        when: () => {
          this.out.docs(
            'A dashlet is uniquely identified by its web script package and web script ID.',
            'http://docs.alfresco.com/5.1/concepts/dev-extensions-share-surf-web-scripts.html');
          return true;
        },
        default: defPackage,
        message: 'Provide a ' + chalk.green('/') + ' separated ' + chalk.yellow('package') + ' for your webscript(s)',
        invalidMessage: 'The ' + chalk.yellow('package') + ' is required',
        commonFilter: packageFilter,
        valueRequired: true,
      },
      {
        type: 'list',
        name: 'framework',
        option: { name: 'framework', config: { alias: 'fw', desc: 'Framework for the dashlet: aikau or surf', type: String } },
        choices: FRAMEWORK,
        message: 'Which framework would you like to develop your dashlet in?',
        commonFilter: filters.chooseOneMapStartsWithFilterFactory({aikau: 'aikau', surf: 'surf'}),
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'shortname',
        option: { name: 'shortname', config: { alias: 's', desc: 'Shortname for dashlet', type: String } },
        when: () => {
          this.out.docs(
            'The shortname element in a web descriptor file provides a human readable name for the web script. The shortname element is required.',
            'http://docs.alfresco.com/5.1/references/api-wsdl-shortname.html');
          return true;
        },
        message: 'What ' + chalk.yellow('<shortname>') + ' should we use?',
        invalidMessage: 'The ' + chalk.yellow('shortname') + ' element is required',
        commonFilter: filters.requiredTextFilter,
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'description',
        option: { name: 'description', config: { alias: 'd', desc: 'Description for webscript', type: String } },
        when: () => {
          this.out.docs(
            'The description element in a web descriptor file provides documentation for the web script. The description element is optional.',
            'http://docs.alfresco.com/5.1/references/api-wsdl-description.html');
          return true;
        },
        message: 'What ' + chalk.yellow('<description>') + ' should we use?',
        commonFilter: filters.optionalTextFilter,
        valueRequired: false,
      },
      {
        type: 'list',
        name: 'family',
        option: { name: 'family', config: { alias: 'fm', desc: 'Family of the web-script descriptor: user-dashlet, site-dashlet or dashlet', type: String } },
        choices: FAMILY,
        message: 'Which family would you like to chose?',
        commonFilter: filters.chooseOneMapStartsWithFilterFactory({'user-dashlet': 'user-dashlet', 'site-dashlet': 'site-dashlet', 'dashlet': 'dashlet'}),
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'urlTemplates',
        option: { name: 'url-templates', config: { alias: 'u', desc: 'Vertical bar \'|\' separated list of url templates', type: String } },
        when: () => {
          this.out.docs(
            'The url element represents a URI template to which the web script is bound. Variants of the URI template which specify a format do not need to be registered, however, specifying them is useful for documentation purposes. There must be at least one url element, but there can be several.',
            'http://docs.alfresco.com/5.1/references/api-wsdl-url.html');
          this.out.docs(undefined,
            'http://docs.alfresco.com/5.1/concepts/ws-anatomy.html');
          this.out.docs(undefined,
            'http://docs.alfresco.com/5.1/concepts/ws-uri-template.html');
          return true;
        },
        message: 'Provide a ' + chalk.green('|') + ' separated list of ' + chalk.yellow('<url>') + ' values',
        invalidMessage: 'At least one ' + chalk.yellow('url') + ' is required',
        commonFilter: urlTemplatesFilter,
        valueRequired: true,
      },
      {
        type: 'list',
        name: 'cacheNever',
        option: { name: 'cache-never', config: { alias: 'C', desc: 'Disable caching, pass false to enable caching', type: Boolean } },
        when: () => {
          this.out.docs('Specifies whether caching should be applied at all. Valid values, which are optional, are as follows:');
          this.out.definition('true', '(default) specifies the web script response should never be cached.');
          this.out.definition('false', 'specifies the web script response can be cached.');
          this.out.docs(undefined, 'http://docs.alfresco.com/5.1/references/api-wsdl-cache.html');
          this.out.docs(undefined, 'http://docs.alfresco.com/5.1/concepts/ws-caching-about.html');
          return true;
        },
        choices: ['true', 'false'],
        message: 'Should we disable all response caching?',
        commonFilter: filters.booleanTextFilter,
        valueRequired: true,
      },
      {
        // TODO(bwavell): Validate that the default is false as the docs are inconsistent
        type: 'list',
        name: 'cachePublic',
        option: { name: 'cache-public', config: { alias: 'P', desc: 'Allow public caching', type: Boolean } },
        when: readonlyProps => {
          const never = (readonlyProps.cacheNever || this.answerOverrides.cacheNever);
          if (never === 'false') {
            this.out.docs('Specifies whether authneticated responses should be cached in the public cache. Valid values, which are optional, are as follows:');
            this.out.definition('false', '(default) specifies the web script authenticated response cannot be cached in a public cache.');
            this.out.definition('true', 'specifies the web script authenticated response can be cached in a public cache.');
            this.out.docs(undefined, 'http://docs.alfresco.com/5.1/references/api-wsdl-cache.html');
            return true;
          } else {
            this.answerOverrides.cachePublic = 'false';
          }
          return false;
        },
        choices: ['false', 'true'],
        message: 'Should we allow caching of authenticated responses in public caches?',
        commonFilter: filters.booleanTextFilter,
        valueRequired: true,
      },
      {
        // TODO(bwavell): Validate that the default is false as the docs are inconsistent
        type: 'list',
        name: 'cacheMustrevalidate',
        option: { name: 'cache-must-revalidate', config: { alias: 'R', desc: 'Force revalidation', type: Boolean } },
        when: readonlyProps => {
          const never = (readonlyProps.cacheNever || this.answerOverrides.cacheNever);
          if (never === 'false') {
            this.out.docs('Specifies whether a cache must revalidate its version of the web script response in order to ensure freshness. Valid values, which are optional, are as follows:');
            this.out.definition('true', '(default) specifies that validation must occur.');
            this.out.definition('false', 'specifies that validation can occur.');
            this.out.docs(undefined, 'http://docs.alfresco.com/5.1/references/api-wsdl-cache.html');
            return true;
          } else {
            this.answerOverrides.cacheMustrevalidate = 'true';
          }
          return false;
        },
        choices: ['true', 'false'],
        message: 'Should caches be required to revalidate?',
        commonFilter: filters.booleanTextFilter,
        valueRequired: true,
      },
    ];

    this.setupArgumentsAndOptions(this.prompts);
    debug('constructor finished');
  }

  prompting () {
    return this.subgeneratorPrompt(this.prompts, props => {
      const targetModule = this.targetModule.module;
      debug('target module: %s', targetModule);

      debug('parsing negotiations');
      props.negotiations = (props.negotiations ? JSON.parse(props.negotiations) : {});
      debug('parsing args');
      props.args = (props.args ? JSON.parse(props.args) : {});
      debug('saving answers');
      props.artifactId = targetModule.artifactId;
      this.props = props;

      const moduleRoot = this.destinationPath(targetModule.path);
      debug('module root: %s', moduleRoot);
      const wsRoot = this.sdk.shareConfigBase + '/alfresco/web-extension/site-webscripts';
      debug('webscript root: %s', wsRoot);
      const rsRoot = this.sdk.shareConfigBase + '/META-INF/resources';
      debug('client-side resources root: %s', rsRoot);

      const configSrcPath = this.templatePath('server/config.xml');
      const descSrcPath = this.templatePath('server/desc.xml.ejs');
      const surfSrcPath = this.templatePath('server/surf-controller.js');

      const descPath = path.join(moduleRoot, wsRoot, props.package + '/components/dashlets');
      const clientCSSPath = path.join(moduleRoot, rsRoot, props.artifactId + '/css');
      const clientJSPath = path.join(moduleRoot, rsRoot, props.artifactId + '/js');

      if (props.framework === 'surf') {
        const descName = props.id + '.get.desc.xml';
        const destPath = path.join(descPath, descName);
        this.out.info('Generating ' + descName + ' in ' + descPath);
        debug('copying from: %s to %s', descSrcPath, destPath);
        debug('with props: %j', props);
        this.fs.copyTpl(descSrcPath, destPath, props);
        debug('done copying webscript descriptor');

        const jsControllerName = props.id + '.get.js';
        const jsControllerPath = path.join(descPath, jsControllerName);
        this.out.info('Generating ' + jsControllerName + ' in ' + descPath);
        this.fs.copyTpl(surfSrcPath, jsControllerPath, props);

        const configName = props.id + '.get.config.xml';
        const configPath = path.join(descPath, configName);
        this.out.info('Generating ' + configName + ' in ' + descPath);
        this.fs.copyTpl(configSrcPath, configPath, props);

        const fmtPath = this.templatePath('server/html.ftl');
        const tplName = props.id + '.get.html.ftl';
        const tplPath = path.join(descPath, tplName);
        this.out.info('Generating ' + tplName + ' in ' + descPath);
        this.fs.copyTpl(fmtPath, tplPath, props);
      }

      // Client-side files
      const csstPath = this.templatePath('client/styling.css');
      const cssfName = props.id + '.css';
      const cssPath = path.join(clientCSSPath, cssfName);
      this.out.info('Generating ' + cssfName + ' in ' + csstPath);
      this.fs.copyTpl(csstPath, cssPath, props);

      const jstPath = this.templatePath('client/javascript.js');
      const jsfName = props.id + '.js';
      const jsPath = path.join(clientJSPath, jsfName);
      this.out.info('Generating ' + jsfName + ' in ' + jstPath);
      this.fs.copyTpl(jstPath, jsPath, props);

      // NOTE: consider prompting for supported locales. Realizing there are a large number of them
      // and we likely won't have sample data for all locales.
      ['de', 'en', 'es', 'fr'].forEach(locale => {
        const propPath = this.templatePath('server/' + locale + '.properties');
        const localeName = props.id + '.get' + (locale === 'en' ? '' : '_' + locale) + '.properties';
        const localePath = path.join(descPath, localeName);
        this.out.info('Generating ' + localeName + ' in ' + descPath);
        this.fs.copyTpl(propPath, localePath, props);
      });
    }).then(() => {
      debug('prompting finished');
    });
  }
};

// TODO(bwavell): move prompts to webscript-prompt-filters module and add tests

function idFilter (id) {
  if (!_.isString(id)) return undefined;
  const retv = _.kebabCase(id);
  // if after kebabbing our id we don't have anything left treat as undefined
  if (_.isEmpty(retv)) return undefined;
  return retv;
}

function urlTemplatesFilter (templates) {
  const urls = filters.requiredTextListFilter(templates, '|');
  if (urls) {
    return urls.map(url => {
      return (url.startsWith('/')
        ? url
        : '/' + url);
    });
  }
  return urls;
}

function packageFilter (pkg) {
  if (!_.isString(pkg) || _.isEmpty(pkg)) return undefined;
  // To begin with, if package is provided in dot notation replace dots with slashes
  // also, treat spaces like path separators
  let output = pkg.replace(/[.\s]/g, '/');
  // package/path should start with a slash
  if (!output.startsWith('/')) {
    output = '/' + output;
  }
  // package/path should not end with a slash
  output = output.replace(/[/\s]*$/g, '');
  // package/path should be all lower case
  output = output.toLocaleLowerCase();
  // if after cleanup all we have is a / then treat as undefined
  if (output === '/') return undefined;
  return output;
}

module.exports = DashletSubGenerator;

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
