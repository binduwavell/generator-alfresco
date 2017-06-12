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
      You can use the following commands to install these *remote* amps
      (you may have to update the version):

```bash
yo alfresco:amp -A remote -w repo -g de.fmaul -a javascript-console-repo -v 0.6
yo alfresco:amp -A remote -w share -g de.fmaul -a javascript-console-share -v 0.6

# Alternatively you can use the following one-liner:
      
yo alfresco:amp -A common -p javascript
```

- [ ] If you'd like to add Upload Plus and the community build of RM, which
      are both available from the Common AMP sub-generator, you can use this
      simple one-liner:

```bash
yo alfresco:amp -A common -p uploader,records
```

<%_ if (isEnterprise) { _%>

For Enterprise Use
------------------

- [ ] Make sure that your ~/.m2/settings.xml file is configured to allow access to enterprise artifacts
- [ ] Copy your license file to repo/src/main/resources/alfresco/extension/license
- [ ] You may wish to install the Support Tools AMP from artifacts.alfresco.com, here are a couple of options:

```bash
yo alfresco:amp -A common -p support

# or the following version that allows you to fully control how you bring the amp in

yo alfresco:amp-add-remote -w repo -g org.alfresco.support -a support-tools -v 1.10
```

<%_ } _%>
