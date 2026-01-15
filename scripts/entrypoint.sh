#!/bin/sh
set -e

export PUID=${PUID:-0}
export PGID=${PGID:-0}

echo "Starting with UID='$PUID', GID='$PGID'"

if [ "${PUID}" != "0" ] || [ "${PGID}" != "0" ]; then
    # The below command will change the owner of all files in the /app directory (except node_modules) to the new UID and GID
    echo "Changing owner to $PUID:$PGID, this will take about 10 seconds..."
    find . -name 'node_modules' -prune -o -mindepth 1 -maxdepth 1 -exec chown -R $PUID:$PGID {} +
    chown -R $PUID:$PGID /var/cache/nginx
    chown -R $PUID:$PGID /var/log/nginx
    chown -R $PUID:$PGID /var/lib/nginx
    chown -R $PUID:$PGID /run/nginx/nginx.pid
    chown -R $PUID:$PGID /etc/nginx
    echo "Changing owner to $PUID:$PGID, done."
fi

if [ "${PUID}" != "0" ]; then
    exec su-exec $PUID:$PGID "$@"
else
    exec "$@"
fi
