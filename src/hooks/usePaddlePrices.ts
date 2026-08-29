import {
  type Paddle,
  type PricePreviewParams,
  type PricePreviewResponse,
} from '@paddle/paddle-js';
import { useEffect, useState } from 'react';
import { PricingTier } from '@/constants/pricing-tier';

export type PaddlePrices = Record<string, string>;

function getLineItems(): PricePreviewParams['items'] {
  return PricingTier.flatMap((tier) =>
    [tier.priceId.month, tier.priceId.year]
      .filter((id): id is string => Boolean(id))
      .map((priceId) => ({
        priceId,
        quantity: 1,
      }))
  );
}

function getPriceAmounts(prices: PricePreviewResponse): PaddlePrices {
  const lineItems = prices?.data?.details?.lineItems || [];
  return lineItems.reduce<PaddlePrices>((acc, item) => {
    if (item?.price?.id && item?.formattedTotals?.total) {
      acc[item.price.id] = item.formattedTotals.total;
    }
    return acc;
  }, {});
}

export function usePaddlePrices(
  paddle: Paddle | null | undefined,
  country?: string
): { prices: PaddlePrices; loading: boolean; error: string | null } {
  const [prices, setPrices] = useState<PaddlePrices>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paddle) return;

    // If country is provided and not the sentinel "OTHERS", pass address.countryCode.
    // If country is missing or "OTHERS", do NOT pass countryCode so Paddle auto-detects from IP.
    const isExplicitCountry =
      Boolean(country) &&
      country !== 'OTHERS' &&
      country?.trim() !== '';

    const params: Partial<PricePreviewParams> = {
      items: getLineItems(),
      ...(isExplicitCountry && country
        ? { address: { countryCode: country.trim().toUpperCase() } }
        : {}),
    };

    setLoading(true);
    setError(null);

    paddle
      .PricePreview(params as PricePreviewParams)
      .then((response) => {
        setPrices((prev) => ({ ...prev, ...getPriceAmounts(response) }));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Paddle.PricePreview error:', err);
        setError(err?.message || 'Failed to fetch regional pricing.');
        setLoading(false);
      });
  }, [country, paddle]);

  return { prices, loading, error };
}
