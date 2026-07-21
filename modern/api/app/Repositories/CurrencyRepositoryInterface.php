<?php

namespace App\Repositories;

use App\Models\Currency;
use Illuminate\Support\Collection;

/** Data-access boundary for store currencies. */
interface CurrencyRepositoryInterface
{
    /** @return Collection<Currency> all configured currencies */
    public function all(): Collection;

    public function findByCode(string $code): ?Currency;
}
