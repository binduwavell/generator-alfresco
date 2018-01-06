#!/bin/bash

DIR=$( cd "$( dirname "$BASH_SOURCE[0]" )" && pwd )

CWD=$( pwd )
cd "$DIR"

cd ../source_templates/<%= sdkVersionPrefix %>repo-amp
mvn dependency:unpack-dependencies <%= enterpriseFlag %> -Dclassifier=sources -DoutputDirectory=../../exploded
rm -rf target

cd ../source_templates/<%= sdkVersionPrefix %>share-amp
mvn dependency:unpack-dependencies <%= enterpriseFlag %> -Dclassifier=sources -DoutputDirectory=../../exploded
rm -rf target

cd "$CWD"
