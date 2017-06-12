'use strict';
const _ = require('lodash');
const AsciiTable = require('ascii-table');
const chalk = require('chalk');
const debug = require('debug')('generator-alfresco:app');
const fs = require('fs');
const Generator = require('yeoman-generator');
const path = require('path');
const rmdir = require('rmdir');
const semver = require('semver');
const trace = require('debug')('generator-alfresco-trace:app');
const constants = require('generator-alfresco-common').constants;
const memFsUtils = require('generator-alfresco-common').mem_fs_utils;
const versions = require('generator-alfresco-common').dependency_versions;

class AlfrescoGenerator extends Generator {
  _getConfigValue (key) {
    if (!_.isNil(key)) {
      if (!_.isNil(this.config.get(key))) {
        return this.config.get(key);
      } else if (this.defaultConfig) {
        return this.defaultConfig[key];
      }
    }
    return undefined;
  }

  _whenNotBail (that) {
    return readonlyProps => {
      return !this.bail;
    };
  }

  initializing () {
    debug('initializing generator-alfresco');
    this.out = require('generator-alfresco-common').generator_output(this);

    this.pkg = require('../../package.json');
    this.sdkVersions = require('../common/sdk-versions.js');
    debug('assigning default values');
    this.defaultConfig = {};
    this.defaultConfig[constants.PROP_SDK_VERSION] = '2.1.1';
    this.defaultConfig[constants.PROP_PROJECT_STRUCTURE] = constants.PROJECT_STRUCTURE_BASIC;
    this.defaultConfig[constants.PROP_PROJECT_GROUP_ID] = 'org.alfresco';
    this.defaultConfig[constants.PROP_PROJECT_ARTIFACT_ID] = path.basename(process.cwd());
    this.defaultConfig[constants.PROP_PROJECT_VERSION] = '1.0.0-SNAPSHOT';
    this.defaultConfig[constants.PROP_PROJECT_PACKAGE] = 'org.alfresco';
    this.defaultConfig[constants.PROP_COMMUNITY_OR_ENTERPRISE] = 'Community';
    this.defaultConfig[constants.PROP_REMOVE_DEFAULT_SOURCE_AMPS] = true;
    this.defaultConfig[constants.PROP_REMOVE_DEFAULT_SOURCE_SAMPLES] = true;
    this.bail = false;
    try {
      debug('grabbing node version');
      if (semver.lt(process.versions.node, '4.5.0')) {
        throw new Error('Node 4.5.0 or above is required you are using: ' + process.versions.node + '.');
      }
      debug('grabbing current java version');
      this.javaVersion = versions.getJavaVersion();
      if (!this.javaVersion) {
        throw new Error('We are unable to find a java executable. A compatible version of java is required.');
      }
      debug('grabbing current maven version');
      this.mavenVersion = versions.getMavenVersion();
      if (!this.mavenVersion) {
        throw new Error('We are unable to find a maven executable. A compatible version of maven is required.');
      }
      debug('checking if we are running in an existing non-generator-alfresco project directory');
      let configJSON;
      try { configJSON = this.fs.readJSON('.yo-rc.json') } catch (err) { /* ignore */ }
      if (!_.isEmpty(configJSON) && !configJSON['generator-alfresco']) {
        throw new Error('The generator ' + chalk.blue('generator-alfresco') + ' must be run in a location where there are no other yeoman based generator projects up the folder hierarchy');
      }
    } catch (e) {
      this.out.error(e.message);
      this.bail = true;
    }
    this.answerOverrides = {};
  }

  prompting () {
    if (this.bail) return;

    debug('displaying banner/logo');
    this.out.banner();

    debug('defining prompts');
    const prompts = [
      {
        type: 'confirm',
        name: constants.PROP_ABORT_EXISTING_PROJECT,
        when: () => {
          if (this.bail) return false;
          // If we find the .yo-rc.json file, show the warning
          if (fs.existsSync(this.config.path)) {
            this.out.warn(
              'You are running the command within an existing project '
              + chalk.green('"' + this._getConfigValue(constants.PROP_PROJECT_ARTIFACT_ID) + '"')
              + ' located at ' + chalk.green('"' + path.dirname(this.config.path) + '"') + '.'
              + ' Aborting will exit the generator. If you choose not to abort,'
              + ' the generator will continue with its interview questions.'
            );
            return true;
          } else {
            return false;
          }
        },
        default: true,
        message: 'Do you want to abort?',
      },
      {
        type: 'list',
        name: constants.PROP_SDK_VERSION,
        when: readonlyProps => {
          if (readonlyProps[constants.PROP_ABORT_EXISTING_PROJECT]) {
            this.bail = true;
          }
          if (this.bail) return false;

          const compTable = new AsciiTable('Version Compatibility Table');
          compTable.setHeading('SDK', 'Community Default', 'Enterprise Default', 'Notes');
          _.keys(this.sdkVersions).forEach(ver => {
            compTable.addRow(
              ver,
              this.sdkVersions[ver].providedCommunityVersion,
              this.sdkVersions[ver].providedEnterpriseVersion,
              this.sdkVersions[ver].supportedRepositoryVersions
            );
          });
          this.out.docs(compTable.toString(), 'http://docs.alfresco.com/5.1/concepts/alfresco-sdk-compatibility.html');

          return true;
        },
        default: this._getConfigValue(constants.PROP_SDK_VERSION),
        message: 'Which SDK version would you like to use?',
        choices: _.keys(this.sdkVersions),
      },
      {
        type: 'input',
        name: constants.PROP_ARCHETYPE_VERSION,
        message: 'Archetype version?',
        default: () => {
          const savedArchetypeVersion = this._getConfigValue(constants.PROP_ARCHETYPE_VERSION);
          if (savedArchetypeVersion) return savedArchetypeVersion;
          return this.sdk.archetypeVersion;
        },
        when: readonlyProps => {
          if (this.bail) return false;
          this.sdk = this.sdkVersions[readonlyProps.sdkVersion || this.answerOverrides.sdkVersion];
          if (this.sdk.promptForArchetypeVersion) {
            return true;
          } else {
            // if we don't prompt then save the version anyway
            this.answerOverrides[constants.PROP_ARCHETYPE_VERSION] = this.sdk.archetypeVersion;
            return false;
          }
        },
      },
      {
        type: 'list',
        name: constants.PROP_PROJECT_STRUCTURE,
        when: () => {
          if (this.bail) return false;
          this.out.definition('basic', 'The basic structure adds scripts and a folder to hold source amp project templates to the default All-In-One project structure. It also adds few helpful files.');
          this.out.definition('advanced', 'The advanced structure extends the basic structure by adding a customizations folder for grouping source modules. The customizations folder also includes sub-folders for storing pre-built AMPs and JARs.');
          return true;
        },
        default: this._getConfigValue(constants.PROP_PROJECT_STRUCTURE),
        message: 'Do you want to use the basic or advanced project structure?',
        choices: constants.PROJECT_STRUCTURES,
      },
      {
        type: 'input',
        name: constants.PROP_PROJECT_GROUP_ID,
        message: 'Project groupId?',
        default: this._getConfigValue(constants.PROP_PROJECT_GROUP_ID),
        when: this._whenNotBail(this),
      },
      {
        type: 'input',
        name: constants.PROP_PROJECT_ARTIFACT_ID,
        when: this._whenNotBail(this),
        default: this._getConfigValue(constants.PROP_PROJECT_ARTIFACT_ID),
        message: 'Project artifactId?',
      },
      {
        // When run inside a existing project
        type: 'confirm',
        name: constants.PROP_ABORT_PROJECT_ARTIFACT_ID_UPDATE,
        when: readonlyProps => {
          if (this.bail) return false;
          if (fs.existsSync(this.config.path) && !_.isEqual(readonlyProps[constants.PROP_PROJECT_ARTIFACT_ID], this._getConfigValue(constants.PROP_PROJECT_ARTIFACT_ID))) {
            return true;
          }
          return false;
        },
        default: true,
        message: 'Updating the artifactId can lead to unexpected issues. Do you want to abort?',
      },
      {
        // When run inside a non-existing project
        type: 'confirm',
        name: constants.PROP_CREATE_SUB_FOLDER,
        when: readonlyProps => {
          if (readonlyProps[constants.PROP_ABORT_PROJECT_ARTIFACT_ID_UPDATE]) {
            this.bail = true;
          }
          if (this.bail) return false;
          if (!fs.existsSync(this.config.path) && !_.isEqual(readonlyProps[constants.PROP_PROJECT_ARTIFACT_ID], this._getConfigValue(constants.PROP_PROJECT_ARTIFACT_ID))) {
            this.out.warn('The artifactId must match the name of the artifact folder. As such, we are going to create a sub-folder in the existing folder named: "'
              + readonlyProps[constants.PROP_PROJECT_ARTIFACT_ID] + '".');
            return true;
          }
          return false;
        },
        default: true,
        message: 'Do you want to proceed?',
      },
      {
        type: 'input',
        name: constants.PROP_PROJECT_VERSION,
        when: readonlyProps => {
          if (!_.isNil(readonlyProps[constants.PROP_CREATE_SUB_FOLDER]) && !readonlyProps[constants.PROP_CREATE_SUB_FOLDER]) {
            this.bail = true;
          }
          if (this.bail) return false;
          return true;
        },
        default: this._getConfigValue(constants.PROP_PROJECT_VERSION),
        message: 'Project version?',
      },
      {
        type: 'input',
        name: constants.PROP_PROJECT_PACKAGE,
        message: 'Project package?',
        default: readonlyProps => {
          return readonlyProps.projectGroupId;
        },
        when: readonlyProps => {
          if (this.bail) return false;
          this.sdk = this.sdkVersions[readonlyProps.sdkVersion || this.answerOverrides.sdkVersion];
          return this.sdk.promptForProjectPackage;
        },
      },
      {
        type: 'list',
        name: constants.PROP_COMMUNITY_OR_ENTERPRISE,
        message: 'Would you like to use Community or Enterprise?',
        default: this._getConfigValue(constants.PROP_COMMUNITY_OR_ENTERPRISE),
        choices: ['Community', 'Enterprise'],
        when: this._whenNotBail(this),
      },
      {
        type: 'confirm',
        name: constants.PROP_REMOVE_DEFAULT_SOURCE_AMPS,
        message: 'Should we remove the default source amps?',
        default: this._getConfigValue(constants.PROP_REMOVE_DEFAULT_SOURCE_AMPS),
        when: readonlyProps => {
          if (this.bail) return false;
          this.sdk = this.sdkVersions[readonlyProps.sdkVersion || this.answerOverrides.sdkVersion];
          this.answerOverrides[constants.PROP_REMOVE_DEFAULT_SOURCE_AMPS]
            = (this.sdk.removeDefaultModules !== undefined);
          return this.answerOverrides[constants.PROP_REMOVE_DEFAULT_SOURCE_AMPS];
        },
      },
      {
        type: 'confirm',
        name: constants.PROP_REMOVE_DEFAULT_SOURCE_SAMPLES,
        message: 'Should we remove samples from the default source amps?',
        default: this._getConfigValue(constants.PROP_REMOVE_DEFAULT_SOURCE_SAMPLES),
        when: readonlyProps => {
          if (this.bail) return false;
          if (readonlyProps[constants.PROP_REMOVE_DEFAULT_SOURCE_AMPS]) {
            this.answerOverrides[constants.PROP_REMOVE_DEFAULT_SOURCE_SAMPLES] = false;
          } else {
            this.sdk = this.sdkVersions[readonlyProps.sdkVersion || this.answerOverrides.sdkVersion];
            this.answerOverrides[constants.PROP_REMOVE_DEFAULT_SOURCE_SAMPLES]
              = ((this.sdk.removeRepoSamples !== undefined) || (this.sdk.removeShareSamples !== undefined));
          }
          return this.answerOverrides[constants.PROP_REMOVE_DEFAULT_SOURCE_SAMPLES];
        },
      },
    ];

    debug('initiating prompting and returning promise for inquierer completion');
    return this.prompt(prompts).then(props => {
      let combinedProps = {};
      _.assign(combinedProps, this.answerOverrides);
      _.assign(combinedProps, props);
      // The below 2 if conditions are here because the prompts used in testing
      // are not injected into the prompts
      if (!_.isNil(combinedProps[constants.PROP_ABORT_EXISTING_PROJECT]) && combinedProps[constants.PROP_ABORT_EXISTING_PROJECT]) {
        this.bail = true;
      }
      if (!_.isNil(combinedProps[constants.PROP_CREATE_SUB_FOLDER]) && !combinedProps[constants.PROP_CREATE_SUB_FOLDER]) {
        this.bail = true;
      }
      if (!this.bail) {
        combinedProps.generatorVersion = this.pkg.version;
        if (!this.config.get(constants.PROP_ORIGINAL_GENERATOR_VERSION)) {
          combinedProps[constants.PROP_ORIGINAL_GENERATOR_VERSION] = this.pkg.version;
        }
        if (!fs.existsSync(this.config.path) && !_.isEqual(combinedProps[constants.PROP_PROJECT_ARTIFACT_ID], this._getConfigValue(constants.PROP_PROJECT_ARTIFACT_ID))) {
          const projectPath = path.join(process.cwd(), combinedProps[constants.PROP_PROJECT_ARTIFACT_ID]);
          if (!_.isNil(projectPath) && !_.isEqual(process.cwd(), projectPath)) {
            if (!fs.existsSync(projectPath)) {
              fs.mkdirSync(projectPath);
            }
            process.chdir(projectPath);
            this.destinationRoot(projectPath);
          }
        }
        this.sdk = this.sdkVersions[combinedProps.sdkVersion || this.answerOverrides.sdkVersion];
        this._saveProps([
          constants.PROP_ORIGINAL_GENERATOR_VERSION,
          constants.PROP_GENERATOR_VERSION,
          constants.PROP_SDK_VERSION,
          constants.PROP_ARCHETYPE_VERSION,
          constants.PROP_PROJECT_STRUCTURE,
          constants.PROP_PROJECT_GROUP_ID,
          constants.PROP_PROJECT_ARTIFACT_ID,
          constants.PROP_PROJECT_VERSION,
          constants.PROP_PROJECT_PACKAGE,
          constants.PROP_COMMUNITY_OR_ENTERPRISE,
          constants.PROP_REMOVE_DEFAULT_SOURCE_AMPS,
          constants.PROP_REMOVE_DEFAULT_SOURCE_SAMPLES,
        ], combinedProps);
        // can only setup module registry/manager once we have other variables setup
        this.moduleManager = require('../common/alfresco-module-manager.js')(this);
      }
    });
  }

  _saveProp (propName, propObject) {
    const value = propObject[propName];
    this[propName] = value;
    this.config.set(propName, value);
  }

  _saveProps (propNames, propObject) {
    propNames.forEach(propName => {
      // console.log("SETTING " + propName + " to " + propObject[propName]);
      this._saveProp(propName, propObject);
    });
  }

  configuring () {
    if (this.bail) return;
    debug('saving config');
    this.config.save();
  }

  default () {
    if (this.bail) return;
    try {
      this.out.info('Checking java version for sdk compatibility');
      if (!semver.satisfies(this.javaVersion.replace(/_[0-9]+$/, ''), this.sdk.supportedJavaVersions)) {
        throw new Error('Unfortunately the current version of java (' + this.javaVersion + ') '
          + 'does not match one of the supported versions: ' + this.sdk.supportedJavaVersions + ' '
          + 'for the SDK you have selected (' + this.archetypeVersion + '). '
          + 'Either set JAVA_HOME to point to a valid version of java or install one.');
      }
      this.out.info('Checking maven version for sdk compatibility');
      if (!semver.satisfies(this.mavenVersion, this.sdk.supportedMavenVersions)) {
        throw new Error('Unfortunately the current version of maven (' + this.mavenVersion + ') '
          + 'does not match one of the supported versions: ' + this.sdk.supportedMavenVersions + ' '
          + 'for the SDK you have selected (' + this.archetypeVersion + '). '
          + 'Please install a supported version.');
      }
    } catch (e) {
      this.out.error(e.message);
      this.bail = true;
    }
  }

  /**
   * Perform archetype generation and overlaying. This may do some async stuff.
   *
   * @returns {!Promise}
   */
  writing () {
    return this._writingGenerateArchetype()
      .then(() => {
        this._writingGeneratorOverlay();
        this._writingRegisterDefaultSampleModules();
        this._writingEditGeneratedResources();
        this._writingRemoveDefaultSourceModules();
        this._writingRemoveDefaultSourceModuleSamples();
      });
  }

  /**
   * Wrapper for performing archetype generation, decides if JS or Maven should be used.
   *
   * @returns {!Promise}
   * @private
   */
  _writingGenerateArchetype () {
    trace('generateArchetype');
    if (this.bail) return Promise.resolve();
    if (this.sdk.useArchetypeTemplate) {
      this._writingGenerateArchetypeUsingJavaScript();
      return Promise.resolve();
    } else {
      return this._writingGenerateArchetypeUsingMaven();
    }
  }

  /**
   * Perform archetype generation using native JS.
   *
   * @private
   */
  _writingGenerateArchetypeUsingJavaScript () {
    trace('Loading maven archetype generate module');
    const mvn = require('generator-alfresco-common').maven_archetype_generate(this);
    trace('Creating context for archetype generate');
    this.out.info('Attempting to use javascript and the ' + this.archetypeVersion + ' all-in-one archetype to setup your project.');
    const rootPath = path.join('archetypes', this.sdk.archetypeVersion);
    const metadataPath = this.templatePath(path.join(rootPath, 'META-INF', 'maven', 'archetype-metadata.xml'));
    const resourcePath = this.templatePath(path.join(rootPath, 'archetype-resources'));
    const properties = {
      groupId: this.projectGroupId,
      artifactId: this.projectArtifactId,
      version: this.projectVersion,
      package: (this.projectPackage !== undefined ? this.projectPackage : this.projectGroupId),
    };

    trace('Performing generation');
    mvn.generate(metadataPath, resourcePath, this.destinationPath(), properties);

    trace('Saving source templates');
    this._writingGenerateArchetypeBackupSourceTemplates(this.destinationPath(), true);
    trace('Done saving source templates');
  }

  /**
   * Perform archetype generation by shelling out to `mvn archetype:generate`.
   *
   * @returns {!Promise}
   * @private
   */
  _writingGenerateArchetypeUsingMaven () {
    return new Promise(resolve => {
      this.out.info('Attempting to use maven and the ' + this.archetypeVersion + ' all-in-one archetype to setup your project.');

      const cwd = process.cwd();

      const tmpdir = path.join(cwd, 'tmp');
      if (!fs.existsSync(tmpdir)) {
        fs.mkdirSync(tmpdir);
      }
      process.chdir(tmpdir);

      const cmd = 'mvn';
      let args = [
        'archetype:generate',
        '-DinteractiveMode=false',
        '-DarchetypeGroupId=' + this.sdk.archetypeGroupId,
        '-DarchetypeArtifactId=' + this.sdk.archetypeArtifactId,
        '-DarchetypeVersion=' + this.archetypeVersion,
        '-DgroupId=' + this.projectGroupId,
        '-DartifactId=' + this.projectArtifactId,
        '-Dversion=' + this.projectVersion,
      ];
      if (undefined !== this.sdk.archetypeCatalog) {
        args.push('-DarchetypeCatalog=' + this.sdk.archetypeCatalog);
      }
      if (undefined !== this.projectPackage) {
        args.push('-Dpackage=' + this.projectPackage);
      }
      const proc = this.spawnCommand(cmd, args);

      // Once mvn completes move stuff up a level
      proc.on('exit', (code, signal) => {
        this.out.info('Maven completed, processing files generated by archetype');
        process.chdir(cwd); // restore current working directory
        const genDir = path.join(tmpdir, this.projectArtifactId);
        const sdkContents = fs.readdirSync(genDir);
        sdkContents.forEach(fileOrFolder => {
          const absSourcePath = path.join(genDir, fileOrFolder);
          this.fs.copy(
            absSourcePath,
            this.destinationPath(fileOrFolder)
          );
        });

        this._writingGenerateArchetypeBackupSourceTemplates(genDir, false);

        rmdir(tmpdir, resolve);
      });
    });
  }

  _writingGenerateArchetypeBackupSourceTemplates (sourceDir, forceInMemoryCopy) {
    if (this.sdk.defaultModuleRegistry) {
      this.out.info('Attempting to backup generated amp templates');
      const folders = this.sdk.defaultModuleRegistry.call(this).map(mod => {
        return mod.artifactId;
      });
      folders.forEach(folderName => {
        const to = path.join(this.destinationPath(constants.FOLDER_SOURCE_TEMPLATES), folderName);
        if (!fs.existsSync(to)) {
          const from = path.join(sourceDir, folderName);
          this.out.info('Copying from: ' + from + ' to: ' + to);
          if (forceInMemoryCopy) {
            memFsUtils.inMemoryCopy(this.fs, from, to);
          } else {
            this.fs.copy(from, to);
          }
        } else {
          this.out.warn('Not copying ' + folderName + ' as it has already been backed up');
        }
      });
    } else {
      this.out.warn('Not backing up generated amp templates as we don\'t have default modules defined for this '
        + 'version of the SDK.');
    }
  }

  _writingGeneratorOverlay () {
    trace('generatorOverlay');
    if (this.bail) return;
    const isEnterprise = (this.communityOrEnterprise === 'Enterprise');
    const tplContext = {
      isEnterprise: isEnterprise,
      enterpriseFlag: (isEnterprise ? '-Penterprise' : ''),
      projectGroupId: this.config.get(constants.PROP_PROJECT_GROUP_ID),
      projectArtifactId: this.config.get(constants.PROP_PROJECT_ARTIFACT_ID),
      projectVersion: this.config.get(constants.PROP_PROJECT_VERSION),
      removeDefaultSourceAmps: this.config.get(constants.PROP_REMOVE_DEFAULT_SOURCE_AMPS),
      sdkVersionPrefix: this.sdk.sdkVersionPrefix.call(this),
    };
    trace('Copying .editorconfig');
    this.fs.copy(
      this.templatePath('editorconfig'),
      this.destinationPath('.editorconfig')
    );
    trace('Copying .gitignore');
    this.fs.copy(
      this.templatePath('gitignore'),
      this.destinationPath('.gitignore')
    );
    trace('Copying TODO.md');
    this.fs.copyTpl(
      this.templatePath('TODO.md'),
      this.destinationPath('TODO.md'),
      tplContext
    );
    // copy template folders
    trace('Copying folders');
    const projectStructure = this.config.get(constants.PROP_PROJECT_STRUCTURE);
    let templateFolders = [constants.FOLDER_SOURCE_TEMPLATES, constants.FOLDER_SCRIPTS];
    if (projectStructure === constants.PROJECT_STRUCTURE_ADVANCED) {
      templateFolders = templateFolders.concat(constants.FOLDER_CUSTOMIZATIONS);
    }
    templateFolders.forEach(folderName => {
      this.out.info('Copying ' + folderName);
      this.fs.copyTpl(
        this.templatePath(folderName),
        this.destinationPath(folderName),
        tplContext
      );
    });
    // copy sdk specific scripts
    const sdkMajorVersion = this.sdk.sdkMajorVersion.call(this);
    this.out.info('Copying SDK ' + sdkMajorVersion + ' specific scripts');
    this.fs.copyTpl(
      this.templatePath('sdk' + sdkMajorVersion + '-' + constants.FOLDER_SCRIPTS),
      this.destinationPath(constants.FOLDER_SCRIPTS),
      tplContext
    );
    // copy launcher scripts like run.sh to top level folder
    trace('Copying scripts to top level folder');
    let scriptsToTop = [];
    if (sdkMajorVersion === 2) {
      scriptsToTop = [
        constants.FILE_RUN_SH, constants.FILE_RUN_BAT,
        constants.FILE_RUN_WITHOUT_SPRINGLOADED_SH, constants.FILE_DEBUG_SH,
      ];
    }
    if (sdkMajorVersion === 3) {
      scriptsToTop = [
        constants.FILE_RUN_SH, constants.FILE_RUN_BAT,
        constants.FILE_DEBUG_SH, 'debug.bat',
      ];
    }
    scriptsToTop.forEach(fileName => {
      trace('Copying ' + fileName + ' to top level folder');
      this.fs.copy(
        this.destinationPath(path.join(constants.FOLDER_SCRIPTS, fileName)),
        this.destinationPath(fileName)
      );
    });
    // enterprise specific stuff
    trace('Copying enterprise license');
    if (isEnterprise) {
      this.fs.copy(
        this.templatePath(constants.FOLDER_REPO),
        this.destinationPath(constants.FOLDER_REPO),
        tplContext);
    }
  }

  _writingRegisterDefaultSampleModules () {
    if (this.bail) return;
    if (this.sdk.registerDefaultModules) {
      this.sdk.registerDefaultModules.call(this);
    }
  }

  _writingEditGeneratedResources () {
    if (this.bail) return;
    if (!this.removeDefaultSourceAmps && this.sdk.defaultModuleRegistry) {
      let paths;
      if (this.sdk.setupNewRepoModule) {
        // Arrange for all generated beans to be included
        paths = this.sdk.defaultModuleRegistry.call(this)
          .filter(mod => {
            return (mod.war === constants.WAR_TYPE_REPO);
          })
          .map(mod => {
            return mod.path;
          });
        if (paths && paths.length > 0) {
          paths.forEach(p => {
            this.sdk.setupNewRepoModule.call(this, p);
          });
        }
      }
      if (this.sdk.setupNewShareModule) {
        // Arrange for all generated beans to be included
        paths = this.sdk.defaultModuleRegistry.call(this)
          .filter(mod => {
            return (mod.war === constants.WAR_TYPE_REPO);
          })
          .map(mod => {
            return mod.path;
          });
        if (paths && paths.length > 0) {
          paths.forEach(p => {
            this.sdk.setupNewShareModule.call(this, p);
          });
        }
      }
    }
    // Make sure customizations/pom.xml is included in the top pom
    // if advanced project structure was selected
    const projectStructure = this.config.get(constants.PROP_PROJECT_STRUCTURE);
    if (projectStructure === constants.PROJECT_STRUCTURE_ADVANCED) {
      const topPomPath = this.destinationPath('pom.xml');
      const topPomContent = this.fs.read(topPomPath);
      const topPom = require('generator-alfresco-common').maven_pom(topPomContent);
      topPom.addModule(constants.FOLDER_CUSTOMIZATIONS, true);
      this.fs.write(topPomPath, topPom.getPOMString());
    }
  }

  _writingRemoveDefaultSourceModules () {
    if (this.bail) return;
    if (this.removeDefaultSourceAmps && this.sdk.removeDefaultModules) {
      this.sdk.removeDefaultModules.call(this);
    }
  }

  _writingRemoveDefaultSourceModuleSamples () {
    if (this.bail) return;
    if (!this.removeDefaultSourceAmps && this.removeDefaultSourceSamples) {
      if (this.sdk.removeRepoSamples) {
        // TODO(bwavell): 'repo-amp' should be generalized
        this.sdk.removeRepoSamples.call(this,
          this.sdk.sdkVersionPrefix.call(this) + 'repo-amp',
          this.projectPackage
        );
      }
      if (this.sdk.removeShareSamples) {
        // TODO(bwavell): 'share-amp' should be generalized
        this.sdk.removeShareSamples.call(this,
          this.sdk.sdkVersionPrefix.call(this) + 'share-amp',
          this.projectPackage
        );
      }
    }
  }

  install () {
    this._installMakeScriptsExecutable();
    this._installBeforeExit();
  }

  _installMakeScriptsExecutable () {
    if (this.bail) return;
    const sdkMajorVersion = this.sdk.sdkMajorVersion.call(this);
    let scripts = [
      path.join(constants.FOLDER_SCRIPTS, 'explode-alf-sources.sh'),
      path.join(constants.FOLDER_SCRIPTS, 'find-exploded.sh'),
      path.join(constants.FOLDER_SCRIPTS, 'grep-exploded.sh'),
      path.join(constants.FOLDER_SCRIPTS, 'package-to-exploded.sh'),
    ];
    if (sdkMajorVersion === 2) {
      scripts = scripts.concat([
        constants.FILE_RUN_SH,
        constants.FILE_RUN_BAT,
        path.join(constants.FOLDER_SCRIPTS, 'debug.sh'),
        path.join(constants.FOLDER_SCRIPTS, constants.FILE_RUN_SH),
        path.join(constants.FOLDER_SCRIPTS, constants.FILE_RUN_BAT),
        path.join(constants.FOLDER_SCRIPTS, 'run-without-springloaded.sh'),
      ]);
    }
    if (sdkMajorVersion === 3) {
      scripts = scripts.concat([
        'debug.sh',
        'debug.bat',
        constants.FILE_RUN_SH,
        constants.FILE_RUN_BAT,
        path.join(constants.FOLDER_SCRIPTS, 'debug.sh'),
        path.join(constants.FOLDER_SCRIPTS, 'debug.bat'),
        path.join(constants.FOLDER_SCRIPTS, constants.FILE_RUN_SH),
        path.join(constants.FOLDER_SCRIPTS, constants.FILE_RUN_BAT),
      ]);
    }
    const cwd = process.cwd();
    scripts.forEach(scriptName => {
      this.out.info('Marking ' + scriptName + ' as executable');
      fs.chmodSync(cwd + '/' + scriptName, '0755');
    });
    if (this.removeDefaultSourceAmps) {
      this.out.warn('Since you choose to remove default source amps, you should probably run "' + chalk.yellow('yo alfresco:amp') + '" to add customized source amps.');
    }
  }

  _installBeforeExit () {
    if (this.bail) return;
    if (this.sdk.beforeExit) {
      this.sdk.beforeExit.call(this);
    }
  }
};

module.exports = AlfrescoGenerator;

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
