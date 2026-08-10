import { PaymentProvider } from './types';
import { DodoPaymentsProvider } from './providers/dodo';
import { PolarPaymentsProvider } from './providers/polar';
import { PaystackPaymentProvider } from './providers/paystack';
import { MockPaymentProvider } from './providers/mock';

export * from './types';
export * from './config';

// Singleton cache for provider instances
const providers: Partial<Record<string, PaymentProvider>> = {};

/**
 * Returns the configured active PaymentProvider based on process.env.PAYMENT_PROVIDER.
 * Auto-detects keys: 'paystack' -> 'dodo' -> 'polar' -> 'mock'.
 */
export function getPaymentProvider(providerOverride?: string): PaymentProvider {
  const providerName = (
    providerOverride ||
    process.env.PAYMENT_PROVIDER ||
    (process.env.PAYSTACK_SECRET_KEY
      ? 'paystack'
      : process.env.DODO_PAYMENTS_API_KEY
      ? 'dodo'
      : 'mock')
  ).toLowerCase();

  if (providers[providerName]) {
    return providers[providerName]!;
  }

  let provider: PaymentProvider;

  switch (providerName) {
    case 'paystack':
      provider = new PaystackPaymentProvider();
      break;
    case 'dodo':
    case 'dodopayments':
      provider = new DodoPaymentsProvider();
      break;
    case 'polar':
    case 'polar.sh':
      provider = new PolarPaymentsProvider();
      break;
    case 'mock':
    default:
      provider = new MockPaymentProvider();
      break;
  }

  providers[providerName] = provider;
  return provider;
}
