TODO
====

- [ ] Move (and update) remove-samples capability into main generator
- [ ] Offer to remove default repo-amp and share-amp projects (back them up after removal)
- [ ] If repo-amp and/or share-amp are retained, add info about them to list of project amps in config so that sub-generators can target them
- [ ] Make progress on amp sub-generator
  - [ ] Move amp sub-generators so it can't be used yet
  - [ ] Offer different types of amp creation
  - [ ] Use the backed up repo-amp and share-amp projects instead of caching structures in templates folder
  - [ ] Create a pom editing module under app (like spring-context.js) and use this
  - [ ] Make sure that context files are regenerated
- [ ] Make progress on webscript sub-generator
  - [ ] Move webscript sub-generators so it can't be used yet
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
- [ ] Finish first pass on alfresco:amp generator

TODONE
======

- [x] Do not backup source amps when generator is re-run
- [x] Include instructions for where to place the license file when enterprise is selected
- [x] Prompt for community or enterprise and adjustment scripts
  - [x] run.sh
  - [x] debug.sh
- [x] Offer to generate a .gitignore (or just do it)
- [x] Fix npm test after adding npm run fixme
- [x] Update module-context.xml so generated beans are automatically included
