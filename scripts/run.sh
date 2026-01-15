#!/usr/bin/env bash

# Create sub directories in volume
mkdir -p /appdata/db
mkdir -p /appdata/redis
mkdir -p /appdata/trusted-certificates

# Run migrations
if [ "$DB_MIGRATIONS_DISABLED" = "true" ]; then
  echo "DB migrations are disabled, skipping"
else
    echo "Running DB migrations"
    # We disable redis logs during migration as the redis client is not yet started
    DISABLE_REDIS_LOGS=true node ./db/migrations/$DB_DIALECT/migrate.cjs ./db/migrations/$DB_DIALECT
fi

# Auth secret is generated every time the container starts as it is required, but not used because we don't need JWTs or Mail hashing
export AUTH_SECRET=$(openssl rand -base64 32)
# Cron job API key is generated every time the container starts as it is required for communication between nextjs-api and tasks-api
export CRON_JOB_API_KEY=$(openssl rand -base64 32)

# Start nginx proxy
# 1. Replace the HOSTNAME in the nginx template file
# 2. Create the nginx configuration file from the template
# 3. Start the nginx server
export HOSTNAME
envsubst '${HOSTNAME}' < /etc/nginx/templates/nginx.conf > /etc/nginx/nginx.conf
# Start services in the background and store their PIDs
nginx -g 'daemon off;' &
NGINX_PID=$!

if [ "$REDIS_IS_EXTERNAL" = "true" ]; then
    echo "Using external Redis server at redis://$REDIS_HOST:$REDIS_PORT"
    REDIS_PID=""
else
    echo "Starting internal Redis server"
    redis-server /app/redis.conf &
    REDIS_PID=$!
fi



node apps/tasks/tasks.cjs &
TASKS_PID=$!

node apps/websocket/wssServer.cjs &
WSS_PID=$!

node apps/nextjs/server.js &
NEXTJS_PID=$!

# Function to handle SIGTERM and shut down services
terminate() {
    echo "Received SIGTERM. Shutting down..."
    kill -TERM $NGINX_PID $TASKS_PID $WSS_PID $NEXTJS_PID 2>/dev/null
    wait
    # kill redis-server last because of logging of other services and only if $REDIS_PID is set
    if [ -n "$REDIS_PID" ]; then
        kill -TERM $REDIS_PID 2>/dev/null
        wait
    fi
    echo "Shutdown complete."
    exit 0
}

# When SIGTERM (docker stop <container>) / SIGINT (ctrl+c) is received, run the terminate function
trap terminate TERM INT

# Wait for all processes
wait $NEXTJS_PID
terminate
