'use strict';
const _ = require('lodash');
const AdmZip = require('adm-zip');
const debug = require('debug')('generator-alfresco:amp-add-local');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const constants = require('generator-alfresco-common').constants;
const filters = require('generator-alfresco-common').prompt_filters;
const properties = require('generator-alfresco-common').java_properties;
const SubGenerator = require('../subgenerator.js');

class AmpAddLocalSubGenerator extends SubGenerator {
  constructor (args, opts) {
    super(args, opts);

    const possibleRepoAmps = unknownAmps(
      findAmps(this.destinationPath(), path.join(constants.FOLDER_CUSTOMIZATIONS, constants.FOLDER_AMPS)),
      this.moduleRegistry);
    const possibleShareAmps = unknownAmps(
      findAmps(this.destinationPath(), path.join(constants.FOLDER_CUSTOMIZATIONS, constants.FOLDER_AMPS_SHARE)),
      this.moduleRegistry);
    this.possibleAmps = _.orderBy(possibleRepoAmps, 'name').concat(_.orderBy(possibleShareAmps, 'name'));

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
        when: readonlyProps => {
          const p = (readonlyProps.path || this.answerOverrides.path);
          this.gav = getGAVFromAMP(this.destinationPath(p));
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
        name: 'ampVersion',
        option: { name: 'amp-version', config: { alias: 'v', desc: 'amp version', type: String } },
        default: getObjectValueFactory(this, 'gav', 'version'),
        message: 'Amp version?',
        commonFilter: filters.requiredVersionFilter,
        valueRequired: true,
      },
    ];

    if (!this.bail) this.setupArgumentsAndOptions(this.prompts);
  }

  prompting () {
    if (this.possibleAmps.length === 0) {
      this.out.error('There are no new amps in customizations/amps or customizations/amps_share for us to import');
      this.bail = true;
    }
    if (this.bail) return;

    this.out.docs([
      'Some functionality of the Alfresco content management system is delivered as extra modules,',
      'such as Records Management (RM), Google Docs Integration, and Alfresco Office Services, which',
      'provides SharePoint Protocol support. If you have the associated amps copied to your',
      'customizations/amps and customizations/amps_share folders in this project, we can link such',
      'modules into your project.\n',
    ].join(' '));

    this.out.info([
      'This sub-generator will update existing POM\'s and context files.',
      'Yeoman will display ' + chalk.yellow('conflict <filename>'),
      'and ask you if you want to update each file.',
      '\nType "h" when prompted to get details about your choices.'].join(' '));

    return this.subgeneratorPrompt(this.prompts, '', props => {
      this.props = props;
      if (this.props.path.startsWith(path.join(constants.FOLDER_CUSTOMIZATIONS, constants.FOLDER_AMPS, path.sep))) {
        this.props.warType = 'repo';
      }
      if (this.props.path.startsWith(path.join(constants.FOLDER_CUSTOMIZATIONS, constants.FOLDER_AMPS_SHARE, path.sep))) {
        this.props.warType = 'share';
      }
      if (this.props.warType === undefined) {
        this.out.error('Did not find AMP in expected local AMP folder.');
        this.bail = true;
      }
    }).then(() => {
      debug('prompting finished');
    });
  }

  writing () {
    if (this.bail) return;

    debug('installing %s into %s', this.props.path, this.props.warType);
    const mod = {
      'groupId': this.props.groupId,
      'artifactId': this.props.artifactId,
      'version': this.props.ampVersion,
      'packaging': 'amp',
      'war': this.props.warType,
      'location': 'local',
      'path': this.props.path,
    };
    debug('adding: %j', mod);
    this.moduleManager.addModule(mod);
    // complete all scheduled activities
    this.moduleManager.save();
  }
};

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
  const ampFolder = path.join(projectRootPath, folderName);
  if (!fs.existsSync(ampFolder)) return [];
  return fs.readdirSync(ampFolder)
    .filter(file => {
      debug('Evaluating if %s ends in .amp', file);
      return file.toLowerCase().endsWith('.amp');
    })
    .map(file => {
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
  const mods = registry.getNamedModules();
  return ampPaths.filter(ampPath => {
    debug('Checking if there is an existing module registered with path %s', ampPath);
    return !mods.find(mod => {
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
  const zip = new AdmZip(path);
  let pomPropsEntry;
  if (zip) {
    pomPropsEntry = zip.getEntries().find(entry => {
      const name = entry.entryName;
      return (name.startsWith('META-INF/maven') && name.endsWith('pom.properties'));
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
  return () => {
    if (_.isObject(obj) && obj.hasOwnProperty(prop) && _.isObject(obj[prop]) && obj[prop].hasOwnProperty(key)) {
      debug('found obj[%s][%s] = %s', prop, key, obj[prop][key]);
      return obj[prop][key];
    }
    return def || '';
  };
}

module.exports = AmpAddLocalSubGenerator;

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
