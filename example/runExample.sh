#!/bin/sh

echo "Starting http-server..."
node_modules/http-server/bin/http-server app &
serverPID=$!
echo "http-server is running (pid: $serverPID)"

echo "Running protractor tests"
node_modules/protractor/bin/protractor protractor.conf.js

echo "killing http-server..."
kill $serverPID
