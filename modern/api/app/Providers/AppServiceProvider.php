<?php

namespace App\Providers;

use App\Repositories\CurrencyRepositoryInterface;
use App\Repositories\EloquentCurrencyRepository;
use App\Repositories\EloquentProductRepository;
use App\Repositories\ProductRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(ProductRepositoryInterface::class, EloquentProductRepository::class);
        $this->app->bind(CurrencyRepositoryInterface::class, EloquentCurrencyRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
