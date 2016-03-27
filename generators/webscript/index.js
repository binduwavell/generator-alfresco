'use strict';
var _ = require('lodash');
var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
var process = require('process');
var yosay = require('yosay');
var constants = require('../app/constants.js');
var filters = require('../app/prompt-filters.js');
var SourceSelectingSubGenerator = require('../source-selecting-subgenerator.js');

const METHODS = ['get', 'post', 'put', 'delete'];
const LANGUAGES = ['Java', 'JavaScript', 'Both Java & JavaScript'];
const JAVA_BASE_CLASSES = ['DeclarativeWebScript', 'AbstractWebScript'];
const TEMPLATE_FORMATS = ['html', 'json', 'xml', 'csv', 'atom', 'rss'];
const FORMAT_SELECTORS = ['any', 'argument', 'extension'];
const AUTHENTICATIONS = ['none', 'guest', 'user', 'admin'];
const TRANSACTIONS = ['none', 'required', 'requiresnew'];
const TRANSACTION_ALLOWANCES = ['readonly', 'readwrite'];
const LIFECYCLES = ['none', 'sample', 'draft', 'public_api', 'draft_public_api', 'deprecated', 'internal'];

module.exports = SourceSelectingSubGenerator.extend({
  constructor: function() {

    SourceSelectingSubGenerator.apply(this, arguments);

    this.prompts = [

      {
        type: 'input',
        name: 'id',
        option: {
          name: 'id',
          config: {
            desc: 'Webscript id',
            alias:'i',
            type: 'String',
          }
        },
        when: function(props) {
          if (undefined !== this.options.id) {
            props.id = idFilter(this.options.id);
            this.out.info('Using webscript id from command line: ' + chalk.reset.dim.cyan(props.id));
            return false;
          }
          this.out.docs(
            'The webscript id identifies the web script and must be unique within a web script package.',
            'http://docs.alfresco.com/5.1/concepts/ws-component-name.html');
          return true;
        }.bind(this),
        message: 'What ' + chalk.yellow('webscript id') + ' should we use?',
        validate: function(input) {
          return (undefined !== input && '' !== input ? true : 'The ' + chalk.yellow('webscript id') + ' is required');
        },
        filter: idFilter,
      },
      {
        // TODO(bwavell): Save package name for re-use the next time a webscript is scaffolded
        type: 'input',
        name: 'package',
        option: {
          name: 'package',
          config: {
            desc: 'Webscript package',
            alias:'p',
            type: 'String',
          }
        },
        when: function(props) {
          var p = packageFilter(this.options.package);
          if (undefined !== p) {
            props.package = p;
            this.out.info("Using webscript package from command line: " + chalk.reset.dim.cyan(props.package));
            return false;
          }
          this.out.docs(
            'A web script is uniquely identified by its web script package and web script ID.',
            'http://docs.alfresco.com/5.1/concepts/ws-component-name.html');
          return true;
        }.bind(this),
        message: 'Provide a ' + chalk.green('/') + ' separated ' + chalk.yellow('package') + ' for your webscript(s)',
        validate: function(input) {
          return (undefined !== input && '' !== input ? true : 'The ' + chalk.yellow('package') + ' is required');
        },
        filter: packageFilter,
      },

      {
        type: 'list',
        name: 'language',
        option: {
          name: 'language',
          config: {
            desc: 'Language for webscript: java, javascript or both',
            alias:'l',
            type: 'String',
          }
        },
        when: function(props) {
          var l = languageFilter(this.options.language);
          if (undefined !== l) {
            props.language = l;
            this.out.info("Using language from command line: " + chalk.reset.dim.cyan(props.language));
            return false;
          }
          return true;
        }.bind(this),
        choices: LANGUAGES,
        message: 'Which language would you like to develop your script in?',
      },
      {
        type: 'list',
        name: 'javaBaseClass',
        option: {
          name: 'java-base-class',
          config: {
            desc: 'Java webscripts base class: DeclarativeWebScript or AbstractWebScript',
            alias:'c',
            type: 'String',
          }
        },
        when: function(props) {
          if('Java' === props.language || 'Both Java & JavaScript' === props.language) {
            var b = javaBaseClassFilter(this.options['java-base-class']);
            if (undefined !== b) {
              props.javaBaseClass = b;
              this.out.info("Using Java base class from command line: " + chalk.reset.dim.cyan(props.javaBaseClass));
              return false;
            }
            this.out.docs([
              'The Web Script Framework provides two Java classes that implement the difficult parts of the org.alfresco.web.scripts.WebScript interface, which you can extend as a starting point. The simplest helper Java class is named as follows: org.alfresco.web.scripts.AbstractWebScript',
              'This helper provides an implementation of getDescription() but does not provide any execution assistance, which it delegates to its derived class. This allows a Java-backed web script to take full control of the execution process, including how output is rendered to the response.',
              'The other helper Java class is named: org.alfresco.web.scripts.DeclarativeWebScript',
              'This helper provides an implementation of getDescription() and execute(). It encapsulates the execution of a scripted web script, which is:',
              '*  Locate an associated controller script written in JavaScript and, if found, execute it.\n*  Locate an associated response template for the requested format and execute it, passing the model populated by the controller script.',
              'By default, all web scripts implemented through scripting alone are backed by the DeclarativeWebScript Java class. There is one special hook point that makes this a useful class for your own Java-backed web scripts to extend. Prior to controller script execution, DeclarativeWebScript invokes the template method executeImpl(), which it expects the derived Java classes to implement.',
            ].join('\n\n') , 'http://docs.alfresco.com/5.1/concepts/ws-and-Java.html');
            return true;
          } else {
            return false;
          }
        }.bind(this),
        choices: JAVA_BASE_CLASSES,
        message: 'Which base class would you like to use for your Java backed webscript?',
      },
      {
        type: 'checkbox',
        name: 'methods',
        option: {
          name: 'methods',
          config: {
            desc: 'A comma separated list of: get, put, post and/or delete',
            alias:'M',
            type: 'String',
          }
        },
        when: function(props) {
          var m = methodsFilter(this.options.methods);
          if (undefined !== m && m.length > 0) {
            props.methods = m;
            this.out.info("Using HTTP methods from command line: " + chalk.reset.dim.cyan(props.methods));
            return false;
          }
          this.out.docs('As a convenience, you may specify more than one method here. However, if you do select multiple methods, be ' + chalk.underline('WARNED') + ' that we only go through this interview once so answers will be placed into all .desc.xml files. You can easily go update these files appropriately. Alternatively you can use this sub-generator once for each method in order to produce method specific .desc.xml files.');
          return true;
        }.bind(this),
        choices: METHODS,
        default: ['get'],
        message: 'Which HTTP methods would you like to support?',
        validate: function(input) {
          return (input.length > 0 ? true : 'You must specify at least one method');
        }
      },
      {
        type: 'checkbox',
        name: 'templateFormats',
        option: {
          name: 'template-formats',
          config: {
            desc: 'A comma separated list of: html, json, xml, csv, atom and/or rss',
            alias:'t',
            type: 'String',
          }
        },
        when: function(props) {
          var f = templateFormatsFilter(this.options['template-formats']);
          if (undefined !== f && f.length > 0) {
            props.templateFormats = f;
            this.out.info("Using template format(s) from command line: " + chalk.reset.dim.cyan(props.templateFormats));
            return false;
          }
          return ('AbstractWebScript' !== props.javaBaseClass);
        }.bind(this),
        choices: TEMPLATE_FORMATS,
        default: ['html'],
        message: 'Which response formats would you like to support?',
        validate: function(input) {
          return (input && input.length > 0 ? true : 'You must specify at least one template format');
        }
      },


      {
        type: 'input',
        name: 'kind',
        option: {
          name: 'kind',
          config: {
            desc: 'Fully qualified kind for webscript',
            alias:'k',
            type:'String',
          }
        },
        when: function(props) {
          var k = kindFilter(this.options.kind);
          if (undefined !== k) {
            props.kind = k;
            this.out.info("Using webscript kind from command line: " + chalk.reset.dim.cyan(props.kind));
            return false;
          }
          this.out.docs(
            'Different kinds of web scripts can be created. When this attribute is specified it allows a web script kind other than the default to be specified. An example kind is org.alfresco.repository.content.stream. This kind of web script returns a binary stream from the repository back to the client. This might be useful for returning a thumbnail binary to the client for example. It is also possible to create additional web script kinds according to your needs.',
            'http://docs.alfresco.com/5.1/references/api-wsdl-webscript.html');
          return true;
        }.bind(this),
        message: 'What <webscript ' + chalk.yellow('@kind') + '> would you like to create?',
        filter: kindFilter,
      },
      {
        type: 'input',
        name: 'shortname',
        option: {
          name: 'shortname',
          config: {
            desc: 'Shortname for webscript',
            alias:'s',
            type:'String',
          }
        },
        when: function(props) {
          var s = shortnameFilter(this.options['shortname']);
          if (undefined !== s) {
            props.shortname = s;
            this.out.info("Using shortname from command line: " + chalk.reset.dim.cyan(props.shortname));
            return false;
          }
          this.out.docs(
            'The shortname element in a web descriptor file provides a human readable name for the web script. The shortname element is required.',
            'http://docs.alfresco.com/5.1/references/api-wsdl-shortname.html');
          return true;
        }.bind(this),
        message: 'What ' + chalk.yellow('<shortname>') + ' should we use?',
        validate: function(input) {
          return ('' !== input ? true : 'The ' + chalk.yellow('shortname') + ' element is required');
        },
      },
      {
        type: 'input',
        name: 'description',
        option: {
          name: 'description',
          config: {
            desc: 'Description for webscript',
            alias:'d',
            type:'String',
          }
        },
        when: function(props) {
          var d = descriptionFilter(this.options['description']);
          if (undefined !== d) {
            props.description = d;
            this.out.info("Using description from command line: " + chalk.reset.dim.cyan(props.description));
            return false;
          }
          this.out.docs(
            'The description element in a web descriptor file provides documentation for the web script. The description element is optional.',
            'http://docs.alfresco.com/5.1/references/api-wsdl-description.html');
          return true;
        }.bind(this),
        message: 'What ' + chalk.yellow('<description>') + ' should we use?',
      },
      {
        type: 'input',
        name: 'urlTemplates',
        option: {
          name: 'url-templates',
          config: {
            desc: 'Vertical bar \'|\' separated list of url templates',
            alias:'u',
            type:'String',
          }
        },
        when: function(props) {
          var u = urlTemplatesFilter(this.options['url-templates']);
          if (undefined !== u && u.length > 0) {
            props.urlTemplates = u;
            this.out.info("Using url template(s) from command line: " + chalk.reset.dim.cyan(props.urlTemplates));
            return false;
          }
          this.out.docs(
            'The url element represents a URI template to which the web script is bound. Variants of the URI template which specify a format do not need to be registered, however, specifying them is useful for documentation purposes. There must be at least one url element, but there can be several.',
            'http://docs.alfresco.com/5.1/references/api-wsdl-url.html');
          this.out.docs(undefined,
            'http://docs.alfresco.com/5.1/concepts/ws-anatomy.html');
          this.out.docs(undefined,
            'http://docs.alfresco.com/5.1/concepts/ws-uri-template.html');
          return true;
        }.bind(this),
        message: 'Provide a ' + chalk.green('|') + ' separated list of ' + chalk.yellow('<url>') + ' values',
        validate: function(input) {
          return (undefined !== input && '' !== input ? true : 'At least one ' + chalk.yellow('url') + ' is required');
        },
        filter: urlTemplatesFilter,
      },
      {
        type: 'list',
        name: 'formatSelector',
        option: {
          name: 'format-selector',
          config: {
            desc: 'Format selection technique: any, argument or extension',
            alias:'f',
            type:'String',
          }
        },
        when: function(props) {
          var s = formatSelectorFilter(this.options['format-selector']);
          if (undefined !== s) {
            props.formatSelector = s;
            this.out.info("Using format selector from command line: " + chalk.reset.dim.cyan(props.formatSelector));
            return false;
          }
          this.out.docs('The format element controls how the content-type of the response can be specified by using the URI. The format element is optional.');
          this.out.definition('any', 'Either argument or extension can be used. This is the default where none is specified.');
          this.out.definition('argument','The content-type is specified by using the format query string parameter, for example /helloworld?to=dave&format=xml.')
          this.out.definition('extension', 'The content-type is specified by using the URI extension, for example /hello/world.xml?to=dave.');
          this.out.docs(undefined, 'http://docs.alfresco.com/5.1/references/api-wsdl-format.html');
          return true;
        }.bind(this),
        choices: FORMAT_SELECTORS,
        message: 'How will the ' + chalk.yellow('<format>') + ' be specified?',
      },
      {
        type: 'list',
        name: 'formatDefault',
        option: {
          name: 'format-default',
          config: {
            desc: 'Default format to use if no selection is made',
            alias:'F',
            type:'String',
          }
        },
        when: function(props) {
          var f = formatDefaultFilter(this.options['format-default'], props.templateFormats);
          if (undefined != f) {
            props.formatDefault = f;
            this.out.info("Using default format from command line: " + chalk.reset.dim.cyan(props.formatDefault));
            return false;
          }
          this.out.docs(
            'If the caller does not specify a required content-type at all, the default content-type is taken from the default attribute of the format element. By default, if not set, the html format is assumed. In some cases, a URI might decide upon a response content-type at runtime. For these URIs, specify an empty format, for example format default="".',
            'http://docs.alfresco.com/5.1/references/api-wsdl-format.html');
          return true;
        }.bind(this),
        choices: function(props) {
          return props.templateFormats
        },
        message: 'Which <format ' + chalk.yellow('@default') + '> should we use?',
      },
      {
        type: 'list',
        name: 'authentication',
        option: {
          name: 'authentication',
          config: {
            desc: 'Type of authentication required: none, guest, user or admin',
            alias:'a',
            type:'String',
          }
        },
        when: function(props) {
          var a = authenticationFilter(this.options.authentication);
          if (undefined !== a) {
            props.authentication = a;
            this.out.info("Using authentication from command line: " + chalk.reset.dim.cyan(props.authentication));
            return false;
          }
          this.out.docs('The authentication element specifies the level of authentication required to run the web script. The authentication element is optional.');
          this.out.definition('none', 'Specifies that no authentication is required to run the web script. This is the default value if the authentication level is not explicitly specified.');
          this.out.definition('guest', 'Specifies that at least guest level access is required to run the web script.');
          this.out.definition('user', 'Specifies that at least a user account is required to run the web script.');
          this.out.definition('admin', 'Specifies that at least an adminstrator account is required to run the web script.');
          this.out.docs(undefined, 'http://docs.alfresco.com/5.1/references/api-wsdl-authentication.html');
          return true;
        }.bind(this),
        choices: AUTHENTICATIONS,
        message: 'What level of ' + chalk.yellow('<authentication>') + ' is required to run the webscript?',
      },
      {
        type: 'input',
        name: 'authenticationRunas',
        option: {
          name: 'authentication-runas',
          config: {
            desc: 'User webscript should run as',
            alias:'r',
            type:'String',
          }
        },
        when: function(props) {
          var r = authenticationRunasFilter(this.options['authentication-runas']);
          if (undefined !== r) {
            props.authenticationRunas = r;
            this.out.info("Using runas from command line: " + chalk.reset.dim.cyan(props.authenticationRunas));
            return false;
          }
          this.out.docs(
            ['The runas attribute allows a web script developer to state that the execution of a web script must run as a particular Alfresco content repository user, regardless of who initiated the web script.',
              'This is useful where the behavior of the web script requires specific permissions to succeed. Due to security concerns, the runas attribute is only available for web script implementations placed into the Java classpath.',
            ].join('\n\n'),
            'http://docs.alfresco.com/5.1/references/api-wsdl-authentication.html');
          return true;
        }.bind(this),
        message: 'Which user should the webscript <authentication ' + chalk.yellow('@runas') + '>? (leave empty for the calling user)',
      },
      {
        type: 'list',
        name: 'transaction',
        option: {
          name: 'transaction',
          config: {
            desc: 'Transaction requirement: none, required or requiresnew',
            alias:'T',
            type:'String',
          }
        },
        when: function(props) {
          var t = transactionFilter(this.options['transaction']);
          if (undefined !== t) {
            props.transaction = t;
            this.out.info("Using transaction from command line: " + chalk.reset.dim.cyan(props.transaction));
            return false;
          }
          this.out.docs('The transaction element specifies the transaction level required to run the web script. The transaction element is optional.');
          this.out.definition('none', 'Specifies that no transaction is required to run the web script. This is the default value if the transaction level is not explicitly specified, and the authentication level is none. If the authentication level is not none then the default value is required.');
          this.out.definition('required', 'Specifies that a transaction is required (and will inherit an existing transaction, if open).');
          this.out.definition('requiresnew', 'Specifies that a new transaction is required.');
          this.out.docs(undefined, 'http://docs.alfresco.com/5.1/references/api-wsdl-transaction.html');
          return true;
        }.bind(this),
        choices: TRANSACTIONS,
        default: function(props) {
          return ( 'none' === props.authentication
            ? 'none'
            : 'required' );
        }.bind(this),
        message: 'What type of ' + chalk.yellow('<transaction>') + ' is required to run the webscript?',
      },
      {
        // TODO(bwavell): What happens if no value is specified?
        type: 'list',
        name: 'transactionAllow',
        option: {
          name: 'transaction-allow',
          config: {
            desc: 'Transaction allowance requirement: readonly, readwrite',
            alias:'A',
            type:'String',
          }
        },
        when: function(props) {
          var t = transactionAllowanceFilter(this.options['transaction-allow']);
          if (undefined !== t) {
            props.transactionAllow = t;
            this.out.info("Using transaction allowance from command line: " + chalk.reset.dim.cyan(props.transactionAllow));
            return false;
          }
          this.out.docs('Specifies the type of data transfer allowed. Valid values, which are optional/required, are as follows');
          this.out.definition('readonly', 'read only transfers allowed');
          this.out.definition('readwrite', 'read and write transfers allowed');
          this.out.docs(undefined, 'http://docs.alfresco.com/5.1/references/api-wsdl-transaction.html');
          return true;
        }.bind(this),
        choices: TRANSACTION_ALLOWANCES,
        message: 'What type of data transfer do we want to <transaction ' + chalk.yellow('@allow') + '>?',
      },
      {
        // TODO(bwavell): figure out what the default is and document that
        type: 'input',
        name: 'transactionBuffersize',
        option: {
          name: 'transaction-buffersize',
          config: {
            desc: 'Transactional buffer size in bytes',
            alias:'B',
            type:'Number',
          }
        },
        when: function(props) {
          var s = transactionBuffersizeFilter(this.options['transaction-buffersize']);
          if (undefined !== s) {
            props.transactionBuffersize = s;
            this.out.info("Using transaction buffer size from command line: " + chalk.reset.dim.cyan(props.transactionBuffersize));
            return false;
          }
          var disp = ('none' !== props.transaction);
          if (disp) {
          this.out.docs(
            ['Specifies the buffer size in bytes. Integer value.',
              'Sets the size in bytes of the transactional buffer the webscript will allocate to guard against the potential rollback of a transaction during the webscript processing. If a rollback occurs and the buffer has not been filled, then it is able to rollback without any output from the webscript being committed to the container output stream. This means error responses can be returned instead of partially formed responses with an error embedded into them.',
              'Buffers are only present where a transaction is required, otherwise they are not used.',
              'For some webscripts, a buffer is not appropriate and would actually be detrimental to performance - the webscript might require direct access to the output stream not a wrapped buffer object - the remoteadm webscripts are such an example.',
            ].join('\n\n'),
            'http://docs.alfresco.com/5.1/references/api-wsdl-transaction.html');
          } else {
            props.transactionBuffersize = undefined;
          }
          return disp;
        }.bind(this),
        message: 'What  <transaction ' + chalk.yellow('@buffersize') + '> should be allocated?',
        validate: function(input) {
          // allow empty or a number
          return (_.isEmpty(input) || /^\d+$/.test(input) ? true : 'Leave empty to accept default or specify an integer representing the desired size in bytes.');
        },
        filter: transactionBuffersizeFilter,
      },
      {
        type: 'input',
        name: 'families',
        option: {
          name: 'families',
          config: {
            desc: 'Vertical bar \'|\' separated list of webscript families',
            alias:'I',
            type:'String',
          }
        },
        when: function(props) {
          var f = familiesFilter(this.options['families']);
          if (undefined !== f) {
            props.families = f;
            this.out.info("Using families from command line: " + chalk.reset.dim.cyan(props.families));
            return false;
          }
          this.out.docs(
            'The family element allows a web script developer to categorize their web scripts. Any value can be assigned to family and any number of families can be assigned to the web script, providing a freeform tagging mechanism. The web script index provides views for navigating web scripts by family. The family tag can be repeated if the script belongs to multiple families. The family element is optional.',
            'http://docs.alfresco.com/5.1/references/api-wsdl-family.html');
          return true;
        }.bind(this),
        message: 'Provide a ' + chalk.green('|') + ' separated list of ' + chalk.yellow('<family>') + ' values',
        validate: function(input) {
          return (input.indexOf('.') === -1 ? true : 'Don\'t use ' + chalk.green('.') + ' in family names. E.g. my' + chalk.green('.') + 'family would cause an error if using the family name to navigate to the script.');
        },
        filter: familiesFilter,
      },
      {
        type: 'list',
        name: 'cacheNever',
        option: {
          name: 'cache-never',
          config: {
            desc: 'Disable caching, pass false to enable caching',
            alias:'C',
            type:'Boolean',
          }
        },
        when: function(props) {
          var c = cacheNeverFilter(this.options['cache-never']);
          if (undefined !== c) {
            props.cacheNever = c;
            this.out.info("Using cache never flag from command line: " + chalk.reset.dim.cyan(props.cacheNever));
            return false;
          }
          this.out.docs('Specifies whether caching should be applied at all. Valid values, which are optional, are as follows:');
          this.out.definition('true', '(default) specifies the web script response should never be cached.');
          this.out.definition('false', 'specifies the web script response can be cached.');
          this.out.docs(undefined, 'http://docs.alfresco.com/5.1/references/api-wsdl-cache.html');
          this.out.docs(undefined, 'http://docs.alfresco.com/5.1/concepts/ws-caching-about.html');
          return true;
        }.bind(this),
        choices: ['true', 'false'],
        message: 'Should we disable all response caching?',
      },
      {
        // TODO(bwavell): validate that the default is false as the docs are inconsistent
        type: 'list',
        name: 'cachePublic',
        option: {
          name: 'cache-public',
          config: {
            desc: 'Allow public caching',
            alias:'P',
            type:'Boolean',
          }
        },
        when: function(props) {
          var c = cachePublicFilter(this.options['cache-public']);
          if (undefined !== c) {
            props.cachePublic = c;
            this.out.info("Using cache public flag from command line: " + chalk.reset.dim.cyan(props.cachePublic));
            return false;
          }
          if ('false' === props.cacheNever) {
            this.out.docs('Specifies whether authneticated responses should be cached in the public cache. Valid values, which are optional, are as follows:');
            this.out.definition('false', '(default) specifies the web script authenticated response cannot be cached in a public cache.');
            this.out.definition('true', 'specifies the web script authenticated response can be cached in a public cache.');
            this.out.docs(undefined, 'http://docs.alfresco.com/5.1/references/api-wsdl-cache.html');
            return true;
          } else {
            props.cachePublic = 'false';
          }
          return false;
        }.bind(this),
        choices: ['false', 'true'],
        message: 'Should we allow caching of authenticated responses in public caches?',
      },
      {
        // TODO(bwavell): validate that the default is false as the docs are inconsistent
        type: 'list',
        name: 'cacheMustrevalidate',
        option: {
          name: 'cache-must-revalidate',
          config: {
            desc: 'Force revalidation',
            alias:'R',
            type:'Boolean',
          }
        },
        when: function(props) {
          var c = cacheMustRevalidateFilter(this.options['cache-must-revalidate']);
          if (undefined !== c) {
            props.cacheMustrevalidate = c;
            this.out.info("Using cache must revalidate flag from command line: " + chalk.reset.dim.cyan(props.cacheMustrevalidate));
            return false;
          }
          if ('false' === props.cacheNever) {
            this.out.docs('Specifies whether a cache must revalidate its version of the web script response in order to ensure freshness. Valid values, which are optional, are as follows:');
            this.out.definition('true', '(default) specifies that validation must occur.');
            this.out.definition('false', 'specifies that validation can occur.');
            this.out.docs(undefined, 'http://docs.alfresco.com/5.1/references/api-wsdl-cache.html');
            return true;
          } else {
            props.cacheMustrevalidate = 'true';
          }
          return false;
        }.bind(this),
        choices: ['true', 'false'],
        message: 'Should caches be required to revalidate?',
      },
      {
        // TODO(bwavell): figure out if there is a fixed list of formats/mimetypes
        type: 'input',
        name: 'negotiations',
        option: {
          name: 'negotiations',
          config: {
            desc: 'Vertical bar \'|\' separated list of format=mimetype values',
            alias:'n',
            type:'String',
          }
        },
        when: function(props) {
          var n = negotiationsFilter(this.options['negotiations']);
          if (undefined != n) {
            props.negotiations = n;
            this.out.info("Using negotiations from command line: " + chalk.reset.dim.cyan(props.negotiations));
            return false;
          }
          this.out.docs(
            'The negotiate element associates an Accept header MIME type to a specific web script format of response. The mandatory value specifies the format while the mandatory attribute, accept, specifies the MIME type. Content Negotiation is enabled with the definition of at least one negotiate element. The negotiate element can be specified zero or more times.',
            'http://docs.alfresco.com/5.1/references/api-wsdl-negotiate.html');
          return true;
        }.bind(this),
        message: 'Provide a ' + chalk.green('|') + ' separated list of ' + chalk.yellow('format') + chalk.green('=') + chalk.yellow('mimetype') + ' negotiation values',
        validate: function(input) {
          return (_.isEmpty(input) || input.indexOf('=') > -1 ? true : 'Invalid format, try ' + chalk.green('html=text/html|xml=text/xml'));
        },
        filter: negotiationsFilter,
      },
      {
        type: 'list',
        name: 'lifecycle',
        option: {
          name: 'lifecycle',
          config: {
            desc: 'Webscript lifecycle',
            alias:'L',
            type:'String',
          }
        },
        when: function(props) {
          var l = lifecycleFilter(this.options['lifecycle']);
          if (undefined != l) {
            props.lifecycle = l;
            this.out.info("Using lifecycle from command line: " + chalk.reset.dim.cyan(props.lifecycle));
            return false;
          }
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
        }.bind(this),
        choices: LIFECYCLES,
        message: 'What is the ' + chalk.yellow('<lifecycle>') + ' state of the webscript?',
      },
      {
        // TODO(bwavell): figure out what the default is
        type: 'list',
        name: 'formdataMultipartProcessing',
        option: {
          name: 'multipart',
          config: {
            desc: 'Enable multipart form data processing',
            alias:'U',
            type:'Boolean',
          }
        },
        when: function(props) {
          var u = formdataMultipartProcessingFilter(this.options['multipart']);
          if (undefined != u) {
            props.formdataMultipartProcessing = u;
            this.out.info("Using multipart-processing formdata from command line: " + chalk.reset.dim.cyan(props.formdataMultipartProcessing));
            return false;
          }
          this.out.docs('Specifies whether multi-part processing should be on or off. Valid values, which are optional, are as follows:');
          this.out.definition('false', 'turns off multi-part form data processing.');
          this.out.definition('true', 'turns on multi-part form data processing.');
          this.out.docs(undefined, 'http://docs.alfresco.com/5.1/references/api-wsdl-formdata.html');
          return true;
        }.bind(this),
        choices: ['false', 'true'],
        message: 'Should we enable <formdata ' + chalk.yellow('@multipart-processing') + '> for the the webscript?',
      },
      {
        type: 'input',
        name: 'args',
        option: {
          name: 'args',
          config: {
            desc: 'Vertical bar \'|\' separated list of name=description values',
            alias:'g',
            type:'String',
          }
        },
        when: function(props) {
          var a = argsFilter(this.options['args']);
          if (undefined != a) {
            props.args = a;
            this.out.info("Using args from command line: " + chalk.reset.dim.cyan(props.args));
            return false;
          }
          this.out.docs(
            'The args element represents a list of arguments passed to the web script. This are listed for documentation purposes. The args element is optional.',
            'http://docs.alfresco.com/5.1/references/api-wsdl-args.html');
          return true;
        }.bind(this),
        message: 'Provide a ' + chalk.green('|') + ' separated list of ' + chalk.yellow('name') + chalk.green('=') + chalk.yellow('description') + ' values',
        validate: function(input) {
          return (_.isEmpty(input) || input.indexOf('=') > -1 ? true : 'Invalid format, try ' + chalk.green('application=Name of the audit application|fromTime=Time in ms of the oldest audit entry'));
        },
        filter: argsFilter,
      },
      {
        type: 'input',
        name: 'requests',
        option: {
          name: 'requests',
          config: {
            desc: 'Vertical bar \'|\' separated list of request types',
            alias:'q',
            type:'String',
          }
        },
        when: function(props) {
          var q = requestsFilter(this.options['requests']);
          if (undefined != q) {
            props.requests = q;
            this.out.info("Using request types from command line: " + chalk.reset.dim.cyan(props.requests));
            return false;
          }
          this.out.docs(
            'The requests element represents a collection of request types for the web script. The requests element is optional.',
            'http://docs.alfresco.com/5.1/references/api-wsdl-requests.html');
          return true;
        }.bind(this),
        message: 'Provide a ' + chalk.green('|') + ' separated list of <request ' + chalk.yellow('@type') + '> values',
        filter: requestsFilter,
      },
      {
        type: 'input',
        name: 'responses',
        option: {
          name: 'responses',
          config: {
            desc: 'Vertical bar \'|\' separated list of response types',
            alias:'S',
            type:'String',
          }
        },
        when: function(props) {
          var s = responsesFilter(this.options['responses']);
          if (undefined != s) {
            props.responses = s;
            this.out.info("Using response types from command line: " + chalk.reset.dim.cyan(props.responses));
            return false;
          }
          this.out.docs(
            'The responses element represents a collection of response types for the web script. The responses element is optional.',
            'http://docs.alfresco.com/5.1/references/api-wsdl-responses.html');
          return true;
        }.bind(this),
        message: 'Provide a ' + chalk.green('|') + ' separated list of <response ' + chalk.yellow('@type') + '> values',
        filter: responsesFilter,
      },
    ];

    this.setupArgumentsAndOptions(this.prompts);
  },

  prompting: function () {
    this.subgeneratorPrompt(this.prompts, function(props) {
      props.negotiations = (props.negotiations ? JSON.parse(props.negotiations) : {});
      props.args = (props.args ? JSON.parse(props.args) : {});
      this.props = props;

      var targetModule = props.targetModule.module;
      var modulePath = this.destinationPath(targetModule.path);
      var wsRoot = ('repo' === targetModule.war ?
        'src/main/amp/config/alfresco/extension/templates/webscripts' :
        'src/main/amp/config/alfresco/web-extension/site-webscripts'
      );
      var genRoot = ('repo' === targetModule.war ?
        'src/main/amp/config/alfresco/module/' + path.basename(targetModule.path) + '/context/generated' :
        'src/main/amp/config/alfresco/web-extension'
      );
      var configSrcPath = this.templatePath('config.xml');
      var descSrcPath = this.templatePath('desc.xml.ejs');
      var javaSrcPath = this.templatePath(props.javaBaseClass + '.java');
      var jsSrcPath = this.templatePath('controller.js');
      var wsSrcPath = this.templatePath('webscript-context.xml');
      var descPath = path.join(modulePath, wsRoot, props.package);
      var genPath = path.join(modulePath, genRoot);
      props.methods.forEach(function(method) {
        var descName = props.id + '.' + method + '.desc.xml';
        var destPath = path.join(descPath, descName)
        this.out.info('Generating ' + descName + ' in ' + descPath);
        this.fs.copyTpl(descSrcPath, destPath, props);
        // JavaScript || Both Java & JavaScript
        if ('Java' !== props.language) {
          var jsControllerName = props.id + '.' + method + '.js';
          var jsControllerPath = path.join(descPath, jsControllerName);
          this.out.info('Generating ' + jsControllerName + ' in ' + descPath);
          this.fs.copyTpl(jsSrcPath, jsControllerPath, props);

          //if('repo' === props.war) {
            var configName = props.id + '.' + method + '.config.xml';
            var configPath = path.join(descPath, configName);
            this.out.info('Generating ' + configName + ' in ' + descPath);
            this.fs.copyTpl(configSrcPath, configPath, props);
          //}
        }
        // Java || Both Java & JavaSctip
        if ('JavaScript' !== props.language) {
          var pkg = props.package.replace(/\//g, '.').substring(1);
          props.classPackage = pkg + '.webscripts';
          props.className = _.upperFirst(_.camelCase(props.id)) + _.upperFirst(method) + 'Webscript';
          props.qualifiedClassName = props.classPackage + '.' + props.className;
          props.beanId = 'webscript.' + pkg + '.' + props.id + '.' + method;
          var javaControllerName = props.className + '.java';
          var javaClassPath = path.join(modulePath, 'src/main/java', props.package, 'webscripts');
          var javaControllerPath = path.join(javaClassPath, javaControllerName);
          this.out.info('Generating ' + javaControllerName + ' in ' + javaClassPath);
          this.out.info('FROM ' + javaSrcPath);
          this.fs.copyTpl(javaSrcPath, javaControllerPath, props);
          var contextName = 'webscript-' + props.id + '-' + method + '-context.xml';
          var contextPath = path.join(genPath, contextName);
          this.out.info('Generating ' + contextName + ' in ' + genPath);
          this.fs.copyTpl(wsSrcPath, contextPath, props);
        }
        props.templateFormats.forEach(function(format) {
          var fmtPath = this.templatePath(format + '.ftl');
          var tplName = props.id + '.' + method + '.' + format + '.ftl'
          var tplPath = path.join(descPath, tplName);
          this.out.info('Generating ' + tplName + ' in ' + descPath);
          this.fs.copyTpl(fmtPath, tplPath, props);
        }.bind(this));
        // NOTE: consider prompting for supported locales. Realizing there are a large number of them
        // and we likely won't have sample data for all locales.
        ['de', 'en', 'es', 'fr'].forEach(function(locale) {
          var propPath = this.templatePath(locale + '.properties');
          var localeName = props.id + '.' + method + ('en' == locale ? '' : '.' + locale) + '.properties';
          var localePath = path.join(descPath, localeName);
          this.out.info('Generating ' + localeName + ' in ' + descPath);
          this.fs.copyTpl(propPath, localePath, props);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  },

  writing: function () {
    if (this.bail) return;
  },

  install: function () {
    if (this.bail) return;
  }

});

// =======================================
// FILTER FUNCTIONS FOR GENERATOR
// =======================================

function idFilter(id) {
  if (!_.isString(id)) return undefined;
  var retv = _.kebabCase(id);
  // if after kebabbing our id we don't have anything left treat as undefined
  if (_.isEmpty(retv)) return undefined
  return retv;
}

function packageFilter(pkg) {
  if (!_.isString(pkg) || _.isEmpty(pkg)) return undefined;
  // To begin with, if package is provided in dot notation replace dots with slashes
  // also, treat spaces like path separators
  var output = pkg.replace(/[\.\s]/g, '/');
  // package/path should start with a slash
  if (!_.startsWith(output, '/')) {
    output = '/' + output;
  }
  // package/path should not end with a slash
  output = output.replace(/[\/\s]*$/g, '');
  // package/path should be all lower case
  output = output.toLocaleLowerCase();
  // if after cleanup all we have is a / then treat as undefined
  if ('/' === output) return undefined;
  return output;
}

function languageFilter(lang) {
  if (!_.isString(lang) || _.isEmpty(lang)) return undefined;
  var l = lang.toLocaleLowerCase();
  if ('java' === l) return 'Java';
  if ('javascript' === l) return 'JavaScript';
  if ('both' === l) return 'Both Java & JavaScript';
  return undefined;
}

function javaBaseClassFilter(clazz) {
  return filters.chooseOneStartsWithFilter(clazz, JAVA_BASE_CLASSES);
}

function methodsFilter(methods) {
  return filters.requiredTextListFilter(methods, ',', METHODS)
}

function templateFormatsFilter(templateFormats) {
  return filters.requiredTextListFilter(templateFormats, ',', TEMPLATE_FORMATS);
}

function kindFilter(kind) {
  return filters.optionalTextFilter(kind);
}

function shortnameFilter(shortname) {
  return filters.requiredTextFilter(shortname);
}

function descriptionFilter(description) {
  return filters.optionalTextFilter(description);
}

function urlTemplatesFilter(templates) {
  var urls = filters.requiredTextListFilter(templates, '|');
  if (urls) {
    return urls.map(function(url) {
      return (_.startsWith(url, '/')
       ? url
       : '/' + url)
    });
  }
  return urls;
}

function formatSelectorFilter(formatSelector) {
  return filters.chooseOneStartsWithFilter(formatSelector, FORMAT_SELECTORS);
}

function formatDefaultFilter(format, formats) {
  return filters.chooseOneStartsWithFilter(format, formats);
}

function authenticationFilter(authentication) {
  return filters.chooseOneStartsWithFilter(authentication, AUTHENTICATIONS);
}

function authenticationRunasFilter(runas) {
  return filters.optionalTextFilter(runas);
}

function transactionFilter(transaction) {
  return filters.chooseOneFilter(transaction, TRANSACTIONS);
}

function transactionAllowanceFilter(transactionAllow) {
  return filters.chooseOneFilter(transactionAllow, TRANSACTION_ALLOWANCES);
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
function transactionBuffersizeFilter(buffersize) {
  if (undefined === buffersize || null === buffersize) return undefined;
  if (true === buffersize) return '';
  if (isNaN(buffersize)) return '';
  if (_.isNumber(buffersize)) return parseInt(buffersize);
  if (_.isEmpty(buffersize)) return '';
  return parseInt(buffersize);
}

function familiesFilter(families) {
  return filters.textListFilter(families, '|');
}

function cacheNeverFilter(never) {
  return filters.booleanTextFilter(never);
}

function cachePublicFilter(cache) {
  return filters.booleanTextFilter(cache);
}

function cacheMustRevalidateFilter(cache) {
  return filters.booleanTextFilter(cache);
}

function negotiationsFilter(negotiations) {
  if (true === negotiations) return '';
  if (!_.isString(negotiations) || _.isEmpty(negotiations)) return undefined;
  var negotiationList = negotiations.split(/\s*\|\s*/);
  var valSet = false;
  var retv = negotiationList.reduce(function(negotiations, negotiation) {
      var negotiationItems = negotiation.split(/\s*=\s*/);
      if (negotiationItems.length >= 2) {
        negotiations[negotiationItems[0]] = negotiationItems[1];
        valSet = true;
      }
      return negotiations;
    }, {});
  if (valSet) return JSON.stringify(retv);
  return undefined;
}

function lifecycleFilter(lifecycle) {
  return filters.chooseOneStartsWithFilter(lifecycle, LIFECYCLES);
}

function formdataMultipartProcessingFilter(multipart) {
  return filters.booleanTextFilter(multipart);
}

function argsFilter(args) {
  if (true === args) return '{}';
  if (_.isEmpty(args)) return undefined;
  var argsList = args.split(/\s*\|\s*/);
  return JSON.stringify(argsList.reduce(function(args, arg) {
    var argItems = arg.split(/\s*=\s*/);
    if (argItems.length >= 2) {
      args[argItems[0]] = argItems[1];
    }
    return args;
  }, {}));
}

function requestsFilter(requests) {
  return filters.textListFilter(requests, '|')
}

function responsesFilter(responses) {
  return filters.textListFilter(responses, '|')
}

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
