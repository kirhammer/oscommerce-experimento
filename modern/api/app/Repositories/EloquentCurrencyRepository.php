<?php

namespace App\Repositories;

use App\Models\Currency;
use Illuminate\Support\Collection;

class EloquentCurrencyRepository implements CurrencyRepositoryInterface
{
    public function all(): Collection
    {
        return Currency::query()->orderBy('currencies_id')->get();
    }

    public function findByCode(string $code): ?Currency
    {
        return Currency::query()->where('code', strtoupper($code))->first();
    }
}
