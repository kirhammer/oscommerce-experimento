<?php

namespace App\Http\Resources;

use App\Models\ProductAttribute;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

/**
 * Detail representation: the listing fields plus everything the legacy
 * product page displays (description, gallery, options with price
 * adjustments, availability date, review count).
 */
class ProductDetailResource extends ProductResource
{
    public function toArray(Request $request): array
    {
        $currency = $request->attributes->get('catalog_currency');

        $money = fn (float $amount): float => $currency !== null
            ? $currency->convert($amount)
            : round($amount, 2);

        return array_merge(parent::toArray($request), [
            'description' => $this->description?->products_description,
            'url' => $this->description?->products_url,
            'date_added' => $this->products_date_added,
            'date_available' => $this->products_date_available,
            'images' => $this->images->map(fn ($image) => [
                'image' => $image->image,
                'html_content' => $image->htmlcontent,
                'sort_order' => (int) $image->sort_order,
            ])->values(),
            'options' => $this->groupedOptions($money),
            'reviews_count' => (int) $this->reviews_count,
            'reviews_avg_rating' => $this->reviews_avg_reviews_rating !== null
                ? round((float) $this->reviews_avg_reviews_rating, 1)
                : null,
        ]);
    }

    /** Groups attribute rows by option, as the legacy dropdowns do. */
    private function groupedOptions(callable $money): Collection
    {
        return $this->productAttributes
            ->groupBy('options_id')
            ->map(function (Collection $attributes, int $optionId) use ($money) {
                /** @var ProductAttribute $first */
                $first = $attributes->first();

                return [
                    'id' => $optionId,
                    'name' => $first->option?->products_options_name,
                    'values' => $attributes->map(fn (ProductAttribute $attribute) => [
                        'id' => $attribute->options_values_id,
                        'name' => $attribute->value?->products_options_values_name,
                        'price_adjustment' => $money((float) $attribute->options_values_price),
                        'price_prefix' => $attribute->price_prefix,
                    ])->values(),
                ];
            })
            ->values();
    }
}
