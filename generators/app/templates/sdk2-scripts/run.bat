@ECHO OFF

IF "%MAVEN_OPTS%" == "" (
    ECHO The environment variable 'MAVEN_OPTS' is not set, setting it for you
    SET MAVEN_OPTS=-Xms256m -Xmx2G -XX:PermSize=300m
)
ECHO MAVEN_OPTS is set to '%MAVEN_OPTS%'
mvn clean install -Prun <%= enterpriseFlag %> %1 %2 %3 %4 %5 %6 %7 %8 %9