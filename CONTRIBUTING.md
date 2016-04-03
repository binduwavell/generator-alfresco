# Contributing

We are more than happy to accept external contributions to the project in the form of feedback, bug reports and even better - pull requests :)

If you have not done so already, please review and honor our [code-of-conduct](CODE_OF_CONDUCT.md).

## Issue Submission

In order for us to help you please check that you've completed the following steps:

* Made sure you're on the latest version `npm update -g yo && npm update -g binduwavell/generator-alfresco`
* Used the search feature to ensure that the bug hasn't been reported before
  
[Submit your issue](https://github.com/binduwavell/generator-alfresco/issues/new)

## Quick Start

- Install [nodejs](https://nodejs.org)
- Clone [yo](https://github.com/yeoman/yo)
- Run `npm install` and then `npm link` in the cloned yo directory
- Fork [generator-alfresco](https://github.com/binduwavell/generator-alfresco) 
- Clone your forked generator and `cd` into it
- Add the [upstream](https://help.github.com/articles/configuring-a-remote-for-a-fork/) repo via `git remote add upstream https://github.com/binduwavell/generator-alfresco.git`
- Run `npm install` and then `npm link` in your cloned generator directory

At this point you can start tinkering with yeoman and generator-alfresco. In order to contribute your work:

- Create a feature branch to work in `git checkout -b feature-YOUR-FEATURE`
- Start hacking :)

When you are ready to push your feature branch for the first time use `git push -u origin feature-YOUR_FEATURE`. Subsequently, while you have your branch checked out, you should be able to just `git push`.

You can keep each repo up to date by running `git pull --rebase upstream master` from inside each cloned project. If there are changes to `package.json` you should run `npm install` again.

Before submitting a [pull request](https://github.com/binduwavell/generator-alfresco/pulls) from your feature branch, make sure you've completed all of the items outlined in the checklist section of our [pull request template](.github/PULL_REQUEST_TEMPLATE.md).

## Style Guide

This project follows the style set forth by the yeoman project. i.e., it uses single-quotes, two space indentation and multiple var statements.

Please ensure any pull requests follow the guidelines closely. If you notice existing code which doesn't follow these practices, feel free to ping us and we will address this.

## Contacting Us

Join our chat room on [Gitter][gitter-url] 

## Pull Request Guidelines

* Please check to make sure that there aren't existing pull requests attempting to address the issue mentioned
* Non-trivial changes should be discussed in an issue first
* Develop in a feature branch, not master
* Lint the code by running `npm run eslint` (if eslint fails, we will not accept the PR)
* Add relevant tests to cover the change. `npm run cover:local` can be used to check coverage
* Make sure test-suite passes: `npm test` (if tests fail, we will not accept the PR)
  * You can watch/run a specific test during developemnt with `npm run test:watchone test/TEST-FILE-NAME`
* Squash your commits
* Write a convincing description of your PR and why we should land it
* If you are not responsive to feedback on your PR we will not accept the PR

When we say we will not accept a PR, we will likely close the PR. You are encouraged to address the concernes that we will outline before we close it and then re-submit the PR. We really do want contributions. We also need for them to be of high quality and high value and to not take undue resources away from the features and enhancements we are working on. Thanks for understanding!

## Credits
Based on the [contribution guidlines from the yeoman project][yeoman-contrib].

[gitter-url]: https://gitter.im/binduwavell/generator-alfresco?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[yeoman-contrib]: https://github.com/yeoman/yeoman/blob/master/contributing.md
