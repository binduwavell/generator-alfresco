'use strict';
const _ = require('lodash');
const AdmZip = require('adm-zip');
const chalk = require('chalk');
const debug = require('debug')('generator-alfresco:amp-local');
const fs = require('fs');
const path = require('path');
const constants = require('generator-alfresco-common').constants;
const filters = require('generator-alfresco-common').prompt_filters;
const properties = require('generator-alfresco-common').java_properties;
const SubGenerator = require('../subgenerator.js');

/*
 * This is a more general form of the AmpAddLocalSubGenerator. Ideally we can
 * use the general form here as a base class for installing AMP and JAR modules.
 */
class JarAddLocalSubGenerator extends SubGenerator {
  constructor (args, opts) {
    super(args, opts);

    const possibleRepoJars = unknownModules(
      findModules(this.destinationPath(), path.join(constants.FOLDER_CUSTOMIZATIONS, constants.FOLDER_MODULES, constants.FOLDER_MODULES_PLATFORM)),
      this.moduleRegistry, '.jar');
    const possibleShareJars = unknownModules(
      findModules(this.destinationPath(), path.join(constants.FOLDER_CUSTOMIZATIONS, constants.FOLDER_MODULES, constants.FOLDER_MODULES_SHARE)),
      this.moduleRegistry, '.jar');
    this.possibleJars = _.orderBy(possibleRepoJars, 'name').concat(_.orderBy(possibleShareJars, 'name'));

    if (this.possibleJars.length > 0) {
      debug('Jar files we could link into the project: %j', this.possibleJars);
    }

    this.prompts = [
      {
        type: 'list',
        name: 'path',
        option: { name: 'path', config: { alias: 'p', desc: 'project relative path to JAR file', type: String } },
        choices: this.possibleJars,
        message: 'Which JAR would you like include?',
        commonFilter: filters.chooseOneFilterFactory(this.possibleJars),
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'groupId',
        option: { name: 'group-id', config: { alias: 'g', desc: 'amp groupId', type: String } },
        when: readonlyProps => {
          const p = (readonlyProps.path || this.answerOverrides.path);
          this.gav = getGAVFromArtifact(this.destinationPath(p));
          return true;
        },
        default: getObjectValueFactory(this, 'gav', 'groupId'),
        message: 'JAR groupId?',
        commonFilter: filters.requiredTextFilter,
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'artifactId',
        option: { name: 'artifact-id', config: { alias: 'a', desc: 'amp artifactId', type: String } },
        default: getObjectValueFactory(this, 'gav', 'artifactId'),
        message: 'JAR artifactId?',
        commonFilter: filters.requiredTextFilter,
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'ampVersion',
        option: { name: 'amp-version', config: { alias: 'v', desc: 'amp version', type: String } },
        default: getObjectValueFactory(this, 'gav', 'version'),
        message: 'JAR version?',
        commonFilter: filters.requiredVersionFilter,
        valueRequired: true,
      },
    ];

    if (!this.bail) this.setupArgumentsAndOptions(this.prompts);
  }

  prompting () {
    if (this.possibleJars.length === 0) {
      this.out.error('There are no new JARs in customizations/modules/platform or customizations/modules/share for us to import');
      this.bail = true;
    }
    if (this.bail) return;

    this.out.docs([
      'Some functionality of the Alfresco content management system is delivered as extra modules,',
      'such as Records Management (RM), Google Docs Integration, and Alfresco Office Services, which',
      'provides SharePoint Protocol support. If you have the associated JARs copied to your',
      'customizations/modules/platform and customizations/modules/share folders in this project, we',
      'can link such modules into your project.\n',
    ].join(' '));

    this.out.info([
      'This sub-generator will update existing POM\'s.',
      'Yeoman will display ' + chalk.yellow('conflict <filename>'),
      'and ask you if you want to update each file.',
      '\nType "h" when prompted to get details about your choices.'].join(' '));

    return this.subgeneratorPrompt(this.prompts, '', props => {
      this.props = props;
      if (this.props.path.startsWith(path.join(constants.FOLDER_CUSTOMIZATIONS, constants.FOLDER_MODULES, constants.FOLDER_MODULES_PLATFORM, path.sep))) {
        this.props.warType = 'repo';
      }
      if (this.props.path.startsWith(path.join(constants.FOLDER_CUSTOMIZATIONS, constants.FOLDER_MODULES, constants.FOLDER_MODULES_SHARE, path.sep))) {
        this.props.warType = 'share';
      }
      if (this.props.warType === undefined) {
        this.out.error('Did not find JAR in expected local JAR folder.');
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
      'packaging': 'jar',
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
 * Filter out anything that doesn't end with the provided
 * extension and make sure the paths are relative to
 * <projectRootPath>.
 *
 * @param {string} projectRootPath
 * @param {string} folderName
 * @param {string} extension
 * @returns {Array<string>}
 */
function findModules (projectRootPath, folderName, extension) {
  const jarFolder = path.join(projectRootPath, folderName);
  if (!fs.existsSync(jarFolder)) return [];
  return fs.readdirSync(jarFolder)
    .filter(file => {
      debug('Evaluating if %s ends in %s', file, extension);
      return file.toLowerCase().endsWith(extension);
    })
    .map(file => {
      debug('Producing relative path for %s', file);
      return path.join(folderName, file);
    });
}

/**
 * Given a list of AMPs or JARs relative to our projectRootPath,
 * we use the alfresco-module-registry to find all modules
 * that are not already referenced in the module registry.
 *
 * @param {Array<string>} modulePaths
 * @param {AlfrescoModuleRegistry} registry
 * @returns {Array<string>}
 */
function unknownModules (modulePaths, registry) {
  const mods = registry.getNamedModules();
  return modulePaths.filter(jarPath => {
    debug('Checking if there is an existing module registered with path %s', jarPath);
    return !mods.find(mod => {
      return (mod.module.path === jarPath);
    });
  });
}

/**
 * Given the project relative path to an AMP or JAR file,
 * go find the META-INF\/maven\/**\/pom.properties file
 * and convert it to an object we can use to pull default
 * GAV from for the file.
 *
 * @param {string} path
 * @returns {[Object|undefined]}
 */
function getGAVFromArtifact (path) {
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

module.exports = JarAddLocalSubGenerator;

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
