#!/bin/sh

echo "Exporting hostname..."
export NEXTAUTH_URL_INTERNAL="http://$HOSTNAME:7575"

echo "Pushing database changes..."
npm config set update-notifier false
npx prisma db push --skip-generate

echo "Starting production server..."
node /app/server.js