'use strict';

module.exports = {
  "2.1.0": {
    archetypeGroupId: 'org.alfresco.maven.archetype',
    archetypeArtifactId: 'alfresco-allinone-archetype',
    archetypeVersion: '2.1.0',
    promptForProjectPackage: true,
    supportedJavaVersions: '^1.8.0',
    supportedMavenVersions: '^3.2.5',
    removeSamplesScript: [
      {
        cmd: 'removeFolders', 
        paths:  [
          'repo-amp/src/main/java/${projectPackagePath}/demoamp',
          'repo-amp/src/test/java/${projectPackagePath}/demoamp'
        ]
      },
      {
        cmd: 'removeFiles', 
        paths: [
          'repo-amp/src/main/amp/web/css/demoamp.css',
          'repo-amp/src/main/amp/web/jsp/demoamp.jsp',
          'repo-amp/src/main/amp/web/scripts/demoamp.js',
          'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.desc.xml',
          'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.html.ftl',
          'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.js',
          'repo-amp/src/main/amp/config/alfresco/module/repo-amp/webscripts/helloworld.get.js',
          'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/bootstrap-context.xml',
          'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/service-context.xml',
          'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/webscript-context.xml',
        ]
      },
      {
        cmd: 'removeContextFileImports', 
        contextFile: 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/module-context.xml',
        imports: [
          'classpath:alfresco/module/${project.artifactId}/context/service-context.xml',
          'classpath:alfresco/module/${project.artifactId}/context/bootstrap-context.xml',
          'classpath:alfresco/module/${project.artifactId}/context/webscript-context.xml',
        ]
      },
    ],
  },
  "2.0.0": {
    archetypeGroupId: 'org.alfresco.maven.archetype',
    archetypeArtifactId: 'alfresco-allinone-archetype',
    archetypeVersion: '2.0.0',
    promptForProjectPackage: false,
    supportedJavaVersions: '^1.7.0',
    supportedMavenVersions: '^3.0.5',
  },
  "local": {
    archetypeGroupId: "org.alfresco.maven.archetype",
    archetypeArtifactId: "alfresco-allinone-archetype",
    archetypeVersion: "2.1.0-SNAPSHOT",
    archetypeCatalog: 'local',
    promptForArchetypeVersion: true,
    promptForProjectPackage: true,
    supportedJavaVersions: '^1.8.0',
    supportedMavenVersions: '^3.2.5',
  }
};