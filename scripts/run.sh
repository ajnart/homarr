#!/bin/sh

echo "Exporting hostname..."
export NEXTAUTH_URL_INTERNAL="http://$HOSTNAME:7575"

echo "Migrating database..."
yarn ts-node src/migrate.ts & PID=$!
# Wait for migration to finish
wait $PID

echo "Reverting to production node_modules..."
# Copy specific sqlite3 binary to node_modules
cp /app/node_modules/better-sqlite3/build/Release/better_sqlite3.node /app/node_modules_cache/better-sqlite3/build/Release/better_sqlite3.node

# Remove node_modules and copy cached node_modules
rm -r /app/node_modules
cp -r /app/node_modules_cache /app/node_modules
cp ./temp_package.json package.json 
cp ./temp_yarn.lock yarn.lock

echo "Starting production server..."
node /app/server.js