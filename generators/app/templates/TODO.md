TODO
====

Depending on how you answer the questions presented by the alfresco generator
there may be additional steps you can do. Some of these may be required while
others may be optional.

<%_ if (removeDefaultSourceAmps) { _%>
- [ ] You accepted the default "Remove default source amps" option during
      project creation, you will not have any source amps setup to begin 
      with, don't be scared and read on. BTW, your project will totally
      work even without any amps in it, you'll just have vanilla repo
      and share webapps.
<%_ } _%>
- [ ] You can use the following command to start an interactive session 
      that will guide you through what you need to provide to create
      a repo or share source amp (it will even allow you to create a pair
      with a repo amp and a share amp):
      
```bash
# Select Source AMP and follow along with the prompts:
yo alfresco:amp

# Or go straight into source amp creation with either of these:
yo alfresco:amp-add-source
yo alfresco:amp -A source

# Try the following to get the full command line option list:
yo alfresco:amp-add-source --help
```

- [ ] Would you like to have the JavaScript Console in your dev environment?
      Clone https://github.com/share-extras/js-console and build it. Then,
      copy javascript-console-repo-0.6.0.amp to the ./amps folder and 
      javascript-console-share-0.6.0.amp to the ./amps\_share folder.
      Then, you can use the following commands to install these *local* amps:
      
```bash
yo alfresco:amp -A local -p amps/javascript-console-repo-0.6.0.amp -g org.sharextras -a javascript-console-repo -v 0.6.0
yo alfresco:amp -A local -p amps_share/javascript-console-share-0.6.0.amp -g org.sharextras -a javascript-console-share -v 0.6.0
```

- [ ] If you have the JavaScript console AMPs deployed in a Maven repository
      that your project has access to, you can use the following commands to 
      install these *remote* amps (you may have to update the groupId, artifactId
      and/or version depending on how these are deployed for you):

```bash
yo alfresco:amp -A remote -w repo -g org.sharextras -a javascript-console-repo -v 0.6.0
yo alfresco:amp -A remote -w share -g org.sharextras -a javascript-console-share -v 0.6.0
```

- [ ] Would you like to be able to control content type type of uploads and 
      capture metadata during upload? Try adding Uploader Plus to your 
      project from Maven Central:

```bash
yo alfresco:amp -A remote -w repo -g com.softwareloop -a uploader-plus-repo -v 1.2
yo alfresco:amp -A remote -w share -g com.softwareloop -a uploader-plus-surf -v 1.2
```
<%_ if (isEnterprise) { _%>

For Enterprise Use
------------------

- [ ] Make sure that your ~/.m2/settings.xml file is configured to allow access to enterprise artifacts
- [ ] Copy your license file to repo/src/main/resources/alfresco/extension/license
- [ ] You may wish to install the Support Tools AMP from artifacts.alfresco.com:

```bash
yo alfresco:amp-add-remote -w repo -g org.alfresco.support -a support-tools -v 1.10
```

<%_ } _%>
