'use client';

import React, { useEffect, useState } from 'react';
import { initializePaddle, type Environments, type Paddle } from '@paddle/paddle-js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import { PricingTier, type Tier } from '@/constants/pricing-tier';
import { usePaddlePrices } from '@/hooks/usePaddlePrices';

interface PaddlePricingTableProps {
  country?: string;
  userEmail?: string;
}

export function PaddlePricingTable({
  country: initialCountry = 'OTHERS',
  userEmail,
}: PaddlePricingTableProps) {
  const [frequency, setFrequency] = useState<'month' | 'year'>('month');
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [activeCheckoutPriceId, setActiveCheckoutPriceId] = useState<string | null>(null);

  // Read environment variables
  const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENV;
  const paddleClientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

  // Initialize Paddle.js on mount
  useEffect(() => {
    // Fail loudly if environment or client token is missing
    if (!paddleEnv) {
      const msg = 'Configuration error: NEXT_PUBLIC_PADDLE_ENV is not defined. Paddle cannot initialize.';
      console.error(msg);
      setInitError(msg);
      return;
    }

    if (!paddleClientToken) {
      const msg = 'Configuration error: NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not defined. Paddle cannot initialize.';
      console.error(msg);
      setInitError(msg);
      return;
    }

    initializePaddle({
      token: paddleClientToken,
      environment: paddleEnv as Environments,
      eventCallback: (event) => {
        if (event.name === 'checkout.loaded') {
          setActiveCheckoutPriceId(null);
        } else if (event.name === 'checkout.closed') {
          setActiveCheckoutPriceId(null);
        } else if (event.name === 'checkout.completed') {
          setActiveCheckoutPriceId(null);
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const returnUrl = params.get('returnUrl') || params.get('from');
            if (returnUrl) {
              window.location.href = returnUrl;
            } else if (
              document.referrer &&
              document.referrer.includes(window.location.origin) &&
              !document.referrer.includes('/pricing')
            ) {
              window.location.href = document.referrer;
            } else {
              window.location.href = '/workspaces';
            }
          }
        } else if (event.name === 'checkout.error') {
          console.error('Paddle Checkout Error Event:', event);
          setActiveCheckoutPriceId(null);
        }
      },
    })
      .then((paddleInstance) => {
        if (paddleInstance) {
          setPaddle(paddleInstance);

          // If navigated to with a transaction ID (_ptxn), auto-open checkout overlay
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const ptxn = params.get('_ptxn') || params.get('transactionId');
            if (ptxn) {
              paddleInstance.Checkout.open({
                transactionId: ptxn,
                settings: {
                  displayMode: 'overlay',
                  variant: 'one-page',
                },
              });
            }
          }
        } else {
          setInitError('Failed to initialize Paddle client instance.');
        }
      })
      .catch((err) => {
        console.error('Failed to initialize Paddle:', err);
        setInitError(err?.message || 'Error initializing Paddle SDK.');
      });
  }, [paddleEnv, paddleClientToken]);

  // Query localized prices from Paddle
  const { prices, loading: pricesLoading, error: pricesError } = usePaddlePrices(
    paddle,
    initialCountry
  );

  const handleSubscribe = (tier: Tier) => {
    const priceId = tier.priceId[frequency];
    if (!priceId) {
      console.error(`Price ID not found for ${tier.name} (${frequency})`);
      return;
    }

    if (!paddle) {
      alert('Payment system is initializing. Please wait a moment.');
      return;
    }

    setActiveCheckoutPriceId(priceId);

    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const explicitReturnUrl = params?.get('returnUrl') || params?.get('from');

    const successRedirectUrl =
      explicitReturnUrl
        ? (explicitReturnUrl.startsWith('http') ? explicitReturnUrl : `${window.location.origin}${explicitReturnUrl}`)
        : typeof window !== 'undefined' &&
          document.referrer &&
          document.referrer.includes(window.location.origin) &&
          !document.referrer.includes('/pricing')
        ? document.referrer
        : typeof window !== 'undefined'
        ? `${window.location.origin}/workspaces`
        : '/workspaces';

    const checkoutOptions: any = {
      items: [
        {
          priceId,
          quantity: 1,
        },
      ],
      settings: {
        displayMode: 'overlay',
        variant: 'one-page',
        successUrl: successRedirectUrl,
      },
    };

    if (userEmail && typeof userEmail === 'string' && userEmail.trim() !== '') {
      checkoutOptions.customer = { email: userEmail.trim() };
    }

    paddle.Checkout.open(checkoutOptions);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Environment / Init Error Alert */}
      {initError && (
        <div className="mb-8 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
          <div className="text-sm font-medium">{initError}</div>
        </div>
      )}

      {/* Pricing Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <Badge
          variant="outline"
          className="mb-4 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700"
        >
          Paddle Sandbox • Localized Pricing
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
          Simple, Transparent Plans
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Scale your freelance business with automatic currency localization and revenue protection.
        </p>

        {/* Monthly / Yearly Toggle */}
        <div className="mt-8 inline-flex items-center p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 shadow-inner">
          <button
            type="button"
            onClick={() => setFrequency('month')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              frequency === 'month'
                ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Monthly billing
          </button>
          <button
            type="button"
            onClick={() => setFrequency('year')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              frequency === 'year'
                ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <span>Annual billing</span>
            <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold px-2 py-0.5 rounded-full">
              Save 2 Months
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {PricingTier.map((tier) => {
          const priceId = tier.priceId[frequency];
          const formattedTotal = prices[priceId];
          const isFeatured = tier.featured;
          const isCheckoutLoading = activeCheckoutPriceId === priceId;

          return (
            <div
              key={tier.id}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-200 ${
                isFeatured
                  ? 'bg-zinc-950 text-white border-2 border-zinc-800 shadow-2xl scale-[1.03] z-10'
                  : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Featured Badge */}
              {isFeatured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 text-xs font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-md flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 fill-zinc-950 text-zinc-950" />
                  {tier.badge || 'Most Popular'}
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">{tier.name}</h3>
                    <p
                      className={`text-xs mt-2 min-h-[32px] ${
                        isFeatured ? 'text-zinc-400' : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {tier.description}
                    </p>
                  </div>
                  {tier.badge && !isFeatured && (
                    <Badge
                      variant="secondary"
                      className="text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    >
                      {tier.badge}
                    </Badge>
                  )}
                </div>

                {/* Localized Price Display (No custom math or reformatting) */}
                <div className="mt-6 mb-6">
                  {pricesLoading || !formattedTotal ? (
                    <div className="flex items-baseline gap-2">
                      <div
                        className={`h-9 w-28 animate-pulse rounded-md ${
                          isFeatured ? 'bg-zinc-800' : 'bg-zinc-200 dark:bg-zinc-800'
                        }`}
                      />
                      <span
                        className={`text-xs font-medium ${
                          isFeatured ? 'text-zinc-500' : 'text-zinc-400'
                        }`}
                      >
                        / {frequency}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-extrabold tracking-tight">
                        {formattedTotal}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          isFeatured ? 'text-zinc-400' : 'text-zinc-500 dark:text-zinc-400'
                        }`}
                      >
                        / {frequency}
                      </span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div
                  className={`h-px w-full my-6 ${
                    isFeatured ? 'bg-zinc-800' : 'bg-zinc-100 dark:bg-zinc-800'
                  }`}
                />

                {/* Features List */}
                <div className="space-y-3.5">
                  <p
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isFeatured ? 'text-zinc-400' : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    Included Features
                  </p>
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <Check
                        className={`h-4 w-4 shrink-0 mt-0.5 ${
                          isFeatured ? 'text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      />
                      <span
                        className={
                          isFeatured ? 'text-zinc-300' : 'text-zinc-600 dark:text-zinc-300'
                        }
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action / Subscribe Button */}
              <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  onClick={() => handleSubscribe(tier)}
                  disabled={!paddle || isCheckoutLoading}
                  className={`w-full h-12 text-sm font-bold rounded-xl transition-all ${
                    isFeatured
                      ? 'bg-white text-zinc-950 hover:bg-zinc-100 shadow-md'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white shadow-sm'
                  }`}
                >
                  {isCheckoutLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Opening Checkout...</span>
                    </div>
                  ) : (
                    <span>Subscribe to {tier.name}</span>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-12 text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
        <p>
          Prices are automatically localized in your local currency via Paddle Merchant of Record.
        </p>
        <p>14-day free trial included on all subscription tiers.</p>
      </div>
    </div>
  );
}
