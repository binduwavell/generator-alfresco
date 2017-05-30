'use strict';
const debug = require('debug')('generator-alfresco:amp-common');
const constants = require('generator-alfresco-common').constants;
const filters = require('generator-alfresco-common').prompt_filters;
const trace = require('debug')('generator-alfresco-trace:amp-common');
const SubGenerator = require('../subgenerator.js');

const NAMESPACE_REMOTE = 'alfresco:amp-add-remote';

const PROJECTS = [
  {
    name: 'AOS Community - Alfresco Office Services (5.1)',
    description: 'Alfresco Office Services (AOS) allows you to access Alfresco directly from your Microsoft Office applications.',
    url: 'http://docs.alfresco.com/aos/concepts/aos-intro.html',
    availability: ['Community'],
    sdkVersions: ['2.2.0'],
    repo: [
      {
        groupId: 'org.alfresco.aos-module',
        artifactId: 'alfresco-aos-module',
        version: '1.1',
      },
    ],
    share: [],
  },
  {
    name: 'AOS Enterprise - Alfresco Office Services (5.1)',
    description: 'Alfresco Office Services (AOS) allows you to access Alfresco directly from your Microsoft Office applications.',
    url: 'http://docs.alfresco.com/aos/concepts/aos-intro.html',
    availability: ['Enterprise'],
    sdkVersions: ['2.2.0'],
    repo: [
      {
        groupId: 'org.alfresco.aos-module',
        artifactId: 'alfresco-aos-module',
        version: '1.1.3',
      },
    ],
    share: [],
  },
  {
    name: 'Developer Helper',
    description: 'A few simple tools like Open in Node Browser to help developers.',
    url: 'https://github.com/binduwavell/alf-dev-helper',
    availability: ['Community', 'Enterprise'],
    repo: [
      {
        groupId: 'net.wavell',
        artifactId: 'alf-dev-helper-repo-amp',
        version: '1.0.0',
      },
    ],
    share: [
      {
        groupId: 'net.wavell',
        artifactId: 'alf-dev-helper-share-amp',
        version: '1.0.0',
      },
    ],
  },
  {
    name: 'JavaMelody',
    description: 'Monitor Alfresco in QA and production environments.',
    url: 'https://github.com/javamelody/alfresco-javamelody',
    availability: ['Community', 'Enterprise'],
    sdkVersions: ['2.2.0'],
    repo: [
      {
        groupId: 'net.bull.javamelody',
        artifactId: 'alfresco-javamelody-addon',
        version: '1.62.0',
      },
    ],
    share: [],
  },
  {
    name: 'JavaScript Console',
    description: 'Enables the execution of arbitrary javascript code in the repository.',
    url: 'https://github.com/share-extras/js-console',
    availability: ['Community', 'Enterprise'],
    repo: [
      {
        groupId: 'de.fmaul',
        artifactId: 'javascript-console-repo',
        version: '0.6',
      },
    ],
    share: [
      {
        groupId: 'de.fmaul',
        artifactId: 'javascript-console-share',
        version: '0.6',
      },
    ],
  },
  {
    // https://addons.alfresco.com/addons/alfresco-jscript-extensions says com/ent 5.0 & 5.1
    // SUCCESS with 5.0.d and 5.0.1
    name: 'JScript Extensions',
    description: 'Helpful javascript root object extensions which are helpful in many scenarios. Extensions include: auth, batch, database, downloads, favorites, fileWriter, policies, jobs, permissions, repoAdmin, tenantAdmin, trans and workflowAdmin',
    url: 'https://github.com/jgoldhammer/alfresco-jscript-extensions',
    availability: ['Community', 'Enterprise'],
    sdkVersions: ['2.0.0', '2.1.0', '2.1.1'],
    repo: [
      {
        groupId: 'de.jgoldhammer',
        artifactId: 'alfresco-jscript-extension',
        version: '1.3.1',
      },
    ],
    share: [],
  },
  {
    // https://addons.alfresco.com/addons/alfresco-jscript-extensions says com/ent 5.0 & 5.1
    // SUCCESS with 5.1.e and 5.1.1
    name: 'JScript Extensions',
    description: 'Helpful javascript root object extensions which are helpful in many scenarios. Extensions include: auth, batch, database, downloads, favorites, fileWriter, policies, jobs, permissions, repoAdmin, tenantAdmin, trans and workflowAdmin',
    url: 'https://github.com/jgoldhammer/alfresco-jscript-extensions',
    availability: ['Community', 'Enterprise'],
    sdkVersions: ['2.2.0'],
    repo: [
      {
        groupId: 'de.jgoldhammer',
        artifactId: 'alfresco-jscript-extension',
        version: '1.3.1',
      },
    ],
    share: [],
  },
  {
    name: 'Order of the Bee - Support Tools',
    description: 'Aims to bring the functionality provided by the Enterprise-only Alfresco Support Tools addon, to the free and open Community Edition of Alfresco.',
    url: 'https://github.com/AFaust/ootbee-support-tools',
    availability: ['Community', 'Enterprise'],
    repo: [
      {
        groupId: 'org.orderofthebee.support-tools',
        artifactId: 'support-tools-repo',
        version: '0.0.1.0',
      },
    ],
    share: [
      {
        groupId: 'org.orderofthebee.support-tools',
        artifactId: 'support-tools-share',
        version: '0.0.1.0',
      },
    ],
  },
  {
    name: 'RM - Records Management (5.0.1)',
    description: 'Alfresco Records Management brings a combination of simplicity and control to information governance. The solution strengthens compliance by integrating records management into the natural flow of business and automating the complete record lifecycle‚ from capture through retention to final destruction.',
    url: 'http://docs.alfresco.com/rm2.3/references/whats-new-rm.html',
    sdkVersions: ['2.1.0', '2.1.1'],
    availability: ['Community', 'Enterprise'],
    repo: [
      {
        groupId: '${alfresco.groupId}',
        artifactId: 'alfresco-rm',
        version: '2.3',
      },
    ],
    share: [
      {
        groupId: '${alfresco.groupId}',
        artifactId: 'alfresco-rm-share',
        version: '2.3',
      },
    ],
  },
  {
    name: 'RM Community - Records Management (5.1)',
    description: 'Alfresco Records Management brings a combination of simplicity and control to information governance. The solution strengthens compliance by integrating records management into the natural flow of business and automating the complete record lifecycle‚ from capture through retention to final destruction.',
    url: 'http://docs.alfresco.com/rm/references/whats-new-rm.html',
    availability: ['Community'],
    sdkVersions: ['2.2.0'],
    repo: [
      {
        groupId: '${alfresco.groupId}',
        artifactId: 'alfresco-rm-community-repo',
        version: '2.5.a',
      },
    ],
    share: [
      {
        groupId: '${alfresco.groupId}',
        artifactId: 'alfresco-rm-community-share',
        version: '2.5.a',
      },
    ],
  },
  {
    name: 'RM Enterprise - Records Management (5.1)',
    description: 'Alfresco Records Management brings a combination of simplicity and control to information governance. The solution strengthens compliance by integrating records management into the natural flow of business and automating the complete record lifecycle‚ from capture through retention to final destruction.',
    url: 'http://docs.alfresco.com/rm/references/whats-new-rm.html',
    availability: ['Enterprise'],
    sdkVersions: ['2.2.0'],
    repo: [
      {
        groupId: '${alfresco.groupId}',
        artifactId: 'alfresco-rm-enterprise-repo',
        version: '2.5.0',
      },
    ],
    share: [
      {
        groupId: '${alfresco.groupId}',
        artifactId: 'alfresco-rm-enterprise-share',
        version: '2.5.0',
      },
    ],
  },
  {
    // https://addons.alfresco.com/addons/alfresco-share-inbound-calendar-invites says com/ent 5.0 & 5.1
    // SUCCESS with 5.0.d and 5.0.1
    // SUCCESS with 5.1.e and 5.1.1
    name: 'Share Inbound Calendar Invites',
    description: 'Gives you the ability to send calendar invitations to an Alfresco Share site. This provides a very basic calendar integration in which users can select which events they create in the corporate email and calendaring system will show up in the Share site calendar.',
    url: 'https://github.com/jpotts/share-inbound-invites',
    availability: ['Community', 'Enterprise'],
    repo: [
      {
        groupId: 'com.metaversant',
        artifactId: 'inbound-invites-repo',
        version: '1.1.0',
      },
    ],
    share: [],
  },
  {
    // https://addons.alfresco.com/addons/share-announcements says ent 5.1
    // SUCCESS with 5.0.d
    // SUCCESS with 5.1.e and 5.1.1
    name: 'Share Site Announcements',
    description: 'Makes it possible to publish announcements on the Share login page.',
    url: 'https://github.com/jpotts/share-announcements',
    availability: ['Community', 'Enterprise'],
    repo: [
      {
        groupId: 'com.metaversant',
        artifactId: 'share-login-ann-repo',
        version: '0.0.2',
      },
    ],
    share: [
      {
        groupId: 'com.metaversant',
        artifactId: 'share-login-ann-share',
        version: '0.0.2',
      },
    ],
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
    repo: [
      {
        groupId: 'com.metaversant',
        artifactId: 'share-site-creators-repo',
        version: '0.0.5',
      },
    ],
    share: [
      {
        groupId: 'com.metaversant',
        artifactId: 'share-site-creators-share',
        version: '0.0.5',
      },
    ],
  },
  {
    // https://addons.alfresco.com/addons/share-site-space-templates says com/ent 5.0 & 5.1
    // SUCCESS with 5.0.d, 5.0.1
    // SUCCESS with 5.1.e and 5.1.1
    name: 'Share Site Space Templates',
    description: 'Adds the ability to create a default set of folders to an Alfresco Share site by leveraging Space Templates.',
    url: 'https://github.com/jpotts/share-site-space-templates',
    availability: ['Community', 'Enterprise'],
    repo: [
      {
        groupId: 'com.metaversant',
        artifactId: 'share-site-space-templates-repo',
        version: '1.1.2',
      },
    ],
    share: [],
  },
  {
    name: 'Support Tools',
    description: 'Provides the Alfresco admin a set of tools to help troubleshoot performance issues.',
    url: 'https://github.com/Alfresco/alfresco-support-tools',
    availability: ['Enterprise'],
    repo: [
      {
        groupId: 'org.alfresco.support',
        artifactId: 'support-tools',
        version: '1.11',
      },
    ],
    share: [],
  },
  {
    name: 'Uploader Plus',
    description: 'Enhances the standard Alfresco uploader with a mechanism to prompt the user for content type and metadata during the upload process.',
    url: 'http://softwareloop.com/uploader-plus-an-alfresco-uploader-that-prompts-for-metadata/',
    availability: ['Community', 'Enterprise'],
    repo: [
      {
        groupId: 'com.softwareloop',
        artifactId: 'uploader-plus-repo',
        version: '1.2',
      },
    ],
    share: [
      {
        groupId: 'com.softwareloop',
        artifactId: 'uploader-plus-surf',
        version: '1.2',
      },
    ],
  },
];

class AmpAddCommonSubGenerator extends SubGenerator {
  constructor (args, opts) {
    super(args, opts);

    trace('constructing');

    const communityOrEnterprise = this.config.get(constants.PROP_COMMUNITY_OR_ENTERPRISE);
    const sdkVersion = this.config.get(constants.PROP_SDK_VERSION);
    const projects = PROJECTS
      .filter(project => {
        if (communityOrEnterprise === undefined) return true;
        return (project.availability.indexOf(communityOrEnterprise) > -1);
      })
      .filter(project => {
        if (sdkVersion === undefined) return true;
        return (project.hasOwnProperty('sdkVersions') ? project.sdkVersions.indexOf(sdkVersion) > -1 : true);
      })
      .filter(project => !isApplied(project, this.moduleRegistry));

    if (projects.length === 0) {
      this.out.info('You are already using all of the available common amps');
      this.bail = true;
      return;
    }

    const projectNames = projects.map(project => project.name);

    debug('Offering the following common amps: ', projectNames);

    this.prompts = [
      {
        type: 'checkbox',
        name: 'projectNames',
        option: { name: 'project-names', config: { alias: 'p', desc: 'Which project(s): ' + projectNames.join(', ') + ' (comma separated)', type: String } },
        when: () => {
          projects.map(project => {
            this.out.definition(project.name, project.description);
            this.out.docs(undefined, project.url);
          });
          return true;
        },
        choices: projectNames,
        message: 'Which war would you like add an AMP to?',
        commonFilter: filters.requiredTextStartsWithListFilterFactory(',', projectNames),
        valueRequired: true,
      },
    ];

    this.setupArgumentsAndOptions(this.prompts);
  }

  prompting () {
    if (this.bail) return;

    return this.subgeneratorPrompt(this.prompts, '', props => {
      this.props = props;
      const projects = PROJECTS
        .filter(project => {
          return (props.projectNames.indexOf(project.name) > -1);
        });
      projects.forEach(project => {
        if (project.repo && project.repo.length > 0) {
          project.repo.forEach(repoProject => {
            if (getRepoAmp(repoProject, this.moduleRegistry) === undefined) {
              debug('attempting to compose %s to add %s to the repo', NAMESPACE_REMOTE, repoProject.artifactId);
              this.composeWith(require.resolve('../amp-add-remote'),
                {
                  'war': 'repo',
                  'group-id': repoProject.groupId,
                  'artifact-id': repoProject.artifactId,
                  'amp-version': repoProject.version,
                  _moduleRegistry: this.moduleRegistry,
                  _modules: this.modules,
                  _moduleManager: this.moduleManager,
                });
            }
          });
        }
        if (project.share && project.share.length > 0) {
          project.share.forEach(shareProject => {
            if (getShareAmp(shareProject, this.moduleRegistry) === undefined) {
              debug('attempting to compose %s to add %s to the share', NAMESPACE_REMOTE, shareProject.artifactId);
              this.composeWith(require.resolve('../amp-add-remote'),
                {
                  'war': 'share',
                  'group-id': shareProject.groupId,
                  'artifact-id': shareProject.artifactId,
                  'amp-version': shareProject.version,
                  _moduleRegistry: this.moduleRegistry,
                  _modules: this.modules,
                  _moduleManager: this.moduleManager,
                });
            }
          });
        }
      });
    });
  }
};

function isApplied (project, moduleRegistry) {
  if (project.repo && project.repo.length > 0 && getRepoAmp(project.repo[0], moduleRegistry) !== undefined) {
    return true;
  }
  if (project.share && project.share.length > 0 && getShareAmp(project.share[0], moduleRegistry) !== undefined) {
    return true;
  }
  return false;
}

function getRepoAmp (repoAmp, moduleRegistry) {
  const module = moduleRegistry.findModule(repoAmp.groupId, repoAmp.artifactId, repoAmp.version, 'amp', 'repo', 'remote');
  debug('Found module %j', module);
  return module;
}

function getShareAmp (shareAmp, moduleRegistry) {
  const module = moduleRegistry.findModule(shareAmp.groupId, shareAmp.artifactId, shareAmp.version, 'amp', 'share', 'remote');
  debug('Found module %j', module);
  return module;
}

module.exports = AmpAddCommonSubGenerator;

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
