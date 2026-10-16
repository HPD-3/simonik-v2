#!/bin/sh
set -e

# Map dynamic PORT from Vercel / Cloud Run / Railway to NGINX_HTTP_PORT
if [ -n "$PORT" ]; then
    export NGINX_HTTP_PORT="$PORT"
fi

exec /usr/local/bin/docker-php-serversideup-entrypoint "$@"
