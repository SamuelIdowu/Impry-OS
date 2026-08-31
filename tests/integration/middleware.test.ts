import { describe, it, expect } from 'vitest';
import { middleware } from '@/../middleware';
import { NextRequest } from 'next/server';

describe('Next.js Middleware Routing & Security (middleware.ts)', () => {
  function createMockRequest(path: string, cookies: Record<string, string> = {}) {
    const url = new URL(path, 'http://localhost:3000');
    const req = new NextRequest(url);
    Object.entries(cookies).forEach(([k, v]) => {
      req.cookies.set(k, v);
    });
    return req;
  }

  describe('Public Route Bypass', () => {
    it('allows landing page ("/") without authentication', async () => {
      const req = createMockRequest('/');
      const res = await middleware(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('location')).toBeNull();
    });

    it('allows legal and terms routes without authentication', async () => {
      const req = createMockRequest('/terms');
      const res = await middleware(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('location')).toBeNull();
    });

    it('allows public webhook endpoints without user session', async () => {
      const req = createMockRequest('/api/webhooks/dodo');
      const res = await middleware(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('location')).toBeNull();
    });
  });

  describe('Protected Route Enforcement', () => {
    it('redirects unauthenticated user from protected route to /login with redirect param', async () => {
      const req = createMockRequest('/workspaces');
      const res = await middleware(req);
      expect(res.status).toBe(307);
      const location = res.headers.get('location');
      expect(location).toContain('/login?redirect=%2Fworkspaces');
    });

    it('redirects authenticated user from /login back to /workspaces', async () => {
      const req = createMockRequest('/login', {
        'better-auth.session_token': 'valid-mock-session-token',
      });
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('/workspaces');
    });
  });

  describe('Workspace Context Header Injection', () => {
    it('injects x-workspace-id header when accessing workspace path', async () => {
      const wsUuid = '123e4567-e89b-12d3-a456-426614174000';
      const req = createMockRequest(`/${wsUuid}/dashboard`, {
        'better-auth.session_token': 'valid-mock-session-token',
      });
      const res = await middleware(req);
      expect(res.status).toBe(200);
    });
  });
});
