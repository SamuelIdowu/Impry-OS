import {
  Environment,
  LogLevel,
  Paddle,
  type PaddleOptions,
} from '@paddle/paddle-node-sdk';

let paddleInstance: Paddle | null = null;

export function getPaddleInstance(): Paddle {
  const apiKey =
    process.env.PADDLE_API_KEY ||
    process.env.PADDLE_SANDBOX_API_KEY;

  if (!apiKey) {
    throw new Error('PADDLE_API_KEY is not configured in environment variables.');
  }

  const isProduction =
    process.env.NEXT_PUBLIC_PADDLE_ENV === 'production' ||
    process.env.PADDLE_ENV === 'production' ||
    process.env.PADDLE_ENVIRONMENT === 'production';

  const options: PaddleOptions = {
    environment: isProduction ? Environment.production : Environment.sandbox,
    logLevel: LogLevel.error,
  };

  if (!paddleInstance) {
    paddleInstance = new Paddle(apiKey, options);
  }

  return paddleInstance;
}
