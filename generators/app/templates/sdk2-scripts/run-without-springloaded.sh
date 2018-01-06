#!/bin/bash

DIR=$( cd "$( dirname "$BASH_SOURCE[0]" )" && pwd )

pushd . > /dev/null
cd "$DIR"
CWD=$( basename $DIR )
if [ "scripts" == "$CWD" ]
then
  cd ..
fi

MAVEN_OPTS="-Xms256m -Xmx2G -XX:PermSize=300m" mvn install -Prun <%= enterpriseFlag %> $@

popd > /dev/null
