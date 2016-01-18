'use strict';

var assert = require('assert');

describe('generator-alfresco:maven-pom', function () {

  describe('.getOrCreateTopLevelElement()', function() {

    it('can create a shell pom', function () {
      var pom = require('../generators/app/maven-pom.js')();
      var modelVersion = pom.getOrCreateTopLevelElement('pom', 'modelVersion');
      assert.ok(modelVersion);
      assert.equal(modelVersion.textContent, '4.0.0');
    });

    it('create top level element in empty root', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var element = pom.getOrCreateTopLevelElement('pom', 'asdf');
      element.textContent = 'fdsa';
      assert.ok(element);
      assert.equal(pom.getPOMString(), [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project ',
        '  xmlns="http://maven.apache.org/POM/4.0.0" ',
        '  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <asdf>fdsa</asdf>',
        '</project>',
      ].join('\n'));
    });

    it('get only top level element', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <asdf>fdsa</asdf>',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var element = pom.getOrCreateTopLevelElement('pom', 'asdf');
      assert.ok(element);
      assert.equal(element.textContent, 'fdsa');
    });

  });

  describe('.setTopLevelElementTextContent()', function() {

    it('can set groupId', function () {
      var pom = require('../generators/app/maven-pom.js')();
      var groupIdText = 'com.ziaconsulting';
      pom.setTopLevelElementTextContent('pom', 'groupId', groupIdText);
      var groupId = pom.getOrCreateTopLevelElement('pom', 'groupId');
      assert.ok(groupId);
      assert.equal(groupId.textContent, groupIdText);
    });

  });

  describe('.setProjectGAV()', function() {

    it('can set project GAV', function () {
      var pom = require('../generators/app/maven-pom.js')();
      pom.setProjectGAV('${project.groupId}', 'test', '${project.version}', 'amp');
      // console.log(pom.getPOMString());
      var groupIdNode = pom.getTopLevelElement('pom', 'groupId');
      assert.equal(groupIdNode, undefined);
      var artifactIdNode = pom.getOrCreateTopLevelElement('pom', 'artifactId');
      assert.ok(artifactIdNode);
      assert.equal(artifactIdNode.textContent, 'test');
      var versionNode = pom.getTopLevelElement('pom', 'version');
      assert.equal(versionNode, undefined);
      var packagingNode = pom.getOrCreateTopLevelElement('pom', 'packaging');
      assert.ok(packagingNode);
      assert.equal(packagingNode.textContent, 'amp');
    });

  });

  describe('.setParentGAV()', function() {

    it('can set parent', function () {
      var pom = require('../generators/app/maven-pom.js')();
      pom.setParentGAV('com.ziaconsulting', 'test', '1.2.3');
      var parent = pom.getOrCreateTopLevelElement('pom', 'parent');
      assert.ok(parent);
      assert.equal(parent.toString(), '<parent><groupId>com.ziaconsulting</groupId><artifactId>test</artifactId><version>1.2.3</version></parent>');
    });

  });

  describe('.findDependency()', function() {

    it('returns undefined when dependency is not found', function () {
      var pom = require('../generators/app/maven-pom.js')();
      var dependency = pom.findDependency('com.ziaconsulting', 'test');
      assert.equal(dependency, undefined);
    });

    it('find only dependency by groupId and artifactId', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <dependencies>',
        '    <dependency>',
        '      <groupId>com.ziaconsulting</groupId>',
        '      <artifactId>test</artifactId>',
        '      <version>1.0.0</version>',
        '      <scope>compile</scope>',
        '    </dependency>',
        '  </dependencies>',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var dependency = pom.findDependency('com.ziaconsulting', 'test');
      assert.ok(dependency);
      assert.equal(dependency.toString(), '<dependency>\n      <groupId>com.ziaconsulting</groupId>\n      <artifactId>test</artifactId>\n      <version>1.0.0</version>\n      <scope>compile</scope>\n    </dependency>');
    });

    it('find first dependency by groupId and artifactId', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <dependencies>',
        '    <dependency>',
        '      <groupId>com.ziaconsulting</groupId>',
        '      <artifactId>test</artifactId>',
        '      <version>1.0.0</version>',
        '      <scope>compile</scope>',
        '    </dependency>',
        '    <dependency>',
        '      <groupId>net.ziaconsulting</groupId>',
        '      <artifactId>test</artifactId>',
        '      <version>1.0.0</version>',
        '      <scope>compile</scope>',
        '    </dependency>',
        '  </dependencies>',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var dependency = pom.findDependency('com.ziaconsulting', 'test');
      assert.ok(dependency);
      assert.equal(dependency.toString(), '<dependency>\n      <groupId>com.ziaconsulting</groupId>\n      <artifactId>test</artifactId>\n      <version>1.0.0</version>\n      <scope>compile</scope>\n    </dependency>');
    });

    it('find last dependency by groupId and artifactId', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <dependencies>',
        '    <dependency>',
        '      <groupId>net.ziaconsulting</groupId>',
        '      <artifactId>test</artifactId>',
        '      <version>1.0.0</version>',
        '      <scope>compile</scope>',
        '    </dependency>',
        '    <dependency>',
        '      <groupId>com.ziaconsulting</groupId>',
        '      <artifactId>test</artifactId>',
        '      <version>1.0.0</version>',
        '      <scope>compile</scope>',
        '    </dependency>',
        '  </dependencies>',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var dependency = pom.findDependency('com.ziaconsulting', 'test');
      assert.ok(dependency);
      assert.equal(dependency.toString(), '<dependency>\n      <groupId>com.ziaconsulting</groupId>\n      <artifactId>test</artifactId>\n      <version>1.0.0</version>\n      <scope>compile</scope>\n    </dependency>');
    });

    it('find middle dependency by groupId and artifactId', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <dependencies>',
        '    <dependency>',
        '      <groupId>net.ziaconsulting</groupId>',
        '      <artifactId>test</artifactId>',
        '      <version>1.0.0</version>',
        '      <scope>compile</scope>',
        '    </dependency>',
        '    <dependency>',
        '      <groupId>com.ziaconsulting</groupId>',
        '      <artifactId>test</artifactId>',
        '      <version>1.0.0</version>',
        '      <scope>compile</scope>',
        '    </dependency>',
        '    <dependency>',
        '      <groupId>org.ziaconsulting</groupId>',
        '      <artifactId>test</artifactId>',
        '      <version>1.0.0</version>',
        '      <scope>compile</scope>',
        '    </dependency>',
        '  </dependencies>',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var dependency = pom.findDependency('com.ziaconsulting', 'test');
      assert.ok(dependency);
      assert.equal(dependency.toString(), '<dependency>\n      <groupId>com.ziaconsulting</groupId>\n      <artifactId>test</artifactId>\n      <version>1.0.0</version>\n      <scope>compile</scope>\n    </dependency>');
    });

    it('find dependency by groupId, artifactId & version', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <dependencies>',
        '    <dependency>',
        '      <groupId>com.ziaconsulting</groupId>',
        '      <artifactId>test</artifactId>',
        '      <version>1.0.0</version>',
        '      <scope>compile</scope>',
        '    </dependency>',
        '  </dependencies>',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var dependency = pom.findDependency('com.ziaconsulting', 'test', '1.0.0');
      assert.ok(dependency);
      assert.equal(dependency.toString(), '<dependency>\n      <groupId>com.ziaconsulting</groupId>\n      <artifactId>test</artifactId>\n      <version>1.0.0</version>\n      <scope>compile</scope>\n    </dependency>');
    });

    it('doesn\'t find dependency by groupId, artifactId & invalid version', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <dependencies>',
        '    <dependency>',
        '      <groupId>com.ziaconsulting</groupId>',
        '      <artifactId>test</artifactId>',
        '      <version>1.0.0</version>',
        '      <scope>compile</scope>',
        '    </dependency>',
        '  </dependencies>',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var dependency = pom.findDependency('com.ziaconsulting', 'test', '2.0.0');
      assert.equal(dependency, undefined);
    });

    it('find dependency by groupId, artifactId & scope', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <dependencies>',
        '    <dependency>',
        '      <groupId>com.ziaconsulting</groupId>',
        '      <artifactId>test</artifactId>',
        '      <version>1.0.0</version>',
        '      <type>amp</type>',
        '      <scope>compile</scope>',
        '    </dependency>',
        '  </dependencies>',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var dependency = pom.findDependency('com.ziaconsulting', 'test', undefined, undefined, 'compile');
      assert.ok(dependency);
      assert.equal(dependency.toString(), '<dependency>\n      <groupId>com.ziaconsulting</groupId>\n      <artifactId>test</artifactId>\n      <version>1.0.0</version>\n      <type>amp</type>\n      <scope>compile</scope>\n    </dependency>');
    });

    it('find dependency by groupId, artifactId, version, type & scope', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <dependencies>',
        '    <dependency>',
        '      <groupId>com.ziaconsulting</groupId>',
        '      <artifactId>test</artifactId>',
        '      <version>1.0.0</version>',
        '      <type>amp</type>',
        '      <scope>compile</scope>',
        '    </dependency>',
        '  </dependencies>',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var dependency = pom.findDependency('com.ziaconsulting', 'test', '1.0.0', 'amp', 'compile');
      assert.ok(dependency);
      assert.equal(dependency.toString(), '<dependency>\n      <groupId>com.ziaconsulting</groupId>\n      <artifactId>test</artifactId>\n      <version>1.0.0</version>\n      <type>amp</type>\n      <scope>compile</scope>\n    </dependency>');
    });

  });

  describe('.addDependency()', function() {

    it('add first dependency', function () {
      var pom = require('../generators/app/maven-pom.js')();
      var dependency = pom.addDependency('com.ziaconsulting', 'test', '1.0.0', undefined, 'compile');
      var dependencies = pom.getOrCreateTopLevelElement('pom', 'dependencies');
      assert.ok(dependency);
      assert.ok(dependencies);
      assert.equal(dependencies.toString(), '<dependencies><dependency><groupId>com.ziaconsulting</groupId><artifactId>test</artifactId><version>1.0.0</version><scope>compile</scope></dependency></dependencies>');
    });

    it('don\'t replace existing dependency', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <dependencies>',
        '    <dependency>',
        '      <groupId>com.ziaconsulting</groupId>',
        '      <artifactId>test</artifactId>',
        '      <version>1.0.0</version>',
        '      <scope>compile</scope>',
        '    </dependency>',
        '  </dependencies>',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var dependency = pom.addDependency('com.ziaconsulting', 'test', '1.0.0', undefined, 'compile');
      var dependencies = pom.getOrCreateTopLevelElement('pom', 'dependencies');
      assert.ok(dependency);
      assert.ok(dependencies);
      assert.equal(dependency.toString(), '<dependency>\n      <groupId>com.ziaconsulting</groupId>\n      <artifactId>test</artifactId>\n      <version>1.0.0</version>\n      <scope>compile</scope>\n    </dependency>');
      assert.equal(dependencies.toString(), '<dependencies>\n    <dependency>\n      <groupId>com.ziaconsulting</groupId>\n      <artifactId>test</artifactId>\n      <version>1.0.0</version>\n      <scope>compile</scope>\n    </dependency>\n  </dependencies>');
    });

    it('add second dependency', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <dependencies>',
        '    <dependency>',
        '      <groupId>com.ziaconsulting</groupId>',
        '      <artifactId>test</artifactId>',
        '      <version>1.0.0</version>',
        '      <scope>compile</scope>',
        '    </dependency>',
        '  </dependencies>',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var dependency = pom.addDependency('net.ziaconsulting', 'test', '1.0.0', undefined, 'compile');
      var dependencies = pom.getOrCreateTopLevelElement('pom', 'dependencies');
      assert.ok(dependency);
      assert.ok(dependencies);
      assert.equal(dependencies.toString(), '<dependencies>\n    <dependency>\n      <groupId>com.ziaconsulting</groupId>\n      <artifactId>test</artifactId>\n      <version>1.0.0</version>\n      <scope>compile</scope>\n    </dependency>\n  <dependency><groupId>net.ziaconsulting</groupId><artifactId>test</artifactId><version>1.0.0</version><scope>compile</scope></dependency></dependencies>');
    });

    it('Remove version and scope from existing dependency', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <dependencies>',
        '    <dependency>',
        '      <groupId>com.ziaconsulting</groupId>',
        '      <artifactId>test</artifactId>',
        '      <version>1.0.0</version>',
        '      <scope>compile</scope>',
        '    </dependency>',
        '  </dependencies>',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var dependency = pom.addDependency('com.ziaconsulting', 'test');
      assert.ok(dependency);
      assert.equal(dependency.toString(), '<dependency>\n      <groupId>com.ziaconsulting</groupId>\n      <artifactId>test</artifactId>\n      \n      \n    </dependency>');
    });
  });

  describe('.removeDependency()', function() {

    it('does not remove non-existent dependency', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      pom.removeDependency('com.ziaconsulting', 'test', '1.0.0', 'compile');
      var dependencies = pom.getOrCreateTopLevelElement('pom', 'dependencies');
      assert.ok(dependencies);
      assert.equal(dependencies.toString(), '<dependencies/>');
    });

    it('remove only dependency', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <dependencies>',
        '    <dependency>',
        '      <groupId>com.ziaconsulting</groupId>',
        '      <artifactId>test</artifactId>',
        '      <version>1.0.0</version>',
        '      <scope>compile</scope>',
        '    </dependency>',
        '  </dependencies>',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      pom.removeDependency('com.ziaconsulting', 'test', '1.0.0', undefined, 'compile');
      var dependencies = pom.getOrCreateTopLevelElement('pom', 'dependencies');
      assert.ok(dependencies);
      assert.equal(dependencies.toString(), '<dependencies>\n    \n  </dependencies>');
    });

  });

  describe('.findModule()', function() {

    it('returns undefined when module is not found', function () {
      var pom = require('../generators/app/maven-pom.js')();
      var dependency = pom.findModule('asdf');
      assert.equal(dependency, undefined);
    });

    it('find only module', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <modules>',
        '    <module>asdf</module>',
        '  </modules>',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var moduleNode = pom.findModule('asdf');
      assert.ok(moduleNode);
      assert.equal(moduleNode.toString(), '<module>asdf</module>');
    });

    it('find first module', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <modules>',
        '    <module>asdf</module>',
        '    <module>fsda</module>',
        '  </modules>',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var moduleNode = pom.findModule('asdf');
      assert.ok(moduleNode);
      assert.equal(moduleNode.toString(), '<module>asdf</module>');
    });

    it('find last module', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <modules>',
        '    <module>fsda</module>',
        '    <module>asdf</module>',
        '  </modules>',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var moduleNode = pom.findModule('asdf');
      assert.ok(moduleNode);
      assert.equal(moduleNode.toString(), '<module>asdf</module>');
    });

    it('find middle module', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <modules>',
        '    <module>fsda</module>',
        '    <module>asdf</module>',
        '    <module>abcd</module>',
        '  </modules>',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var moduleNode = pom.findModule('asdf');
      assert.ok(moduleNode);
      assert.equal(moduleNode.toString(), '<module>asdf</module>');
    });

  });

  describe('.addModule()', function() {

    it('add first module', function () {
      var pom = require('../generators/app/maven-pom.js')();
      var moduleNode = pom.addModule('asdf');
      var moduleNodes = pom.getOrCreateTopLevelElement('pom', 'modules');
      assert.ok(moduleNode);
      assert.ok(moduleNodes);
      assert.equal(moduleNodes.toString(), '<modules><module>asdf</module></modules>');
    });

    it('don\'t replace existing module', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <modules>',
        '    <module>asdf</module>',
        '  </modules>',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var moduleNode = pom.addModule('asdf');
      var moduleNodes = pom.getOrCreateTopLevelElement('pom', 'modules');
      assert.ok(moduleNode);
      assert.ok(moduleNodes);
      assert.equal(moduleNode.toString(), '<module>asdf</module>');
      assert.equal(moduleNodes.toString(), '<modules>\n    <module>asdf</module>\n  </modules>');
    });

    it('add second module', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <modules>',
        '    <module>fdsa</module>',
        '  </modules>',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var moduleNode = pom.addModule('asdf');
      var moduleNodes = pom.getOrCreateTopLevelElement('pom', 'modules');
      assert.ok(moduleNode);
      assert.ok(moduleNodes);
      assert.equal(moduleNode.toString(), '<module>asdf</module>');
      assert.equal(moduleNodes.toString(), '<modules>\n    <module>fdsa</module>\n  <module>asdf</module></modules>');
    });

  });

  describe('.removeModule()', function() {

    it('does not remove non-existent module', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      pom.removeModule('asdf');
      var moduleNodes = pom.getOrCreateTopLevelElement('pom', 'modules');
      assert.ok(moduleNodes);
      assert.equal(moduleNodes.toString(), '<modules/>');
    });

    it('remove only module', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <modules>',
        '    <module>asdf</module>',
        '  </modules>',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      pom.removeModule('asdf');
      var moduleNodes = pom.getOrCreateTopLevelElement('pom', 'modules');
      assert.ok(moduleNodes);
      assert.equal(moduleNodes.toString(), '<modules>\n    \n  </modules>');
    });

  });

  describe('.findPlugin()', function() {

    var pomString = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<!-- Stuff -->',
      '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
      '  <build>',
      '    <plugins>',
      '      <plugin>',
      '        <groupId>com.ziaconsulting</groupId>',
      '        <artifactId>test</artifactId>',
      '      </plugin>',
      '    </plugins>',
      '  </build>',
      '</project>',
    ].join('\n');

    it('find plugin by groupId and artifactId', function () {
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var plugin = pom.findPlugin('com.ziaconsulting', 'test');
      assert.ok(plugin);
      assert.equal(plugin.toString(),
          [
            '<plugin>',
            '        <groupId>com.ziaconsulting</groupId>',
            '        <artifactId>test</artifactId>',
            '      </plugin>'
          ].join('\n'));
    });

    it('find plugin by only artifactId', function () {
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var plugin = pom.findPlugin('test');
      assert.ok(plugin);
      assert.equal(plugin.toString(),
          [
            '<plugin>',
            '        <groupId>com.ziaconsulting</groupId>',
            '        <artifactId>test</artifactId>',
            '      </plugin>'
          ].join('\n'));
    });

  });

  describe('.findOverlay()', function() {

      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <build>',
        '    <plugins>',
        '      <plugin>',
        '        <artifactId>maven-war-plugin</artifactId>',
        '        <configuration>',
        '          <overlays>',
        '            <overlay>',
        '              <groupId>${project.groupId}</groupId>',
        '              <artifactId>repo-amp</artifactId>',
        '              <type>amp</type>',
        '            </overlay>',
        '          </overlays>',
        '        </configuration>',
        '      </plugin>',
        '    </plugins>',
        '  </build>',
        '</project>',
      ].join('\n');

    it('find overlay by groupId, artifactId and type', function () {
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var overlay = pom.findOverlay('${project.groupId}', 'repo-amp', 'amp');
      assert.ok(overlay);
      assert.equal(overlay.toString(),
        [
          '<overlay>',
          '              <groupId>${project.groupId}</groupId>',
          '              <artifactId>repo-amp</artifactId>',
          '              <type>amp</type>',
          '            </overlay>',
        ].join('\n'));
    });

    it('find overlay by groupId and artifactId', function () {
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var overlay = pom.findOverlay('${project.groupId}', 'repo-amp');
      assert.ok(overlay);
      assert.equal(overlay.toString(),
        [
          '<overlay>',
          '              <groupId>${project.groupId}</groupId>',
          '              <artifactId>repo-amp</artifactId>',
          '              <type>amp</type>',
          '            </overlay>',
        ].join('\n'));
    });

  });

  describe('.addOverlay()', function() {

      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <build>',
        '    <plugins>',
        '      <plugin>',
        '        <artifactId>maven-war-plugin</artifactId>',
        '        <configuration>',
        '          <overlays>',
        '            <overlay>',
        '              <groupId>${project.groupId}</groupId>',
        '              <artifactId>repo-amp</artifactId>',
        '              <type>amp</type>',
        '            </overlay>',
        '          </overlays>',
        '        </configuration>',
        '      </plugin>',
        '    </plugins>',
        '  </build>',
        '</project>',
      ].join('\n');

    it('adds overlay', function () {
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var overlay = pom.addOverlay('com.ziaconsulting', 'test', 'amp');
      assert.ok(overlay);
      // Now search for our overlay to make sure we get the correct xml
      overlay = pom.findOverlay('com.ziaconsulting', 'test', 'amp');
      assert.ok(overlay);
      assert.equal(overlay.toString(),
      '<overlay><groupId>com.ziaconsulting</groupId><artifactId>test</artifactId><type>amp</type></overlay>');
    });

  });

  describe('.removeOverlay()', function() {

    it('removes only overlay', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <build>',
        '    <plugins>',
        '      <plugin>',
        '        <artifactId>maven-war-plugin</artifactId>',
        '        <configuration>',
        '          <overlays>',
        '            <overlay>',
        '              <groupId>${project.groupId}</groupId>',
        '              <artifactId>repo-amp</artifactId>',
        '              <type>amp</type>',
        '            </overlay>',
        '          </overlays>',
        '        </configuration>',
        '      </plugin>',
        '    </plugins>',
        '  </build>',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      pom.removeOverlay('${project.groupId}', 'repo-amp', 'amp');
      var overlay = pom.findOverlay('${project.groupId}', 'repo-amp', 'amp');
      assert.equal(overlay, undefined);
    });

  });

  describe('.setProperty()', function() {

    it('can set new property', function () {
      var pom = require('../generators/app/maven-pom.js')();
      var property = pom.setProperty('fiddle', 'sticks');
      assert.ok(property);
      assert.equal(property.toString(), '<fiddle>sticks</fiddle>');
    });

    it('can update existing property', function () {
      var pomString = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!-- Stuff -->',
        '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
        '  <properties>',
        '    <fiddle>faddle</fiddle>',
        '  </properties>',
        '</project>',
      ].join('\n');
      var pom = require('../generators/app/maven-pom.js')(pomString);
      var property = pom.setProperty('fiddle', 'sticks');
      assert.ok(property);
      assert.equal(property.toString(), '<fiddle>sticks</fiddle>');
    });

  });

});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
