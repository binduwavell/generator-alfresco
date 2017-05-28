#!/bin/bash
# Downloads the spring-loaded lib if not existing and runs the repository AMP
springloadedfile=~/.m2/repository/org/springframework/springloaded/${springloaded.version}/springloaded-${springloaded.version}.jar

if [ ! -f $springloadedfile ]; then
mvn validate -Psetup
fi

MAVEN_OPTS="-javaagent:$springloadedfile -noverify -Xms256m -Xmx2G -XX:PermSize=300m" mvn integration-test -Prun