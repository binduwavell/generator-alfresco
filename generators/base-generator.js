'use strict';
const CLIGenerator = require('generator-alfresco-common').cli_generator;

/**
 * Base class for a yeoman generator in the generator-alfresco project. This
 * class provides some common things like our output handling module,
 * the SDK version for the main project and the module registry and manager.
 *
 * Lots of info in cli-generator.js code!
 */
class BaseGenerator extends CLIGenerator {
  constructor (args, opts) {
    super(args, opts);

    this.out = require('generator-alfresco-common').generator_output(this);
    this.sdkVersions = require('./common/sdk-versions.js');
    this.sdk = this.sdkVersions[this.config.get('sdkVersion')];
    this.sdkMajorVersion = (this.sdk ? this.sdk.sdkMajorVersion.call(this) : undefined);
    this.usingEnhancedAlfrescoMavenPlugin = (this.sdk ? this.sdk.usesEnhancedAlfrescoMavenPlugin.call(this) : undefined);
    this.moduleRegistry = this.options._moduleRegistry || require('generator-alfresco-common').alfresco_module_registry(this);
    this.modules = this.options._modules || this.moduleRegistry.getNamedModules();
    this.moduleManager = this.options._moduleManager || require('./common/alfresco-module-manager.js')(this);
  }
};

module.exports = BaseGenerator;

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
