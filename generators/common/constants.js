'use strict';

module.exports = {
  FILE_DEBUG_SH: 'debug.sh',
  FILE_RUN_SH: 'run.sh',
  FILE_RUN_BAT: 'run.bat',
  FILE_RUN_WITHOUT_SPRINGLOADED_SH: 'run-without-springloaded.sh',
  FILE_CONTEXT_REPO_XML: 'context-repo.xml',
  FILE_CONTEXT_SHARE_XML: 'context-share.xml',

  FOLDER_AMPS: 'amps',
  FOLDER_AMPS_SHARE: 'amps_share',
  FOLDER_CUSTOMIZATIONS: 'customizations',
  FOLDER_MODULES: 'modules',
  FOLDER_MODULES_PLATFORM: 'platform',
  FOLDER_MODULES_SHARE: 'platform',
  FOLDER_REPO: 'repo',
  FOLDER_RUNNER: 'runner',
  FOLDER_SCRIPTS: 'scripts',
  FOLDER_SHARE: 'share',
  FOLDER_SOURCE_TEMPLATES: 'source_templates',
  FOLDER_TOMCAT: 'tomcat',

  PROJECT_STRUCTURE_BASIC: 'basic',
  PROJECT_STRUCTURE_ADVANCED: 'advanced',
  PROJECT_STRUCTURES: ['basic', 'advanced'],

  PROP_ORIGINAL_GENERATOR_VERSION: 'originalGeneratorVersion',
  PROP_GENERATOR_VERSION: 'generatorVersion',
  PROP_ARCHETYPE_VERSION: 'archetypeVersion',
  PROP_PROJECT_STRUCTURE: 'projectStructure',
  PROP_COMMUNITY_OR_ENTERPRISE: 'communityOrEnterprise',
  PROP_PROJECT_ARTIFACT_ID: 'projectArtifactId',
  PROP_ABORT_PROJECT_ARTIFACT_ID_UPDATE: 'abortProjectArtifactIdUpdate',
  PROP_CREATE_SUB_FOLDER: 'createSubFolder',
  PROP_PROJECT_ARTIFACT_ID_PREFIX: 'projectArtifactIdPrefix',
  PROP_PROJECT_GROUP_ID: 'projectGroupId',
  PROP_PROJECT_PACKAGE: 'projectPackage',
  PROP_PROJECT_VERSION: 'projectVersion',
  PROP_REMOVE_DEFAULT_SOURCE_AMPS: 'removeDefaultSourceAmps',
  PROP_REMOVE_DEFAULT_SOURCE_SAMPLES: 'removeDefaultSourceSamples',
  PROP_SDK_VERSION: 'sdkVersion',
  PROP_WAR: 'war',
  PROP_ABORT_EXISTING_PROJECT: 'abortExistingProject',

  VAR_PROJECT_GROUPID: '${project.groupId}',
  VAR_PROJECT_ARTIFACTID: '${project.artifactId}',
  VAR_PROJECT_VERSION: '${project.version}',

  WAR_TYPE_REPO: 'repo',
  WAR_TYPE_SHARE: 'share',
};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
