# generator-alfresco 

[![Build Status][travis-image]][travis-url] [![Coverage Status][codecov-image]][codecov-url] [![Dependency Status][bithound-dep-image]][bithound-dep-url] [![Dev Dependency Status][bithound-dev-image]][bithound-dev-url] [![Join the Chat][gitter-image]][gitter-url] [![Quick Contribution on Codenvy][codenvy-image]][codenvy-url]

## Getting Started

### What is [Alfresco](http://www.alfresco.com)?

Alfresco is an open-source content management application. This project provides some tools for 
setting up and working with Alfresco extension/enhancement projects. It wraps and extends the
Alfresco SDK and specifically the All in One maven archetype.

### What is [Yeoman](http://yeoman.io)?

Yeoman is a command line tool that helps you to automate coding tasks. Out of the box, Yeoman 
doesn't do very much. It relies on a library of thousands of 
[generators](http://yeoman.io/generators/) to actually perform the coding tasks for you.

Yeoman lives in the [npm](https://npmjs.org) package repository. Assuming you have a recent
version of [node.js](http://www.nodejs.org) installed, you can use the following command
to install Yeoman.

```bash
npm install -g yo
```

### Installing and using the generator

You have a couple of options for installing the Alfresco generator for Yeoman. Your choice will 
depend on if you plan to extend the generator or if you simply want to use it.

> _Checkout the next section for what to do if you plan to work on the generator code._

We have not pushed a version of the Alfresco generator to npmjs.org yet, so if you don't 
plan to make changes to the generator itself, run:

```bash
npm install -g binduwavell/generator-alfresco
```

WARNING: you will likely need to update this occasionally as the project is under active 
development.

Now, assuming you have all of the pre-requisites installed (including appropriate
versions of node, npm, yeoman, this generator, Java and Maven.) You can create an 
Alfresco extension project using this generator. First of all you should create a 
new folder for your project and change into the new folder. Then run the following 
command:

```bash
yo alfresco
```

This will ask you a number of questions and then generate a project based on your
answers. `yo alfresco` will make sure you have an appropriate version of Java and
Maven available for the version of the SDK you select. It will then use the 
all-in-one Alfresco SDK archetype from the selected version of the SDK to create
a project. Finally it will add (and potentially remove) some additional files and
folders to the project.

Here is an example of what the top level folder structure might look like:

```
TODO.md
amps
amps_share
customizations
debug.sh
modules
pom.xml
repo
run-without-springloaded.sh
run.bat
run.sh
runner
scripts
share
solr-config
source_templates
```

Notice that we provide a `run-without-springloaded.sh` in addition to the default
`run.sh`. The generator automatically makes these executable. There are some other
helpful scripts in the `scripts` folder.

As part of the generation process, we actually copy the `repo-amp` and `share-amp` 
folders to `source_templates`. That way we have SDK specific instances of these
folder structures that we can use later on when you want to add **Source AMPS**
to your project.

One of the questions the we ask is `? Should we remove the default source amps? (Y/n)`.
Notice that the default here is `Y` and in the project listing above there are no
folders for `repo-amp` or `share-amp`. Of course if you answer `N` to this question
then the default AMPs will be left in place.

If you accept the default behavior of removing the default source amps, we 
remove those top level folders. We also, remove them from the top level `pom.xml`.
We remove the references from `repo/pom.xml`, `share/pom.xml` and even from the
Tomcat context files in the `runner` module.

```bash
yo alfresco --help
yo alfresco:action --help
yo alfresco:amp --help
yo alfresco:behavior --help
yo alfresco:model --help
yo alfresco:webscript --help
```

Will print out information about cli arguments and options.

```bash
yo alfresco:amp
```

This starts by asking if you would like to add source, local, remote or common AMPs. 

When you select **Source AMP**, we'll ask a few questions and then create additional 
repo/share source AMPs under the `customizations` folder. These are created by copying
the `repo-amp` and `share-amp` folders from `source_templates`. Of course, we update
paths and names appropriately. We also automatically plug them into your project files 
(including maven and spring/tomcat contexts.) 

You can use either of the following as a shortcut for adding source AMPs:

```bash
yo alfresco:amp -A source
yo alfresco:amp-add-source
```

If you have AMP files you'd like to incorporate into your project, you can place
repository AMPs into the `amps` root folder (just like you do when you use the
Alfresco installer.) Similarly you can place your pre-packaged Share AMP files
into the `amps_share` root folder. In order to get these plugged into the project
you use the **Local AMP** option with the `yo alfresco:amp` sub-generator. Here
are some example commands you could use:

```bash
yo alfresco:amp
yo alfresco:amp -A local
yo alfresco:amp-add-local
```

When you use these commands, we'll go through the `amps` and `amps_share` folders
and find any AMP files that are not already linked into your project structure.
You select the AMP files one at a time, you'll be asked to provide a Maven
groupId, artifactId and version for the AMP. If this information is included 
inside the AMP file, we'll try to provide you with sane default values. At the 
end of the day, it's not super important what values you provide. Of course 
you'll probably be happy if you choose meaningful values when you come back to
the project in a month or a year.

The **Remote AMP** option allows you to specify if the AMP should be installed into the 
repository or Share. It also asks you to provide Maven groupId, artifactId and version 
for an AMP file that is in a Maven repository that your build has access to. For example, 
the Uploader Plus plugin is available in Maven Central, so you can provide information for
one of these AMPs and the build will automatically download and install the AMP the next
time you run your project.

Here are some sample command lines you can use:

```bash
yo alfresco:amp
yo alfresco:amp -A remote
yo alfresco:amp-add-remote
```

The final option for installing AMPs is **Common AMPS**, this lists AMPs that are
available via a public maven repo that we can plug into your project on your 
behalf. Currently these include:

- JavaScript Console
- Records Management (Community)
- Support Tools
- Uploader Plus

Here are some sample command lines you can use:

```bash
yo alfresco:amp
yo alfresco:amp -A common
yo alfresco:amp-add-common
```

You can actually specify more than one AMP to install at the same time; we'll even
install both repo and share amps if necessary.

```bash
yo alfresco:action
```

You'll be prompted for some basic information including which repo **Source AMP** you 
want to create the action in. We'll create a basic repository action for you. This 
includes a Java class, a properties file that causes the action and arguments to have 
pretty labels and a context file with bean definitions for the Java class and the 
resource bundle for loading the properties file.

```bash
yo alfresco:behavior
```

You'll be prompted for some basic information including which repo **Source AMP** you 
want to create the behavior class in. We'll create a class that registers a behavior 
for the `onUpdateProperties` policy on all `cm:content` nodes. We'll also generate a
context file that registers a bean for this class and passes in the minimal items 
you'll need to create behavior code.

```bash
yo alfresco:model
```

You'll be prompted for some basic information including which repo **Source AMP** you 
want to create the model in. We'll create a very bare `model.xml` file for you, this
file has a bunch of commented out examples in it, so you should be able to create a
valid model pretty easily. Of course we also provide a context file that registers
the model.


```bash
yo alfresco:webscript
```

This will ask you a bunch of questions and then produce appropriate repo/share files
for your WebScript. If you choose multiple HTTP methods you can in fact scaffold multiple
webscripts with one pass through this sub-generator.

We are planning to add many more sub-generators for things like: jobs, workflows, JavaScript
root objects, metadata extractors, content transformers, etc. We also hope to add 
sub-generators for doing a bunch of common tasks with Share customization.

### Try The Project / Contribute

Before reporting issues or working on fixes/enhancements, please make sure you are
familiar with and agree to our [code of conduct](./CODE_OF_CONDUCT.md#readme).

If you plan to to make changes to the generator itself, there are detailed
instructions in the [contributing](./CONTRIBUTING.md#readme) page. 

If you are particularly impatient, you have a couple options options for a quick
start. You can check out the generator-alfresco project (or ideally a fork of the same)
and then run the following command from the checked out project directory:

```bash
npm install
npm link # may need sudo
```

This is essentially the same as the ```npm install -g binduwavell/generator-alfresco```
command above, but you'll have a project directory where you can tweak things, and
push updates back to GitHub.

Another super low effort option to getting started quickly is to open a clone of this project 
in Codenvy (a cloud IDE), by clicking this badge: 
[![create project on Codenvy][codenvy-image]][codenvy-url] (this link is currently to the new awesome beta.codenvy.com.)

Clicking the button will create a temporary workspace at Codenvy with a clone of this project, 
allowing you to run the generator in an embedded docker container called a runner. 
You can make edits to the generator-alfresco project, test them and send pull requests right
from your browser. You can even run the generated Alfresco All-In-One community project 
produced by the generator in the runner. Other than your browser, this is a zero install option.

Here is a slightly dated video showing the process with the older version of Codenvy:

[![watch video demo using Codenvy](http://img.youtube.com/vi/Pq5IwG5Aq0Q/0.jpg)](http://www.youtube.com/watch?v=Pq5IwG5Aq0Q)

## Getting Help

If you find a bug or something is confusing, you can review [existing](https://github.com/binduwavell/generator-alfresco/issues) or create a [new issue](https://github.com/binduwavell/generator-alfresco/issues/new). If you'd like to chat, you can reach out on our [Gitter](https://gitter.im/binduwavell/generator-alfresco) channel.

## License

Apache 2.0

[travis-image]: https://img.shields.io/travis/binduwavell/generator-alfresco/master.svg
[travis-url]: https://travis-ci.org/binduwavell/generator-alfresco
[bithound-dep-image]: https://www.bithound.io/github/binduwavell/generator-alfresco/badges/dependencies.svg
[bithound-dep-url]: https://www.bithound.io/github/binduwavell/generator-alfresco/master/dependencies/npm
[bithound-dev-image]: https://www.bithound.io/github/binduwavell/generator-alfresco/badges/devDependencies.svg
[bithound-dev-url]: https://www.bithound.io/github/binduwavell/generator-alfresco/master/dependencies/npm
[daviddm-image]: https://david-dm.org/binduwavell/generator-alfresco.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/binduwavell/generator-alfresco
[codecov-image]: https://codecov.io/github/binduwavell/generator-alfresco/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/binduwavell/generator-alfresco?branch=master
[coveralls-image]: https://coveralls.io/repos/binduwavell/generator-alfresco/badge.svg?branch=master&service=github
[coveralls-url]: https://coveralls.io/github/binduwavell/generator-alfresco?branch=master
[gitter-image]: https://img.shields.io/badge/gitter-join%20chat%20%E2%86%92-brightgreen.svg
[gitter-url]: https://gitter.im/binduwavell/generator-alfresco?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[codenvy-image]: http://beta.codenvy.com/factory/resources/codenvy-contribute.svg
[codenvy-url]: http://beta.codenvy.com/f?id=zia672875qiibfzv
