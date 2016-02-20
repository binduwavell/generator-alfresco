TODO
====

- [ ] Complete alfresco-module-manager
  - [ ] Fix error: The component ''com.ziaconsulting.ace.exampleComponent'' belongs to a non-existent module ''repo-amp''.
  - [ ] Generated amps should have correct common parent and should have project group and version explicitly
  - [ ] Provide a method to update project configuration based on current registry settings
    - [ ] /runner/pom.xml (failsafe configuration for share source modules)
    - [x] /runner/tomcat/context-(repo|share).xml (using tomcat context file editor)
    - [x] /runner/tomcat/context-(repo|share).xml (using wildcards -- turned out tomcat did not support this)
    - [x] /share/pom.xml (dep & overlay)
    - [x] /pom.xml (modules)
    - [x] /repo/pom.xml (dep & overlay)
  - [x] Rename repo module directory if necessary
  - [x] Fix /...-amp/pom.xml parent reference
  - [x] Adding module to top pom should add to top of list of modules rather than bottom
  - [x] Make sure we have test coverage for existing modules
    - [x] alfresco-module-registry.js
    - [x] maven-pom.js
    - [x] spring-context.js
- [ ] Make progress on amp sub-generator
  - [ ] When creating source AMP prompt for name and description and inject into project
  - [ ] Offer different types of amp creation
  - [ ] Make sure that context files are regenerated
  - [x] Create a pom editing module under app (like spring-context.js) and use this
  - [x] Use the backed up repo-amp and share-amp projects instead of caching structures in templates folder
  - [x] Move amp sub-generators so it can''t be used yet
- [ ] Make progress on webscript sub-generator
  - [ ] List project amps that we can generate webscripts in
  - [ ] Update wizard to include more/all options for .desc.xml
  - [x] Move webscript sub-generators so it can''t be used yet
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

- [x] Complete remove-samples option in main generator
  - [x] Make sure everything that should be removed is
- [x] Offer to remove default repo-amp and share-amp projects
- [x] If repo-amp and/or share-amp are retained, add info about them to list of project amps in config so that sub-generators can target them
- [x] source_amps template should include an emptyish amp packaged pom
  - [x] source_amps/pom.xml should be referened in modules section of top level pom
- [x] Update incorrect {string|undefined} jsdoc type specifier, use {(string|undefined)}
- [x] removeDefaultSourceSamples should default to false instead of true
- [x] IGNORED: In the module data structure war values should be alfresco instead of repo
- [x] tons of stuff done at this point related to module registry that was not tracked directly by todos
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
