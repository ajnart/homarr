#!/bin/sh
# vim:sw=4:ts=4:et

set -e
echo "Entering entrypoint..."

echo "Param \$1: $1"
echo "User: "$(whoami)


entrypoint_log() {
    if [ -z "${NGINX_ENTRYPOINT_QUIET_LOGS:-}" ]; then
        echo "$@"
    fi
}

if /usr/bin/find "/docker-entrypoint.d/" -mindepth 1 -maxdepth 1 -type f -print -quit 2>/dev/null | read v; then
	entrypoint_log "$0: /docker-entrypoint.d/ is not empty, will attempt to perform configuration"

	entrypoint_log "$0: Looking for shell scripts in /docker-entrypoint.d/"
	find "/docker-entrypoint.d/" -follow -type f -print | sort -V | while read -r f; do
		case "$f" in
			*.envsh)
				if [ -x "$f" ]; then
					entrypoint_log "$0: Sourcing $f";
					. "$f"
				else
					# warn on shell scripts without exec bit
					entrypoint_log "$0: Ignoring $f, not executable";
				fi
				;;
			*.sh)
				if [ -x "$f" ]; then
					entrypoint_log "$0: Launching $f";
					"$f"
				else
					# warn on shell scripts without exec bit
					entrypoint_log "$0: Ignoring $f, not executable";
				fi
				;;
			*) entrypoint_log "$0: Ignoring $f";;
		esac
	done

	entrypoint_log "$0: Configuration complete; ready for start up"
else
	entrypoint_log "$0: No files found in /docker-entrypoint.d/, skipping configuration"
fi

#exec "$@"

# sys container init:
#
# If no command is passed to the container, supervisord becomes init and
# starts all its configured programs (per /etc/supervisord.conf).
#
# If a command is passed to the container, it runs in the foreground;
# supervisord runs in the background and starts all its configured
# programs.
#
# In either case, supervisord always starts its configured programs.

if [ "$#" -eq 0 ] || [ "${1#-}" != "$1" ]; then
    exec supervisord -n "$@"
else
    supervisord -c /etc/supervisord.conf &
    exec "$@"
fi