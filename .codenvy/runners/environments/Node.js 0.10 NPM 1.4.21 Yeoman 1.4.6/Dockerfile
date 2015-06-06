FROM binduwavell/codenvy-alfresco-generator-community:0.1

ADD $app$/package.json /tmp/application/package.json

RUN cd /tmp/application && npm install

# 1. Update permissions
# 2. Copy nodejs modules to the application folder
# 3. Update permissions recursively
# 4. Makes newly created files accessible for anyone
# 5. Link the generator
# 6. Sleep so we can shell into the container
CMD sudo chmod a+rw /home/user/application/ && \
    cp -a /tmp/application/node_modules /home/user/application/ && \
    sudo chmod a+rw -R /home/user/application/ && \
    umask 0 && \
    cd /home/user/application ; sudo npm link && \
    sleep 365d
    