<?php

namespace App\Services;

use App\Models\Currency;
use App\Repositories\CurrencyRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

/**
 * Currency selection and conversion, mirroring the legacy currencies class:
 * prices are stored in the default currency and converted for display with
 * the per-currency exchange rate and formatting rules.
 */
class CurrencyService
{
    public function __construct(
        private readonly CurrencyRepositoryInterface $currencies,
    ) {
    }

    /** @return Collection<Currency> */
    public function list(): Collection
    {
        return $this->currencies->all();
    }

    /**
     * Resolves the requested currency code, falling back to the store
     * default. Unknown codes are a client error (422), matching the
     * validation style of the other listing parameters.
     */
    public function resolve(?string $code): Currency
    {
        $currency = $this->currencies->findByCode($code ?? config('catalog.default_currency'));

        if ($currency === null) {
            throw ValidationException::withMessages([
                'currency' => ['The selected currency is invalid.'],
            ]);
        }

        return $currency;
    }
}
