<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Catalog defaults
    |--------------------------------------------------------------------------
    |
    | language_id selects which row of the *_description tables is exposed by
    | the API (the legacy schema stores one row per language, 1 = English).
    |
    | page_size mirrors the legacy MAX_DISPLAY_SEARCH_RESULTS configuration so
    | paginated listings match the legacy page size.
    |
    */

    'language_id' => (int) env('CATALOG_LANGUAGE_ID', 1),

    'page_size' => (int) env('CATALOG_PAGE_SIZE', 20),

    // Prices are stored in this currency; other currencies convert from it
    // using the exchange rate in the legacy `currencies` table.
    'default_currency' => env('CATALOG_DEFAULT_CURRENCY', 'USD'),

];
