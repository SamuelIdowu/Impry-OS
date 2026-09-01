import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

// Reset all mocks between tests to ensure test isolation
beforeEach(() => {
  vi.clearAllMocks();
});

// Polyfill process.env defaults for test runs
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
