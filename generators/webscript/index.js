'use strict';
let _ = require('lodash');
let chalk = require('chalk');
let debug = require('debug')('generator-alfresco:webscript');
let path = require('path');
let constants = require('generator-alfresco-common').constants;
let filters = require('generator-alfresco-common').prompt_filters;
let SourceSelectingSubGenerator = require('../source-selecting-subgenerator.js');

const METHODS = ['get', 'post', 'put', 'delete'];
const LANGUAGES = ['Java', 'JavaScript', 'Both Java & JavaScript'];
const JAVA_BASE_CLASSES = ['DeclarativeWebScript', 'AbstractWebScript'];
const TEMPLATE_FORMATS = ['html', 'json', 'xml', 'csv', 'atom', 'rss'];
const FORMAT_SELECTORS = ['any', 'argument', 'extension'];
const AUTHENTICATIONS = ['none', 'guest', 'user', 'admin'];
const TRANSACTIONS = ['none', 'required', 'requiresnew'];
const TRANSACTION_ALLOWANCES = ['readonly', 'readwrite'];
const LIFECYCLES = ['none', 'sample', 'draft', 'public_api', 'draft_public_api', 'deprecated', 'internal'];

module.exports = class extends SourceSelectingSubGenerator {
  constructor (args, opts) {
    super(args, opts);

    let defPackage = packageFilter(this.config.get(constants.PROP_PROJECT_PACKAGE));

    this.prompts = [

      {
        type: 'input',
        name: 'id',
        option: { name: 'id', config: { alias: 'i', desc: 'Webscript id', type: String } },
        when: function (readonlyProps) {
          this.out.docs(
            'The webscript id identifies the web script and must be unique within a web script package.',
            'http://docs.alfresco.com/5.1/concepts/ws-component-name.html');
          return true;
        },
        message: 'What ' + chalk.yellow('webscript id') + ' should we use?',
        invalidMessage: 'The ' + chalk.yellow('webscript id') + ' value is required',
        commonFilter: idFilter,
        valueRequired: true,
      },
      {
        // TODO(bwavell): Save package name for re-use the next time a webscript is scaffolded
        type: 'input',
        name: 'package',
        option: { name: 'package', config: { alias: 'p', desc: 'Webscript package', type: String } },
        when: function (readonlyProps) {
          this.out.docs(
            'A web script is uniquely identified by its web script package and web script ID.',
            'http://docs.alfresco.com/5.1/concepts/ws-component-name.html');
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
        name: 'language',
        option: { name: 'language', config: { alias: 'l', desc: 'Language for webscript: java, javascript or both', type: String } },
        choices: LANGUAGES,
        message: 'Which language would you like to develop your script in?',
        commonFilter: filters.chooseOneMapStartsWithFilterFactory({java: 'Java', javascript: 'JavaScript', both: 'Both Java & JavaScript'}),
        valueRequired: true,
      },
      {
        type: 'list',
        name: 'javaBaseClass',
        option: { name: 'java-base-class', config: { alias: 'c', desc: 'Java webscripts base class: DeclarativeWebScript or AbstractWebScript', type: String } },
        when: function (readonlyProps) {
          let lang = (readonlyProps.language || this.answerOverrides.language);
          let show = (lang === 'Java' || lang === 'Both Java & JavaScript');
          if (show) {
            this.out.docs(
              ['The Web Script Framework provides two Java classes that implement the difficult parts of the org.alfresco.web.scripts.WebScript interface, which you can extend as a starting point. The simplest helper Java class is named as follows: org.alfresco.web.scripts.AbstractWebScript',
                'This helper provides an implementation of getDescription() but does not provide any execution assistance, which it delegates to its derived class. This allows a Java-backed web script to take full control of the execution process, including how output is rendered to the response.',
                'The other helper Java class is named: org.alfresco.web.scripts.DeclarativeWebScript',
                'This helper provides an implementation of getDescription() and execute(). It encapsulates the execution of a scripted web script, which is:',
                '*  Locate an associated controller script written in JavaScript and, if found, execute it.\n*  Locate an associated response template for the requested format and execute it, passing the model populated by the controller script.',
                'By default, all web scripts implemented through scripting alone are backed by the DeclarativeWebScript Java class. There is one special hook point that makes this a useful class for your own Java-backed web scripts to extend. Prior to controller script execution, DeclarativeWebScript invokes the template method executeImpl(), which it expects the derived Java classes to implement.',
              ], 'http://docs.alfresco.com/5.1/concepts/ws-and-Java.html');
          }
          return show;
        },
        choices: JAVA_BASE_CLASSES,
        message: 'Which base class would you like to use for your Java backed webscript?',
        commonFilter: filters.chooseOneStartsWithFilterFactory(JAVA_BASE_CLASSES),
        valueRequired: false,
      },
      {
        type: 'checkbox',
        name: 'methods',
        option: { name: 'methods', config: { alias: 'M', desc: 'A comma separated list of: get, put, post and/or delete', type: String } },
        when: function (readonlyProps) {
          this.out.docs('As a convenience, you may specify more than one method here. However, if you do select multiple methods, be ' + chalk.underline('WARNED') + ' that we only go through this interview once so answers will be placed into all .desc.xml files. You can easily go update these files appropriately. Alternatively you can use this sub-generator once for each method in order to produce method specific .desc.xml files.');
          return true;
        },
        choices: METHODS,
        default: ['get'],
        message: 'Which HTTP methods would you like to support?',
        invalidMessage: 'You must specify at least one method',
        commonFilter: filters.requiredTextListFilterFactory(',', METHODS),
        valueRequired: true,
      },
      {
        type: 'checkbox',
        name: 'templateFormats',
        option: { name: 'template-formats', config: { alias: 't', desc: 'A comma separated list of: html, json, xml, csv, atom and/or rss', type: String } },
        when: function (readonlyProps) {
          let clazz = (readonlyProps.javaBaseClass || this.answerOverrides.javaBaseClass);
          let lang = (readonlyProps.language || this.answerOverrides.language);
          let show = (clazz !== 'AbstractWebScript' || lang.indexOf('JavaScript') > -1);
          if (!show) {
            this.answerOverrides.templateFormats = [];
          }
          return show;
        },
        choices: TEMPLATE_FORMATS,
        default: ['html'],
        message: 'Which response formats would you like to support?',
        invalidMessage: 'You must specify at least one template format',
        commonFilter: filters.requiredTextListFilterFactory(',', TEMPLATE_FORMATS),
        valueRequired: false,
      },

      {
        type: 'input',
        name: 'kind',
        option: { name: 'kind', config: { alias: 'k', desc: 'Fully qualified kind for webscript', type: String } },
        when: function (readonlyProps) {
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
        name: 'shortname',
        option: { name: 'shortname', config: { alias: 's', desc: 'Shortname for webscript', type: String } },
        when: function (readonlyProps) {
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
        when: function (readonlyProps) {
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
        type: 'input',
        name: 'urlTemplates',
        option: { name: 'url-templates', config: { alias: 'u', desc: 'Vertical bar \'|\' separated list of url templates', type: String } },
        when: function (readonlyProps) {
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
        name: 'formatSelector',
        option: { name: 'format-selector', config: { alias: 'f', desc: 'Format selection technique: any, argument or extension', type: String } },
        when: function (readonlyProps) {
          this.out.docs('The format element controls how the content-type of the response can be specified by using the URI. The format element is optional.');
          this.out.definition('any', 'Either argument or extension can be used. This is the default where none is specified.');
          this.out.definition('argument', 'The content-type is specified by using the format query string parameter, for example /helloworld?to=dave&format=xml.');
          this.out.definition('extension', 'The content-type is specified by using the URI extension, for example /hello/world.xml?to=dave.');
          this.out.docs(undefined, 'http://docs.alfresco.com/5.1/references/api-wsdl-format.html');
          return true;
        },
        choices: FORMAT_SELECTORS,
        message: 'How will the ' + chalk.yellow('<format>') + ' be specified?',
        commonFilter: filters.chooseOneStartsWithFilterFactory(FORMAT_SELECTORS),
        valueRequired: true,
      },
      {
        type: 'list',
        name: 'formatDefault',
        option: { name: 'format-default', config: { alias: 'F', desc: 'Default format to use if no selection is made', type: String } },
        when: readonlyProps => {
          if (this.bail) return;
          let fmts = (readonlyProps.templateFormats || this.answerOverrides.templateFormats);
          let show = (fmts && fmts.length > 0);
          if (show) {
            let f = filters.chooseOneStartsWithFilter(this.options['format-default'], fmts);
            if (f !== undefined) {
              this.answerOverrides.formatDefault = f;
              this.out.info('Using default format from command line: ' + chalk.reset.dim.cyan(this.answerOverrides.formatDefault));
              return false;
            }
            this.out.docs(
              'If the caller does not specify a required content-type at all, the default content-type is taken from the default attribute of the format element. By default, if not set, the html format is assumed. In some cases, a URI might decide upon a response content-type at runtime. For these URIs, specify an empty format, for example format default="".',
              'http://docs.alfresco.com/5.1/references/api-wsdl-format.html');
          } else {
            this.answerOverrides.formatDefault = '';
          }
          return show;
        },
        choices: function (readonlyProps) {
          return (readonlyProps.templateFormats || this.answerOverrides.templateFormats);
        },
        message: 'Which <format ' + chalk.yellow('@default') + '> should we use?',
        valueRequired: false,
        // We can't use commonFilter here because it requires variable input (the list of values)
      },
      {
        type: 'list',
        name: 'authentication',
        option: { name: 'authentication', config: { alias: 'a', desc: 'Type of authentication required: none, guest, user or admin', type: String } },
        when: function (readonlyProps) {
          this.out.docs('The authentication element specifies the level of authentication required to run the web script. The authentication element is optional.');
          this.out.definition('none', 'Specifies that no authentication is required to run the web script. This is the default value if the authentication level is not explicitly specified.');
          this.out.definition('guest', 'Specifies that at least guest level access is required to run the web script.');
          this.out.definition('user', 'Specifies that at least a user account is required to run the web script.');
          this.out.definition('admin', 'Specifies that at least an adminstrator account is required to run the web script.');
          this.out.docs(undefined, 'http://docs.alfresco.com/5.1/references/api-wsdl-authentication.html');
          return true;
        },
        choices: AUTHENTICATIONS,
        message: 'What level of ' + chalk.yellow('<authentication>') + ' is required to run the webscript?',
        commonFilter: filters.chooseOneStartsWithFilterFactory(AUTHENTICATIONS),
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'authenticationRunas',
        option: { name: 'authentication-runas', config: { alias: 'r', desc: 'User webscript should run as', type: String } },
        when: function (readonlyProps) {
          this.out.docs(
            ['The runas attribute allows a web script developer to state that the execution of a web script must run as a particular Alfresco content repository user, regardless of who initiated the web script.',
              'This is useful where the behavior of the web script requires specific permissions to succeed. Due to security concerns, the runas attribute is only available for web script implementations placed into the Java classpath.',
            ].join('\n\n'),
            'http://docs.alfresco.com/5.1/references/api-wsdl-authentication.html');
          return true;
        },
        message: 'Which user should the webscript <authentication ' + chalk.yellow('@runas') + '>? (leave empty for the calling user)',
        commonFilter: filters.optionalTextFilter,
        valueRequired: false,
      },
      {
        type: 'list',
        name: 'transaction',
        option: { name: 'transaction', config: { alias: 'T', desc: 'Transaction requirement: none, required or requiresnew', type: String } },
        when: function (readonlyProps) {
          this.out.docs('The transaction element specifies the transaction level required to run the web script. The transaction element is optional.');
          this.out.definition('none', 'Specifies that no transaction is required to run the web script. This is the default value if the transaction level is not explicitly specified, and the authentication level is none. If the authentication level is not none then the default value is required.');
          this.out.definition('required', 'Specifies that a transaction is required (and will inherit an existing transaction, if open).');
          this.out.definition('requiresnew', 'Specifies that a new transaction is required.');
          this.out.docs(undefined, 'http://docs.alfresco.com/5.1/references/api-wsdl-transaction.html');
          return true;
        },
        choices: TRANSACTIONS,
        default: function (readonlyProps) {
          let auth = (readonlyProps.authentication || this.answerOverrides.authentication);
          return (auth === 'none'
            ? 'none'
            : 'required');
        },
        message: 'What type of ' + chalk.yellow('<transaction>') + ' is required to run the webscript?',
        commonFilter: filters.chooseOneFilterFactory(TRANSACTIONS),
        valueRequired: true,
      },
      {
        // TODO(bwavell): What happens if no value is specified?
        type: 'list',
        name: 'transactionAllow',
        option: { name: 'transaction-allow', config: { alias: 'A', desc: 'Transaction allowance requirement: readonly, readwrite', type: String } },
        when: function (readonlyProps) {
          this.out.docs('Specifies the type of data transfer allowed. Valid values, which are optional/required, are as follows');
          this.out.definition('readonly', 'read only transfers allowed');
          this.out.definition('readwrite', 'read and write transfers allowed');
          this.out.docs(undefined, 'http://docs.alfresco.com/5.1/references/api-wsdl-transaction.html');
          return true;
        },
        choices: TRANSACTION_ALLOWANCES,
        message: 'What type of data transfer do we want to <transaction ' + chalk.yellow('@allow') + '>?',
        commonFilter: filters.chooseOneFilterFactory(TRANSACTION_ALLOWANCES),
        valueRequired: true,
      },
      {
        // TODO(bwavell): Figure out what the default is and document that
        type: 'input',
        name: 'transactionBuffersize',
        option: { name: 'transaction-buffersize', config: { alias: 'B', desc: 'Transactional buffer size in bytes', type: Number } },
        when: readonlyProps => {
          let txn = (readonlyProps.transaction || this.answerOverrides.transaction);
          let disp = (txn !== 'none');
          if (disp) {
            this.out.docs(
              ['Specifies the buffer size in bytes. Integer value.',
                'Sets the size in bytes of the transactional buffer the webscript will allocate to guard against the potential rollback of a transaction during the webscript processing. If a rollback occurs and the buffer has not been filled, then it is able to rollback without any output from the webscript being committed to the container output stream. This means error responses can be returned instead of partially formed responses with an error embedded into them.',
                'Buffers are only present where a transaction is required, otherwise they are not used.',
                'For some webscripts, a buffer is not appropriate and would actually be detrimental to performance - the webscript might require direct access to the output stream not a wrapped buffer object - the remoteadm webscripts are such an example.',
              ], 'http://docs.alfresco.com/5.1/references/api-wsdl-transaction.html');
          } else {
            this.answerOverrides.transactionBuffersize = undefined;
          }
          return disp;
        },
        message: 'What  <transaction ' + chalk.yellow('@buffersize') + '> should be allocated?',
        invalidMessage: 'Leave empty to accept default or specify an integer representing the desired size in bytes.',
        commonFilter: transactionBuffersizeFilter,
        valueRequired: false,
      },
      {
        type: 'input',
        name: 'families',
        option: { name: 'families', config: { alias: 'I', desc: 'Vertical bar \'|\' separated list of webscript families', type: String } },
        when: function (readonlyProps) {
          this.out.docs(
            'The family element allows a web script developer to categorize their web scripts. Any value can be assigned to family and any number of families can be assigned to the web script, providing a freeform tagging mechanism. The web script index provides views for navigating web scripts by family. The family tag can be repeated if the script belongs to multiple families. The family element is optional.',
            'http://docs.alfresco.com/5.1/references/api-wsdl-family.html');
          return true;
        },
        message: 'Provide a ' + chalk.green('|') + ' separated list of ' + chalk.yellow('<family>') + ' values',
        invalidMessage: 'Don\'t use ' + chalk.green('.') + ' in family names. E.g. my' + chalk.green('.') + 'family would cause an error if using the family name to navigate to the script.',
        commonFilter: familiesFilter,
        valueRequired: false,
      },
      {
        type: 'list',
        name: 'cacheNever',
        option: { name: 'cache-never', config: { alias: 'C', desc: 'Disable caching, pass false to enable caching', type: Boolean } },
        when: function (readonlyProps) {
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
        when: function (readonlyProps) {
          let never = (readonlyProps.cacheNever || this.answerOverrides.cacheNever);
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
        when: function (readonlyProps) {
          let never = (readonlyProps.cacheNever || this.answerOverrides.cacheNever);
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
      {
        // TODO(bwavell): Figure out if there is a fixed list of formats/mimetypes
        type: 'input',
        name: 'negotiations',
        option: { name: 'negotiations', config: { alias: 'n', desc: 'Vertical bar \'|\' separated list of format=mimetype values', type: String } },
        when: function (readonlyProps) {
          this.out.docs(
            'The negotiate element associates an Accept header MIME type to a specific web script format of response. The mandatory value specifies the format while the mandatory attribute, accept, specifies the MIME type. Content Negotiation is enabled with the definition of at least one negotiate element. The negotiate element can be specified zero or more times.',
            'http://docs.alfresco.com/5.1/references/api-wsdl-negotiate.html');
          return true;
        },
        message: 'Provide a ' + chalk.green('|') + ' separated list of ' + chalk.yellow('format') + chalk.green('=') + chalk.yellow('mimetype') + ' negotiation values',
        invalidMessage: 'Invalid format, try something like ' + chalk.green('html=text/html|xml=text/xml'),
        commonFilter: negotiationsFilter,
        valueRequired: true,
      },
      {
        type: 'list',
        name: 'lifecycle',
        option: { name: 'lifecycle', config: { alias: 'L', desc: 'Webscript lifecycle: none, sample, draft, public_api, draft_public_api, deprecated or internal', type: String } },
        when: function (readonlyProps) {
          this.out.docs('The lifecycle element allows a web script developer to indicate the development status of a web script. Typically, web scripts start out in a draft state while being developed or tested, are promoted to production quality for widespread use, and finally retired at the end of their life. The lifecycle element is optional.');
          this.out.definition('none', 'Indicates this web script is not part of a lifecycle');
          this.out.definition('sample', 'Indicates this web script is a sample and is not intended for production use');
          this.out.definition('draft', 'Indicates this web script might be incomplete, experimental, or still subject to change');
          this.out.definition('public_api', 'Indicates this web script is part of a public API and should be stable and well tested');
          this.out.definition('draft_public_api', 'Indicates this web script is intended to become part of the public API but is incomplete or still subject to change');
          this.out.definition('deprecated', 'Indicates this web script should be avoided; it might be removed in future versions of the product');
          this.out.definition('internal', 'Indicates this web script is for Alfresco use only; it should not be relied upon between versions and is likely to change');
          this.out.docs(undefined, 'http://docs.alfresco.com/5.1/references/api-wsdl-lifecycle.html');
          return true;
        },
        choices: LIFECYCLES,
        message: 'What is the ' + chalk.yellow('<lifecycle>') + ' state of the webscript?',
        commonFilter: filters.chooseOneStartsWithFilterFactory(LIFECYCLES),
        valueRequired: true,
      },
      {
        // TODO(bwavell): Figure out what the default is
        type: 'list',
        name: 'formdataMultipartProcessing',
        option: { name: 'multipart', config: { alias: 'U', desc: 'Enable multipart form data processing', type: Boolean } },
        when: function (readonlyProps) {
          this.out.docs('Specifies whether multi-part processing should be on or off. Valid values, which are optional, are as follows:');
          this.out.definition('false', 'turns off multi-part form data processing.');
          this.out.definition('true', 'turns on multi-part form data processing.');
          this.out.docs(undefined, 'http://docs.alfresco.com/5.1/references/api-wsdl-formdata.html');
          return true;
        },
        choices: ['false', 'true'],
        message: 'Should we enable <formdata ' + chalk.yellow('@multipart-processing') + '> for the the webscript?',
        commonFilter: filters.booleanTextFilter,
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'args',
        option: { name: 'args', config: { alias: 'g', desc: 'Vertical bar \'|\' separated list of name=description values', type: String } },
        when: function (readonlyProps) {
          this.out.docs(
            'The args element represents a list of arguments passed to the web script. This are listed for documentation purposes. The args element is optional.',
            'http://docs.alfresco.com/5.1/references/api-wsdl-args.html');
          return true;
        },
        message: 'Provide a ' + chalk.green('|') + ' separated list of ' + chalk.yellow('name') + chalk.green('=') + chalk.yellow('description') + ' values',
        invalidMessage: 'Invalid format, try ' + chalk.green('application=Name of the audit application|fromTime=Time in ms of the oldest audit entry'),
        commonFilter: argsFilter,
        valueRequired: false,
      },
      {
        type: 'input',
        name: 'requests',
        option: { name: 'requests', config: { alias: 'q', desc: 'Vertical bar \'|\' separated list of request types', type: String } },
        when: function (readonlyProps) {
          this.out.docs(
            'The requests element represents a collection of request types for the web script. The requests element is optional.',
            'http://docs.alfresco.com/5.1/references/api-wsdl-requests.html');
          return true;
        },
        message: 'Provide a ' + chalk.green('|') + ' separated list of <request ' + chalk.yellow('@type') + '> values',
        commonFilter: filters.textListFilterFactory('|'),
        valueRequired: false,
      },
      {
        type: 'input',
        name: 'responses',
        option: { name: 'responses', config: { alias: 'S', desc: 'Vertical bar \'|\' separated list of response types', type: String } },
        when: function (readonlyProps) {
          this.out.docs(
            'The responses element represents a collection of response types for the web script. The responses element is optional.',
            'http://docs.alfresco.com/5.1/references/api-wsdl-responses.html');
          return true;
        },
        message: 'Provide a ' + chalk.green('|') + ' separated list of <response ' + chalk.yellow('@type') + '> values',
        commonFilter: filters.textListFilterFactory('|'),
        valueRequired: false,
      },
    ];

    this.setupArgumentsAndOptions(this.prompts);
  }

  prompting () {
    return this.subgeneratorPrompt(this.prompts, function (props) {
      debug('parsing negotiations');
      props.negotiations = (props.negotiations ? JSON.parse(props.negotiations) : {});
      debug('parsing args');
      props.args = (props.args ? JSON.parse(props.args) : {});
      debug('saving answers');
      this.props = props;

      let targetModule = this.targetModule.module;
      debug('target module: %s', targetModule);
      let moduleRoot = this.destinationPath(targetModule.path);
      debug('module root: %s', moduleRoot);
      let wsRoot = (targetModule.war === 'repo'
          ? 'src/main/amp/config/alfresco/extension/templates/webscripts'
          : 'src/main/amp/config/alfresco/web-extension/site-webscripts');
      debug('webscript root: %s', wsRoot);
      let genRoot = (targetModule.war === 'repo'
          ? 'src/main/amp/config/alfresco/module/' + path.basename(targetModule.path) + '/context/generated'
          : 'src/main/amp/config/alfresco/web-extension');
      debug('generated root: %s', genRoot);
      let configSrcPath = this.templatePath('config.xml');
      let descSrcPath = this.templatePath('desc.xml.ejs');
      debug('javaBaseClass: %s', props.javaBaseClass);
      let javaSrcPath = this.templatePath(props.javaBaseClass + '.java');
      let jsSrcPath = this.templatePath('controller.js');
      let wsSrcPath = this.templatePath('webscript-context.xml');
      let descPath = path.join(moduleRoot, wsRoot, props.package);
      let genPath = path.join(moduleRoot, genRoot);
      props.methods.forEach(method => {
        let descName = props.id + '.' + method + '.desc.xml';
        let destPath = path.join(descPath, descName);
        this.out.info('Generating ' + descName + ' in ' + descPath);
        debug('copying from: %s to %s', descSrcPath, destPath);
        debug('with props: %j', props);
        this.fs.copyTpl(descSrcPath, destPath, props);
        debug('done copying webscript descriptor');
        // JavaScript || Both Java & JavaScript
        if (props.language !== 'Java') {
          let jsControllerName = props.id + '.' + method + '.js';
          let jsControllerPath = path.join(descPath, jsControllerName);
          this.out.info('Generating ' + jsControllerName + ' in ' + descPath);
          this.fs.copyTpl(jsSrcPath, jsControllerPath, props);

          let configName = props.id + '.' + method + '.config.xml';
          let configPath = path.join(descPath, configName);
          this.out.info('Generating ' + configName + ' in ' + descPath);
          this.fs.copyTpl(configSrcPath, configPath, props);
        }
        // Java || Both Java & JavaSctip
        if (props.language !== 'JavaScript') {
          let pkg = props.package.replace(/\//g, '.').substring(1);
          props.classPackage = pkg + '.webscripts';
          props.className = _.upperFirst(_.camelCase(props.id)) + _.upperFirst(method) + 'Webscript';
          props.qualifiedClassName = props.classPackage + '.' + props.className;
          props.beanId = 'webscript.' + pkg + '.' + props.id + '.' + method;
          let javaControllerName = props.className + '.java';
          let javaClassPath = path.join(moduleRoot, 'src/main/java', props.package, 'webscripts');
          let javaControllerPath = path.join(javaClassPath, javaControllerName);
          this.out.info('Generating ' + javaControllerName + ' in ' + javaClassPath);
          this.out.info('FROM ' + javaSrcPath);
          this.fs.copyTpl(javaSrcPath, javaControllerPath, props);
          let contextName = 'webscript-' + props.id + '-' + method + '-context.xml';
          let contextPath = path.join(genPath, contextName);
          this.out.info('Generating ' + contextName + ' in ' + genPath);
          this.fs.copyTpl(wsSrcPath, contextPath, props);
        }
        // NOTE: for an AbstractWebScript, we won't have any freemarker templates
        // if the language is only Java.
        props.templateFormats.forEach(format => {
          let fmtPath = this.templatePath(format + '.ftl');
          let tplName = props.id + '.' + method + '.' + format + '.ftl';
          let tplPath = path.join(descPath, tplName);
          this.out.info('Generating ' + tplName + ' in ' + descPath);
          this.fs.copyTpl(fmtPath, tplPath, props);
        });
        // NOTE: consider prompting for supported locales. Realizing there are a large number of them
        // and we likely won't have sample data for all locales.
        ['de', 'en', 'es', 'fr'].forEach(locale => {
          let propPath = this.templatePath(locale + '.properties');
          let localeName = props.id + '.' + method + (locale === 'en' ? '' : '_' + locale) + '.properties';
          let localePath = path.join(descPath, localeName);
          this.out.info('Generating ' + localeName + ' in ' + descPath);
          this.fs.copyTpl(propPath, localePath, props);
        });
      });
    }).then(function () {
      debug('prompting finished');
    });
  }
};

// =======================================
// CUSTOM FILTER FUNCTIONS FOR GENERATOR
// =======================================

// TODO(bwavell): move prompts to webscript-prompt-filters module and add tests

function idFilter (id) {
  if (!_.isString(id)) return undefined;
  let retv = _.kebabCase(id);
  // if after kebabbing our id we don't have anything left treat as undefined
  if (_.isEmpty(retv)) return undefined;
  return retv;
}

function packageFilter (pkg) {
  if (!_.isString(pkg) || _.isEmpty(pkg)) return undefined;
  // To begin with, if package is provided in dot notation replace dots with slashes
  // also, treat spaces like path separators
  let output = pkg.replace(/[.\s]/g, '/');
  // package/path should start with a slash
  if (!_.startsWith(output, '/')) {
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

function urlTemplatesFilter (templates) {
  let urls = filters.requiredTextListFilter(templates, '|');
  if (urls) {
    return urls.map(function (url) {
      return (_.startsWith(url, '/')
       ? url
       : '/' + url);
    });
  }
  return urls;
}

// NOTE: unlike most of the other filters, this
// one will return empty string as if no value
// is provided. This is partially to allow a
// default value to be indicated from the
// commandline and partially in case the user
// does not wish to provide a value during the
// prompting phase. For some reason the options
// framework will provide a NaN if a non numeric
// value is provided for this Number option, so
// we return the empty string for that too.
function transactionBuffersizeFilter (buffersize) {
  if (buffersize === undefined || buffersize === null) return undefined;
  if (buffersize === true) return '';
  if (isNaN(buffersize)) return '';
  if (_.isNumber(buffersize)) return parseInt(buffersize);
  if (_.isEmpty(buffersize)) return '';
  return parseInt(buffersize);
}

function familiesFilter (families) {
  if (_.isString(families) && families.indexOf('.') > -1) return undefined;
  return filters.textListFilter(families, '|');
}

function negotiationsFilter (negotiations) {
  if (negotiations === true) return '';
  if (!_.isString(negotiations) || _.isEmpty(negotiations)) return undefined;
  if (_.startsWith(negotiations, '{') && validateJSONString(negotiations)) return negotiations;
  let negotiationList = negotiations.split(/\s*\|\s*/);
  let valSet = false;
  let retv = negotiationList.reduce(function (negotiations, negotiation) {
    let negotiationItems = negotiation.split(/\s*=\s*/);
    if (negotiationItems.length >= 2) {
      negotiations[negotiationItems[0]] = negotiationItems[1];
      valSet = true;
    }
    return negotiations;
  }, {});
  if (valSet) return JSON.stringify(retv);
  return undefined;
}

function validateJSONString (str) {
  let j;
  try {
    j = JSON.parse(str);
    return j;
  } catch (err) {
    return undefined;
  }
}

function argsFilter (args) {
  if (args === undefined || args === null) return undefined;
  if (!_.isString(args) || _.isEmpty(args)) return '{}';
  let argsList = args.split(/\s*\|\s*/);
  return JSON.stringify(argsList.reduce(function (args, arg) {
    let argItems = arg.split(/\s*=\s*/);
    if (argItems.length >= 2) {
      args[argItems[0]] = argItems[1];
    }
    return args;
  }, {}));
}

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
