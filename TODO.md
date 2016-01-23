TODO
====

- [ ] Update incorrect {string|undefined} jsdoc type specifier, use {(string|undefined)}
- [ ] Complete alfresco-module-registry
  - [ ] In the module data structure war values should be alfresco instead of repo
  - [ ] removeDefaultSourceSamples should default to false instead of true
  - [ ] Make sure we have test coverage for existing modules
    - [ ] alfresco-module-registry.js
    - [ ] maven-pom.js
    - [ ] spring-context.js
  - [ ] Provide a method to update project configuration based on current registry settings
    - [ ] /pom.xml (modules)
    - [ ] /repo/pom.xml (dep & overlay)
    - [ ] /share/pom.xml (dep & overlay)
    - [ ] /runner/pom.xml (failsafe configuration for share source modules)
    - [ ] /runner/tomcat/context-(repo|share).xml
- [ ] Complete remove-samples option in main generator
  - [ ] Make sure everything that should be removed is
- [ ] Offer to remove default repo-amp and share-amp projects
- [ ] If repo-amp and/or share-amp are retained, add info about them to list of project amps in config so that sub-generators can target them
- [ ] Make progress on amp sub-generator
  - [x] Move amp sub-generators so it can't be used yet
  - [ ] Offer different types of amp creation
  - [ ] Use the backed up repo-amp and share-amp projects instead of caching structures in templates folder
  - [ ] Create a pom editing module under app (like spring-context.js) and use this
  - [ ] Make sure that context files are regenerated
- [ ] Make progress on webscript sub-generator
  - [x] Move webscript sub-generators so it can't be used yet
  - [ ] List project amps that we can generate webscripts in
  - [ ] Update wizard to include more/all options for .desc.xml
- [ ] Make progress on action sub-generator
  - [ ] Review action branch and see what all needs to be done
  - [ ] List project amps that we can generate webscripts in
  - [ ] Generate into appropriate target location rather than project root
- [ ] Ask if we should include codenvy factory in the project
  - [ ] Need to figure out how we are going to handle enterprise
- [ ] Include instructions about how to configure IDEs (or generate the config)
  - [ ] Eclipse
  - [ ] IntelliJ
  - [ ] NetBeans
  - [ ] Codenvy (based on previous answer)
    - [ ] Codenvy IDE
    - [ ] Codenvy via Eclipse plugin
    - [ ] Codenvy via CLI
- [ ] Finish first pass on alfresco:amp generator

TODONE
======

- [x] 4 tests in test-maven-pom.js are failing, need to fix those ASAP
- [x] Initial attempt to move the remove sample capability into the main generator
- [x] Do not backup source amps when generator is re-run
- [x] Include instructions for where to place the license file when enterprise is selected
- [x] Prompt for community or enterprise and adjustment scripts
  - [x] run.sh
  - [x] debug.sh
- [x] Offer to generate a .gitignore (or just do it)
- [x] Fix npm test after adding npm run fixme
- [x] Update module-context.xml so generated beans are automatically included
