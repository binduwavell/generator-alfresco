'use strict';
var _ = require('lodash');
var debug = require('debug')('generator-alfresco:amp-common');
var constants = require('../common/constants.js');
var filters = require('../common/prompt-filters.js');
var SubGenerator = require('../subgenerator.js');

var NAMESPACE_REMOTE = 'alfresco:amp-add-remote';

var PROJECTS = [
  {
    name: 'JavaScript Console',
    repoGroupId: 'de.fmaul',
    repoArtifactId: 'javascript-console-repo',
    repoVersion: '0.6',
    shareGroupId: 'de.fmaul',
    shareArtifactId: 'javascript-console-share',
    shareVersion: '0.6',
    availability: ['Community', 'Enterprise'],
  },
  {
    name: 'Records Management (Community)',
    repoGroupId: '${alfresco.groupId}',
    repoArtifactId: 'alfresco-rm',
    repoVersion: '${alfresco.rm.version}',
    shareGroupId: '${alfresco.groupId}',
    shareArtifactId: 'alfresco-rm-share',
    shareVersion: '${alfresco.rm.version}',
    availability: ['Community', 'Enterprise'],
  },
  {
    name: 'Support Tools',
    repoGroupId: 'org.alfresco.support',
    repoArtifactId: 'support-tools',
    repoVersion: '1.10',
    shareGroupId: undefined,
    shareArtifactId: undefined,
    shareVersion: undefined,
    availability: ['Enterprise'],
  },
  {
    name: 'Uploader Plus',
    repoGroupId: 'com.softwareloop',
    repoArtifactId: 'uploader-plus-repo',
    repoVersion: '1.2',
    shareGroupId: 'com.softwareloop',
    shareArtifactId: 'uploader-plus-surf',
    shareVersion: '1.2',
    availability: ['Community', 'Enterprise'],
  },
];

module.exports = SubGenerator.extend({

  constructor: function () {
    SubGenerator.apply(this, arguments);

    debug('constructing');

    var communityOrEnterprise = this.config.get(constants.PROP_COMMUNITY_OR_ENTERPRISE);
    var projects = PROJECTS
      .filter(function (project) {
        if (communityOrEnterprise === undefined) return true;
        return (project.availability.indexOf(communityOrEnterprise) > -1);
      })
      .filter(isNotAppliedFactory(this.moduleRegistry));

    if (projects.length === 0) {
      this.out.info('You are already using all of the available common amps');
      this.bail = true;
      return;
    }

    var projectNames = projects.map(function (project) { return project.name });

    this.prompts = [
      {
        type: 'checkbox',
        name: 'projectNames',
        option: { name: 'project-names', config: { alias: 'p', desc: 'Which project(s): ' + _.join(projectNames, ', ') + ' (comma separated)', type: String } },
        choices: projectNames,
        message: 'Which war would you like add an AMP to?',
        commonFilter: filters.requiredTextStartsWithListFilterFactory(',', projectNames),
        valueRequired: true,
      },
    ];

    this.setupArgumentsAndOptions(this.prompts);
  },

  prompting: function () {
    if (this.bail) return;

    return this.subgeneratorPrompt(this.prompts, '', function (props) {
      this.props = props;
      var projects = PROJECTS
        .filter(function (project) {
          return (props.projectNames.indexOf(project.name) > -1);
        });
      _.forEach(projects, function (project) {
        if (project.repoGroupId) {
          debug('attempting to compose %s to add %s to the repo', NAMESPACE_REMOTE, project.repoArtifactId);
          this.composeWith(NAMESPACE_REMOTE,
            {options: {
              war: 'repo',
              'group-id': project.repoGroupId,
              'artifact-id': project.repoArtifactId,
              'amp-version': project.repoVersion,
              _moduleRegistry: this.moduleRegistry,
              _modules: this.modules,
              _moduleManager: this.moduleManager,
            }},
            {local: require.resolve('../amp-add-remote')}
          );
        }
        if (project.shareGroupId) {
          debug('attempting to compose %s to add %s to the share', NAMESPACE_REMOTE, project.shareArtifactId);
          this.composeWith(NAMESPACE_REMOTE,
            {options: {
              war: 'share',
              'group-id': project.shareGroupId,
              'artifact-id': project.shareArtifactId,
              'amp-version': project.shareVersion,
              _moduleRegistry: this.moduleRegistry,
              _modules: this.modules,
              _moduleManager: this.moduleManager,
            }},
            {local: require.resolve('../amp-add-remote')}
          );
        }
      }.bind(this));
    }.bind(this));
  },
});

function isNotApplied (project, moduleRegistry) {
  var applied = false;
  if (project.repoGroupId) {
    var repo = moduleRegistry.findModule(project.repoGroupId, project.repoArtifactId, project.repoVersion, 'amp', 'repo', 'remote');
    if (repo !== undefined) {
      applied = true;
    }
  }
  if (!applied && project.shareGroupId) {
    var share = moduleRegistry.findModule(project.shareGroupId, project.shareArtifactId, project.shareVersion, 'amp', 'share', 'remote');
    if (share !== undefined) {
      applied = true;
    }
  }

  return !applied;
}

function isNotAppliedFactory (moduleRegistry) {
  return function (project) {
    return isNotApplied(project, moduleRegistry);
  };
}

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
