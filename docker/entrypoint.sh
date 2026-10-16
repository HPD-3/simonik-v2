#!/bin/sh
set -e

# Map dynamic PORT from Vercel / Cloud Run / Railway to NGINX_HTTP_PORT
if [ -n "$PORT" ]; then
    export NGINX_HTTP_PORT="$PORT"
fi

rm -f /etc/nginx/site-opts.d/http.conf /etc/nginx/site-opts.d/https.conf /etc/nginx/nginx.conf 2>/dev/null || true

exec /usr/local/bin/docker-php-serversideup-entrypoint "$@"
