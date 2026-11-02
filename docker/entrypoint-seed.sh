#!/bin/sh
set -e

# Run migrations and seeders in background to not block webserver startup (Vercel timeout)
(
    echo "==> [SIMONIK] Background database initialization started..."

    # Run database migrations
    if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
        echo "==> [SIMONIK] Running database migrations..."
        php artisan migrate --force || echo "==> [SIMONIK] Warning: migrate failed or database not ready."
    fi

    # Run all seeders
    if [ "${RUN_SEEDERS:-true}" = "true" ]; then
        echo "==> [SIMONIK] Running database seeders..."
        php artisan db:seed --force || echo "==> [SIMONIK] Warning: DatabaseSeeder failed or already seeded."
        php artisan db:seed --class=StarterSeeder --force || true
        php artisan db:seed --class=AdminSeeder --force || true
    fi

    echo "==> [SIMONIK] Background database preparation finished."
    chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache || true
) &
