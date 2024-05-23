#!/bin/sh

HOMARR_USER_PATHS="/app/data /app/public/icons"

for path in $HOMARR_USER_PATHS
do
	if [ ! -d "$path" ]; then
		mkdir -p $path
	fi

	find $path ! -user $PUID -print0 | while read -d $'\0' FILE
	do
		echo "${FILE} is not own by current user, fixing..." 
		chown $PUID:$PGID ${FILE}
	done
done

echo Setting homarr UID to $PUID and GID to $PGID please wait...
usermod -u $PUID homarr
groupmod -g $PGID homarr

DOCKER_GID=$(stat -c %g /var/run/docker.sock 2>/dev/null)
if [[ $? -eq 0 ]]; then
	echo "SETTING DOCKER GID TO ${DOCKER_GID}"
	groupmod -g $DOCKER_GID docker
fi