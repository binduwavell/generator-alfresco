#!/bin/bash

# This script should be sourced, the following block of magic is an attempt
# to detect if the script is being run rather than sourced. In which case
# we print an appropriate message. Notice the #! above means that if this
# is executed we will be in a bash context. If it is sourced we may be in
# a bash context or in whatever the users shell is (zsh for example.) In
# any this logic only makes sense if the current shell is bash, otherwise
# all bets are off.
if [[ "$BASH_SOURCE[0]" = "$0" ]]; then
  export _MYSHELL=$( basename $( ps -hp $$ | awk '{print $5}' ) )
  if [[ "bash" = "$_MYSHELL" ]]; then
    echo "In order for this to affect your environment it must be sourced"
  fi
fi

export MAVEN_OPTS="-Xms256m -Xmx2G -XX:PermSize=300m"
export PATH="$PATH:$PWD/scripts"
