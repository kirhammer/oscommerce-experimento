FROM php:8.2-fpm-alpine

RUN docker-php-ext-install pdo_mysql

WORKDIR /var/www/html

# The application code (including vendor/ and .env) is bind-mounted by
# docker-compose; the image only provides the PHP 8.2 runtime.
