TODO
====

Depending on how you answer the questions presented by the alfresco generator
there may be additional steps you can do. Some of these may be required while
others may be optional.

<% if (removeDefaultSourceAmps) { -%>
- [ ] You accepted the default "Remove default source amps" option during
      project creation, you will not have any source amps setup to begin with.
<% } -%>
- [ ] You can use the following command to start an interactive session 
      that will guide you through what you need to provide to create
      a repo or share source amp (it will even allow to create a pair
      with a repo amp and a share amp):
      
```bash
# Select Source AMP and follow along with the prompts:
yo alfresco:amp

# Or go straight into source amp creation with either of these:
yo alfresco:amp-source
yo alfresco:amp -A source

# Try the following to get the full command line optionlist:
yo alfresco:amp-source --help
```

- [ ] If you have the JavaScript console AMPs deployed in a Maven repository
      that you have access to using the default GAV from inside the .amp 
      files, you can use the following commands to install these amps:

```bash
yo alfresco:amp -A remote -w repo -g org.sharextras -a javascript-console-repo -v 0.6.0
yo alfresco:amp -A remote -w share -g org.sharextras -a javascript-console-share -v 0.6.0
```

- [ ] If you copy the file javascript-console-repo-0.6.0.amp to ./amps and the
      javascript-console-share-0.6.0.amp file to ./amps\_share, you can use
      the following command to install these amps:
      
```bash
yo alfresco:amp -A local -p amps/javascript-console-repo-0.6.0.amp -g org.sharextras -a javascript-console-repo -v 0.6.0
yo alfresco:amp -A local -p amps_share/javascript-console-share-0.6.0.amp -g org.sharextras -a javascript-console-share -v 0.6.0
```

<% if (isEnterprise) { %>
For Enterprise Use
------------------

- [ ] Make sure that your ~/.m2/settings.xml file is configured to allow access to enterprise artifacts
- [ ] Copy your license file to repo/src/main/resources/alfresco/extension/license
- [ ] You may wish to install the Support Tools AMP:

```bash
yo alfresco:amp-remote -w repo -g org.alfresco.support -a support-tools -v 1.10
```

<% } %>
