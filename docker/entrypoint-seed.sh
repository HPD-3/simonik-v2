#!/bin/sh
set -e

echo "==> [SIMONIK] Initializing application startup..."

# Run database migrations
if [ "${AUTORUN_LARAVEL_MIGRATION:-true}" = "true" ]; then
    echo "==> [SIMONIK] Running database migrations..."
    php artisan migrate --force || echo "==> [SIMONIK] Warning: migrate failed or database not ready."
fi

# Run all seeders
if [ "${AUTORUN_LARAVEL_SEED:-true}" = "true" ]; then
    echo "==> [SIMONIK] Running all database seeders..."
    php artisan db:seed --force || echo "==> [SIMONIK] Warning: DatabaseSeeder failed or already seeded."
    php artisan db:seed --class=StarterSeeder --force || true
    php artisan db:seed --class=AdminSeeder --force || true
fi

echo "==> [SIMONIK] Database preparation finished."
