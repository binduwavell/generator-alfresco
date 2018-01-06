#!/bin/bash

DIR=$( cd "$( dirname "$BASH_SOURCE[0]" )" && pwd )

CWD=$( pwd )
cd "$DIR"

cd ../source_templates/<%= sdkVersionPrefix %>platform-jar
mvn dependency:unpack-dependencies -Dclassifier=sources -DoutputDirectory=../../exploded
rm -rf target

cd ../source_templates/<%= sdkVersionPrefix %>share-jar
mvn dependency:unpack-dependencies -Dclassifier=sources -DoutputDirectory=../../exploded
rm -rf target

cd "$CWD"
