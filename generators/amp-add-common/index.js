'use strict';
var _ = require('lodash');
var debug = require('debug')('generator-alfresco:amp-common');
var constants = require('../common/constants.js');
var filters = require('../common/prompt-filters.js');
var SubGenerator = require('../subgenerator.js');

var NAMESPACE_REMOTE = 'alfresco:amp-add-remote';

var PROJECTS = [
  {
    name: 'AOS - Alfresco Office Services (Enterprise 5.1)',
    description: 'Alfresco Office Services (AOS) allows you to access Alfresco directly from your Microsoft Office applications.',
    url: 'http://docs.alfresco.com/aos/concepts/aos-intro.html',
    sdkVersions: ['2.2.0'],
    repoGroupId: 'org.alfresco.aos-module',
    repoArtifactId: 'alfresco-aos-module',
    repoVersion: '1.1.3',
    shareGroupId: undefined,
    shareArtifactId: undefined,
    shareVersion: undefined,
    availability: ['Enterprise'],
  },
  {
    name: 'AOS - Alfresco Office Services (Community 5.1)',
    description: 'Alfresco Office Services (AOS) allows you to access Alfresco directly from your Microsoft Office applications.',
    url: 'http://docs.alfresco.com/aos/concepts/aos-intro.html',
    sdkVersions: ['2.2.0'],
    repoGroupId: 'org.alfresco.aos-module',
    repoArtifactId: 'alfresco-aos-module',
    repoVersion: '1.1',
    shareGroupId: undefined,
    shareArtifactId: undefined,
    shareVersion: undefined,
    availability: ['Community'],
  },
  {
    name: 'JavaScript Console',
    description: 'Enables the execution of arbitrary javascript code in the repository.',
    url: 'https://github.com/share-extras/js-console',
    repoGroupId: 'de.fmaul',
    repoArtifactId: 'javascript-console-repo',
    repoVersion: '0.6',
    shareGroupId: 'de.fmaul',
    shareArtifactId: 'javascript-console-share',
    shareVersion: '0.6',
    availability: ['Community', 'Enterprise'],
  },
  {
    name: 'JScript Extensions',
    description: 'Helpful javascript root object extensions which are helpful in many scenarios. Extensions include: auth, batch, database, downloads, favorites, fileWriter, policies, jobs, permissions, repoAdmin, tenantAdmin, trans and workflowAdmin',
    url: 'https://github.com/jgoldhammer/alfresco-jscript-extensions',
    repoGroupId: 'de.jgoldhammer',
    repoArtifactId: 'alfresco-jscript-extension',
    repoVersion: '1.2',
    shareGroupId: undefined,
    shareArtifactId: undefined,
    shareVersion: undefined,
    availability: ['Community', 'Enterprise'],
  },
  {
    name: 'RM - Records Management (Community 5.0)',
    description: 'Alfresco Records Management brings a combination of simplicity and control to information governance. The solution strengthens compliance by integrating records management into the natural flow of business and automating the complete record lifecycle‚ from capture through retention to final destruction.',
    url: 'http://docs.alfresco.com/rm2.3/references/whats-new-rm.html',
    sdkVersions: ['2.1.0', '2.1.1'],
    repoGroupId: '${alfresco.groupId}',
    repoArtifactId: 'alfresco-rm',
    repoVersion: '2.3',
    shareGroupId: '${alfresco.groupId}',
    shareArtifactId: 'alfresco-rm-share',
    shareVersion: '2.3',
    availability: ['Community', 'Enterprise'],
  },
  {
    name: 'RM - Records Management (Community 5.1)',
    description: 'Alfresco Records Management brings a combination of simplicity and control to information governance. The solution strengthens compliance by integrating records management into the natural flow of business and automating the complete record lifecycle‚ from capture through retention to final destruction.',
    url: 'http://docs.alfresco.com/rm/references/whats-new-rm.html',
    sdkVersions: ['2.2.0'],
    repoGroupId: '${alfresco.groupId}',
    repoArtifactId: 'alfresco-rm-community-repo',
    repoVersion: '2.5.a',
    shareGroupId: '${alfresco.groupId}',
    shareArtifactId: 'alfresco-rm-community-share',
    shareVersion: '2.5.a',
    availability: ['Community'],
  },
  {
    name: 'RM Enterprise - Records Management',
    description: 'Alfresco Records Management brings a combination of simplicity and control to information governance. The solution strengthens compliance by integrating records management into the natural flow of business and automating the complete record lifecycle‚ from capture through retention to final destruction.',
    url: 'http://docs.alfresco.com/rm/references/whats-new-rm.html',
    sdkVersions: ['2.2.0'],
    repoGroupId: '${alfresco.groupId}',
    repoArtifactId: 'alfresco-rm-enterprise-repo',
    repoVersion: '2.5.0',
    shareGroupId: '${alfresco.groupId}',
    shareArtifactId: 'alfresco-rm-enterprise-share',
    shareVersion: '2.5.0',
    availability: ['Enterprise'],
  },
  {
    name: 'Share Inbound Calendar Invites',
    description: 'Gives you the ability to send calendar invitations to an Alfresco Share site. This provides a very basic calendar integration in which users can select which events they create in the corporate email and calendaring system will show up in the Share site calendar.',
    url: 'https://github.com/jpotts/share-inbound-invites',
    repoGroupId: 'com.metaversant',
    repoArtifactId: 'inbound-invites-repo',
    repoVersion: '1.1.0',
    shareGroupId: undefined,
    shareArtifactId: undefined,
    shareVersion: undefined,
    availability: ['Community', 'Enterprise'],
  },
  {
    name: 'Share Site Announcements',
    description: 'Makes it possible to publish announcements on the Share login page.',
    url: 'https://github.com/jpotts/share-announcements',
    repoGroupId: 'com.metaversant',
    repoArtifactId: 'share-login-ann-repo',
    repoVersion: '0.0.2',
    shareGroupId: 'com.metaversant',
    shareArtifactId: 'share-login-ann-share',
    shareVersion: '0.0.2',
    availability: ['Community', 'Enterprise'],
  },
  {
    name: 'Share Site Creators',
    description: 'This add-on gives you the ability to restrict Alfresco Share site creation to a specific group of users. Users not in the group will not see a "Create Site" link.',
    url: 'https://github.com/jpotts/share-site-creators',
    repoGroupId: 'com.metaversant',
    repoArtifactId: 'share-site-creators-repo',
    repoVersion: '0.0.5',
    shareGroupId: 'com.metaversant',
    shareArtifactId: 'share-site-creators-share',
    shareVersion: '0.0.5',
    availability: ['Community', 'Enterprise'],
  },
  {
    name: 'Share Site Space Templates',
    description: 'Adds the ability to create a default set of folders to an Alfresco Share site by leveraging Space Templates.',
    url: 'https://github.com/jpotts/share-site-space-templates',
    repoGroupId: 'com.metaversant',
    repoArtifactId: 'share-site-space-templates-repo',
    repoVersion: '1.1.2',
    shareGroupId: undefined,
    shareArtifactId: undefined,
    shareVersion: undefined,
    availability: ['Community', 'Enterprise'],
  },
  {
    name: 'Support Tools',
    description: 'Provides the Alfresco admin a set of tools to help troubleshoot performance issues.',
    url: 'https://github.com/Alfresco/alfresco-support-tools',
    repoGroupId: 'org.alfresco.support',
    repoArtifactId: 'support-tools',
    repoVersion: '1.11',
    shareGroupId: undefined,
    shareArtifactId: undefined,
    shareVersion: undefined,
    availability: ['Enterprise'],
  },
  {
    name: 'Uploader Plus',
    description: 'Enhances the standard Alfresco uploader with a mechanism to prompt the user for content type and metadata during the upload process.',
    url: 'http://softwareloop.com/uploader-plus-an-alfresco-uploader-that-prompts-for-metadata/',
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
    var sdkVersion = this.config.get(constants.PROP_SDK_VERSION);
    var projects = PROJECTS
      .filter(function (project) {
        if (communityOrEnterprise === undefined) return true;
        return (project.availability.indexOf(communityOrEnterprise) > -1);
      })
      .filter(function (project) {
        if (sdkVersion === undefined) return true;
        return (project.hasOwnProperty('sdkVersions') ? project.sdkVersions.indexOf(sdkVersion) > -1 : true);
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
        when: function (readonlyProps) {
          projects.map(function (project) {
            this.out.definition(project.name, project.description);
            this.out.docs(undefined, project.url);
          }.bind(this));
          return true;
        },
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
