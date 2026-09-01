import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * k6 Load Testing Script for Impry OS
 *
 * Scenarios:
 * - Ramp up to 50 concurrent virtual users (VUs)
 * - Measure P95 latency (target < 500ms)
 * - Measure error rate (target < 1%)
 */
export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 VUs
    { duration: '1m', target: 50 },  // Stay at 50 VUs
    { duration: '30s', target: 0 },  // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],    // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';

export default function () {
  // 1. Test public landing page
  const homeRes = http.get(`${BASE_URL}/`);
  check(homeRes, {
    'landing page status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // 2. Test compliance & legal endpoints
  const termsRes = http.get(`${BASE_URL}/terms`);
  check(termsRes, {
    'terms page status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // 3. Test unauthenticated redirect on protected route
  const wsRes = http.get(`${BASE_URL}/workspaces`, {
    redirects: 0,
  });
  check(wsRes, {
    'protected route redirects to login': (r) => r.status === 307 || r.status === 302,
  });

  sleep(1);
}
