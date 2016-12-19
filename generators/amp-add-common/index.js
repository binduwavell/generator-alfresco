'use strict';
var _ = require('lodash');
var debug = require('debug')('generator-alfresco:amp-common');
var constants = require('generator-alfresco-common').constants;
var filters = require('generator-alfresco-common').prompt_filters;
var SubGenerator = require('../subgenerator.js');

var NAMESPACE_REMOTE = 'alfresco:amp-add-remote';

var PROJECTS = [
  {
    name: 'AOS Community - Alfresco Office Services (5.1)',
    description: 'Alfresco Office Services (AOS) allows you to access Alfresco directly from your Microsoft Office applications.',
    url: 'http://docs.alfresco.com/aos/concepts/aos-intro.html',
    availability: ['Community'],
    sdkVersions: ['2.2.0'],
    repoGroupId: 'org.alfresco.aos-module',
    repoArtifactId: 'alfresco-aos-module',
    repoVersion: '1.1',
    shareGroupId: undefined,
    shareArtifactId: undefined,
    shareVersion: undefined,
  },
  {
    name: 'AOS Enterprise - Alfresco Office Services (5.1)',
    description: 'Alfresco Office Services (AOS) allows you to access Alfresco directly from your Microsoft Office applications.',
    url: 'http://docs.alfresco.com/aos/concepts/aos-intro.html',
    availability: ['Enterprise'],
    sdkVersions: ['2.2.0'],
    repoGroupId: 'org.alfresco.aos-module',
    repoArtifactId: 'alfresco-aos-module',
    repoVersion: '1.1.3',
    shareGroupId: undefined,
    shareArtifactId: undefined,
    shareVersion: undefined,
  },
  {
    name: 'Developer Helper',
    description: 'A few simple tools like Open in Node Browser to help developers.',
    url: 'https://github.com/binduwavell/alf-dev-helper',
    availability: ['Community', 'Enterprise'],
    repoGroupId: 'net.wavell',
    repoArtifactId: 'alf-dev-helper-repo-amp',
    repoVersion: '1.0.0',
    shareGroupId: 'net.wavell',
    shareArtifactId: 'alf-dev-helper-share-amp',
    shareVersion: '1.0.0',
  },
  {
    name: 'JavaMelody',
    description: 'Monitor Alfresco in QA and production environments.',
    url: 'https://github.com/javamelody/alfresco-javamelody',
    availability: ['Community', 'Enterprise'],
    sdkVersions: ['2.2.0'],
    repoGroupId: 'net.bull.javamelody',
    repoArtifactId: 'alfresco-javamelody-addon',
    repoVersion: '1.62.0',
    shareGroupId: undefined,
    shareArtifactId: undefined,
    shareVersion: undefined,
  },
  {
    name: 'JavaScript Console',
    description: 'Enables the execution of arbitrary javascript code in the repository.',
    url: 'https://github.com/share-extras/js-console',
    availability: ['Community', 'Enterprise'],
    repoGroupId: 'de.fmaul',
    repoArtifactId: 'javascript-console-repo',
    repoVersion: '0.6',
    shareGroupId: 'de.fmaul',
    shareArtifactId: 'javascript-console-share',
    shareVersion: '0.6',
  },
  {
    // https://addons.alfresco.com/addons/alfresco-jscript-extensions says com/ent 5.0
    // FAILURE with 5.0.d and 5.0.1 loads of errors on repo start
    // SUCCESS with 5.1.e and 5.1.1
    name: 'JScript Extensions',
    description: 'Helpful javascript root object extensions which are helpful in many scenarios. Extensions include: auth, batch, database, downloads, favorites, fileWriter, policies, jobs, permissions, repoAdmin, tenantAdmin, trans and workflowAdmin',
    url: 'https://github.com/jgoldhammer/alfresco-jscript-extensions',
    availability: ['Community', 'Enterprise'],
    sdkVersions: ['2.2.0'],
    repoGroupId: 'de.jgoldhammer',
    repoArtifactId: 'alfresco-jscript-extension',
    repoVersion: '1.2',
    shareGroupId: undefined,
    shareArtifactId: undefined,
    shareVersion: undefined,
  },
  /*
  WARNING: Not currently in Maven Central
  {
    name: 'Order of the Bee - Support Tools',
    description: 'Aims to bring the functionality provided by the Enterprise-only Alfresco Support Tools addon, to the free and open Community Edition of Alfresco.',
    url: 'https://github.com/AFaust/ootbee-support-tools',
    availability: ['Community', 'Enterprise'],
    repoGroupId: 'org.orderofthebee.addons',
    repoArtifactId: 'ootbee-support-tools-repo',
    repoVersion: '0.0.1.0-SNAPSHOT',
    shareGroupId: undefined,
    shareArtifactId: undefined,
    shareVersion: undefined,
  },
  */
  {
    name: 'RM - Records Management (5.0.1)',
    description: 'Alfresco Records Management brings a combination of simplicity and control to information governance. The solution strengthens compliance by integrating records management into the natural flow of business and automating the complete record lifecycle‚ from capture through retention to final destruction.',
    url: 'http://docs.alfresco.com/rm2.3/references/whats-new-rm.html',
    sdkVersions: ['2.1.0', '2.1.1'],
    availability: ['Community', 'Enterprise'],
    repoGroupId: '${alfresco.groupId}',
    repoArtifactId: 'alfresco-rm',
    repoVersion: '2.3',
    shareGroupId: '${alfresco.groupId}',
    shareArtifactId: 'alfresco-rm-share',
    shareVersion: '2.3',
  },
  {
    name: 'RM Community - Records Management (5.1)',
    description: 'Alfresco Records Management brings a combination of simplicity and control to information governance. The solution strengthens compliance by integrating records management into the natural flow of business and automating the complete record lifecycle‚ from capture through retention to final destruction.',
    url: 'http://docs.alfresco.com/rm/references/whats-new-rm.html',
    availability: ['Community'],
    sdkVersions: ['2.2.0'],
    repoGroupId: '${alfresco.groupId}',
    repoArtifactId: 'alfresco-rm-community-repo',
    repoVersion: '2.5.a',
    shareGroupId: '${alfresco.groupId}',
    shareArtifactId: 'alfresco-rm-community-share',
    shareVersion: '2.5.a',
  },
  {
    name: 'RM Enterprise - Records Management (5.1)',
    description: 'Alfresco Records Management brings a combination of simplicity and control to information governance. The solution strengthens compliance by integrating records management into the natural flow of business and automating the complete record lifecycle‚ from capture through retention to final destruction.',
    url: 'http://docs.alfresco.com/rm/references/whats-new-rm.html',
    availability: ['Enterprise'],
    sdkVersions: ['2.2.0'],
    repoGroupId: '${alfresco.groupId}',
    repoArtifactId: 'alfresco-rm-enterprise-repo',
    repoVersion: '2.5.0',
    shareGroupId: '${alfresco.groupId}',
    shareArtifactId: 'alfresco-rm-enterprise-share',
    shareVersion: '2.5.0',
  },
  {
    // https://addons.alfresco.com/addons/alfresco-share-inbound-calendar-invites says com/ent 5.0 & 5.1
    // SUCCESS with 5.0.d and 5.0.1
    // SUCCESS with 5.1.e and 5.1.1
    name: 'Share Inbound Calendar Invites',
    description: 'Gives you the ability to send calendar invitations to an Alfresco Share site. This provides a very basic calendar integration in which users can select which events they create in the corporate email and calendaring system will show up in the Share site calendar.',
    url: 'https://github.com/jpotts/share-inbound-invites',
    availability: ['Community', 'Enterprise'],
    repoGroupId: 'com.metaversant',
    repoArtifactId: 'inbound-invites-repo',
    repoVersion: '1.1.0',
    shareGroupId: undefined,
    shareArtifactId: undefined,
    shareVersion: undefined,
  },
  {
    // https://addons.alfresco.com/addons/share-announcements says ent 5.1
    // SUCCESS with 5.0.d
    // SUCCESS with 5.1.e and 5.1.1
    name: 'Share Site Announcements',
    description: 'Makes it possible to publish announcements on the Share login page.',
    url: 'https://github.com/jpotts/share-announcements',
    availability: ['Community', 'Enterprise'],
    repoGroupId: 'com.metaversant',
    repoArtifactId: 'share-login-ann-repo',
    repoVersion: '0.0.2',
    shareGroupId: 'com.metaversant',
    shareArtifactId: 'share-login-ann-share',
    shareVersion: '0.0.2',
  },
  {
    // https://addons.alfresco.com/addons/share-site-creators says com/ent 5.0 & 5.1
    // FAILURE with 5.0.d and 5.0.1 blocks repo startup
    // SUCCESS with 5.1.e and 5.1.1
    name: 'Share Site Creators',
    description: 'This add-on gives you the ability to restrict Alfresco Share site creation to a specific group of users. Users not in the group will not see a "Create Site" link.',
    url: 'https://github.com/jpotts/share-site-creators',
    availability: ['Community', 'Enterprise'],
    sdkVersions: ['2.2.0'],
    repoGroupId: 'com.metaversant',
    repoArtifactId: 'share-site-creators-repo',
    repoVersion: '0.0.5',
    shareGroupId: 'com.metaversant',
    shareArtifactId: 'share-site-creators-share',
    shareVersion: '0.0.5',
  },
  {
    // https://addons.alfresco.com/addons/share-site-space-templates says com/ent 5.0 & 5.1
    // SUCCESS with 5.0.d, 5.0.1
    // SUCCESS with 5.1.e and 5.1.1
    name: 'Share Site Space Templates',
    description: 'Adds the ability to create a default set of folders to an Alfresco Share site by leveraging Space Templates.',
    url: 'https://github.com/jpotts/share-site-space-templates',
    availability: ['Community', 'Enterprise'],
    repoGroupId: 'com.metaversant',
    repoArtifactId: 'share-site-space-templates-repo',
    repoVersion: '1.1.2',
    shareGroupId: undefined,
    shareArtifactId: undefined,
    shareVersion: undefined,
  },
  {
    name: 'Support Tools',
    description: 'Provides the Alfresco admin a set of tools to help troubleshoot performance issues.',
    url: 'https://github.com/Alfresco/alfresco-support-tools',
    availability: ['Enterprise'],
    repoGroupId: 'org.alfresco.support',
    repoArtifactId: 'support-tools',
    repoVersion: '1.11',
    shareGroupId: undefined,
    shareArtifactId: undefined,
    shareVersion: undefined,
  },
  {
    name: 'Uploader Plus',
    description: 'Enhances the standard Alfresco uploader with a mechanism to prompt the user for content type and metadata during the upload process.',
    url: 'http://softwareloop.com/uploader-plus-an-alfresco-uploader-that-prompts-for-metadata/',
    availability: ['Community', 'Enterprise'],
    repoGroupId: 'com.softwareloop',
    repoArtifactId: 'uploader-plus-repo',
    repoVersion: '1.2',
    shareGroupId: 'com.softwareloop',
    shareArtifactId: 'uploader-plus-surf',
    shareVersion: '1.2',
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
