#!/bin/bash

DIR=$( cd "$( dirname "$BASH_SOURCE[0]" )" && pwd )

CWD=$( pwd )
cd "$DIR"

cd ../repo-amp
mvn dependency:unpack-dependencies <%= enterpriseFlag %> -Dclassifier=sources -DoutputDirectory=../exploded

cd ../share-amp
mvn dependency:unpack-dependencies <%= enterpriseFlag %> -Dclassifier=sources -DoutputDirectory=../exploded

cd "$CWD"
