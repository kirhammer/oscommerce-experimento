<?php

use App\Http\Controllers\Api\CatalogController;
use Illuminate\Support\Facades\Route;

Route::get('/categories/{id}/products', [CatalogController::class, 'categoryProducts'])
    ->whereNumber('id');

Route::get('/products/{id}', [CatalogController::class, 'show'])
    ->whereNumber('id');

Route::get('/products/{id}/reviews', [CatalogController::class, 'reviews'])
    ->whereNumber('id');

Route::get('/currencies', [CatalogController::class, 'currencies']);
