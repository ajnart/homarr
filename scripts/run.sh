#!/bin/sh

export NEXTAUTH_URL_INTERNAL="http://$HOSTNAME:7575"
node /app/server.js