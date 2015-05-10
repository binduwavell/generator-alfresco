#!/bin/bash

DIR=$( cd "$( dirname "$BASH_SOURCE[0]" )" && pwd )

grep $@ --line-number --color=always --exclude-dir={.bzr,.cvs,.git,.hg,.svn} --recursive "$DIR/../exploded/" | less -R
