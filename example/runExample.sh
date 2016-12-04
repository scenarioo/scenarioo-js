#!/bin/sh

# MAKE SURE TO FIRST RUN "gulp build" in order to produce ES5 sources (to ./lib folder)

echo "Starting http-server..."
node_modules/http-server/bin/http-server -p 8081 . &
serverPID=$!
echo "http-server is running (pid: $serverPID)"

echo "Running protractor tests"
node_modules/protractor/bin/protractor protractor.conf.js

echo "killing http-server..."
kill $serverPID
