#!/bin/sh
cd src/verify
# Retrieve the endpoint from serverless info, only returns the first one
export ENDPOINT=`serverless info | awk '/endpoints:/,/functions/' | awk '/https/{print $3}' | head -n 1`
cd ../../
npm run e2etest