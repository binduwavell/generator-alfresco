'use strict';
var _ = require('lodash');
var AdmZip = require('adm-zip');
var debug = require('debug')('generator-alfresco:amp-local');
var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
var filters = require('../common/prompt-filters.js');
var properties = require('../common/java-properties.js');
var SubGenerator = require('../subgenerator.js');

module.exports = SubGenerator.extend({

  constructor: function () {
    SubGenerator.apply(this, arguments);

    var possibleRepoAmps = unknownAmps(findAmps(this.destinationPath(), 'amps'), this.moduleRegistry);
    var possibleShareAmps = unknownAmps(findAmps(this.destinationPath(), 'amps_share'), this.moduleRegistry);
    this.possibleAmps = _.concat(_.orderBy(possibleRepoAmps, 'name'), _.orderBy(possibleShareAmps, 'name'));

    if (this.possibleAmps.length > 0) {
      debug('Amp files we could link into the project: %j', this.possibleAmps);
    }

    this.prompts = [
      {
        type: 'list',
        name: 'path',
        option: { name: 'path', config: { alias: 'p', desc: 'project relative path to amp file', type: String } },
        choices: this.possibleAmps,
        message: 'Which amp would you like include?',
        commonFilter: filters.chooseOneFilterFactory(this.possibleAmps),
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'groupId',
        option: { name: 'group-id', config: { alias: 'g', desc: 'amp groupId', type: String } },
        when: function (props) {
          this.gav = getGAVFromAMP(this.destinationPath(props.path));
          return true;
        },
        default: getObjectValueFactory(this, 'gav', 'groupId'),
        message: 'Amp groupId?',
        commonFilter: filters.requiredTextFilter,
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'artifactId',
        option: { name: 'artifact-id', config: { alias: 'a', desc: 'amp artifactId', type: String } },
        default: getObjectValueFactory(this, 'gav', 'artifactId'),
        message: 'Amp artifactId?',
        commonFilter: filters.requiredTextFilter,
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'version',
        option: { name: 'version', config: { alias: 'v', desc: 'amp version', type: String } },
        default: getObjectValueFactory(this, 'gav', 'version'),
        message: 'Amp version?',
        commonFilter: filters.requiredVersionFilter,
        valueRequired: true,
      },
    ];

    if (!this.bail) this.setupArgumentsAndOptions(this.prompts);
  },

  prompting: function () {
    if (this.possibleAmps.length === 0) {
      this.out.error('There are no new amps in ./amps or ./amps_share for us to import');
      this.bail = true;
    }
    if (this.bail) return;

    this.out.docs([
      'Some functionality of the Alfresco content management system is delivered as extra modules,',
      'such as Records Management (RM), Google Docs Integration, and Alfresco Office Services, which',
      'provides SharePoint Protocol support. If you have the associated amps copied to your ./amps',
      'and ./amps_share folders in the project here, we can link such modules to your project.\n',
    ].join(' '));

    this.out.info([
      'This sub-generator will update existing POM\'s and context files.',
      'Yeoman will display ' + chalk.yellow('conflict <filename>'),
      'and ask you if you want to update each file.',
      '\nType "h" when prompted to get details about your choices.'].join(' '));

    this.subgeneratorPrompt(this.prompts, '', function (props) {
      this.props = props;
      this.props.warType;
      if (_.startsWith(this.props.path, 'amps/')) {
        this.props.warType = 'repo';
      }
      if (_.startsWith(this.props.path, 'amps_share/')) {
        this.props.warType = 'share';
      }
      if (this.props.warType === undefined) this.bail = true;
    }.bind(this));
  },

  writing: function () {
    if (this.bail) return;

    debug('installing %s into %s', this.props.path, this.props.warType);
    var mod = {
      'groupId': this.props.groupId,
      'artifactId': this.props.artifactId,
      'version': this.props.version,
      'packaging': 'amp',
      'war': this.props.warType,
      'location': 'local',
      'path': this.props.path,
    };
    debug('adding: %j', mod);
    this.moduleManager.addModule(mod);
    // complete all scheduled activities
    this.moduleManager.save();
  },

  /*
  install: function () {
    if (this.bail) return;
  },
  */
});

/**
 * Iterate of the children of <projectRootPath>/<folderName>
 * Filter out anything that doesn't end in .amp and
 * Make sure the paths are relative to <projectRootPath>
 *
 * @param {string} projectRootPath
 * @param {string} folderName
 * @returns {Array<string>}
 */
function findAmps (projectRootPath, folderName) {
  var ampFolder = path.join(projectRootPath, folderName);
  if (!fs.existsSync(ampFolder)) return [];
  return fs.readdirSync(ampFolder)
    .filter(function (file) {
      debug('Evaluating if %s ends in .amp', file);
      return _.endsWith(_.toLower(file), '.amp');
    })
    .map(function (file) {
      debug('Producing relative path for %s', file);
      return path.join(folderName, file);
    });
}

/**
 * Given a list of amps relative to our projectRootPath, we
 * use the alfresco-module-registry to find all amps that
 * are not already referenced in the module registry.
 *
 * @param {Array<string>} ampPaths
 * @param {AlfrescoModuleRegistry} registry
 * @returns {Array<string>}
 */
function unknownAmps (ampPaths, registry) {
  var mods = registry.getNamedModules();
  return ampPaths.filter(function (ampPath) {
    debug('Checking if there is an existing module registered with path %s', ampPath);
    return !_.find(mods, function (mod) {
      return (mod.module.path === ampPath);
    });
  });
}

/**
 * Given the project relative path to an amp file,
 * go find the META-INF\/maven\/**\/pom.properties
 * file and convert it to an object we can use to
 * pull default GAV from for the amp.
 *
 * @param {string} path
 * @returns {[Object|undefined]}
 */
function getGAVFromAMP (path) {
  var zip = new AdmZip(path);
  if (zip) {
    var pomPropsEntry = _.find(zip.getEntries(), function (entry) {
      var name = entry.entryName;
      return (_.startsWith(name, 'META-INF/maven') && _.endsWith(name, 'pom.properties'));
    });
  }
  if (pomPropsEntry) {
    return properties.parse(zip.readAsText(pomPropsEntry));
  }
}

/**
 * This is a strange beast. Given an object, a property
 * that should exist on said object and the key for a
 * property on obj[prop], we return a function that will
 * return obj[prop][key]. If anything goes wrong, a
 * default value will be returned. If no default is
 * provided and there is a problem, we'll return the
 * empty string.
 *
 * @param {Object} obj
 * @param {string} prop
 * @param {string} key
 * @param {string} def
 * @returns {Function}
 */
function getObjectValueFactory (obj, prop, key, def) {
  return function () {
    if (_.isObject(obj) && obj.hasOwnProperty(prop) && _.isObject(obj[prop]) && obj[prop].hasOwnProperty(key)) {
      debug('found obj[%s][%s] = %s', prop, key, obj[prop][key]);
      return obj[prop][key];
    }
    return def || '';
  };
}

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
