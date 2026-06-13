FROM php:7.4-apache

RUN apt-get update && apt-get install -y --no-install-recommends \
        libpng-dev \
        libjpeg-dev \
        libfreetype6-dev \
        libzip-dev \
        libcurl4-openssl-dev \
        unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" gd mysqli zip curl \
    && rm -rf /var/lib/apt/lists/*

RUN a2enmod rewrite

RUN { \
        echo 'date.timezone = UTC'; \
        echo 'short_open_tag = On'; \
        echo 'display_errors = On'; \
        echo 'error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT & ~E_NOTICE'; \
        echo 'upload_max_filesize = 32M'; \
        echo 'post_max_size = 32M'; \
        echo 'memory_limit = 256M'; \
    } > /usr/local/etc/php/conf.d/oscommerce.ini

RUN sed -ri 's!/var/www/html!/var/www/html/catalog!g' /etc/apache2/sites-available/000-default.conf /etc/apache2/apache2.conf

RUN { \
        echo '<Directory /var/www/html/catalog/>'; \
        echo '    AllowOverride All'; \
        echo '    Require all granted'; \
        echo '</Directory>'; \
    } > /etc/apache2/conf-available/oscommerce.conf \
    && a2enconf oscommerce

WORKDIR /var/www/html
