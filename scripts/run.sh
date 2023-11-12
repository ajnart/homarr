#!/bin/sh

echo "Exporting hostname..."
export NEXTAUTH_URL_INTERNAL="http://$HOSTNAME:7575"

echo "Migrating database..."
cd ./migrate; yarn db:migrate & PID=$!
# Wait for migration to finish
wait $PID

echo "Starting production server..."
node /app/server.js & PID=$!

wait $PID