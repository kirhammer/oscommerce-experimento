<?php

namespace App\Support;

/** Validated listing options for catalog queries (sorting and filtering). */
readonly class ListOptions
{
    public function __construct(
        public string $sort = 'name',
        public string $order = 'asc',
        public ?int $manufacturerId = null,
    ) {
    }
}
