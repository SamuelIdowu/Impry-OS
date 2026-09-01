import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withAuth } from '@/lib/auth-guard';

vi.mock('@/lib/auth', () => ({
  getUser: vi.fn(),
}));

vi.mock('@/lib/workspace', () => ({
  getCurrentWorkspaceId: vi.fn(),
}));

import { getUser } from '@/lib/auth';
import { getCurrentWorkspaceId } from '@/lib/workspace';

describe('Auth Guard HOF (withAuth)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws "Not authenticated" when user is not logged in', async () => {
    (getUser as any).mockResolvedValueOnce(null);

    const action = vi.fn();
    await expect(withAuth(action)).rejects.toThrow('Not authenticated');
    expect(action).not.toHaveBeenCalled();
  });

  it('throws "Workspace context required" when no workspace ID is provided or in context', async () => {
    (getUser as any).mockResolvedValueOnce({ id: 'u-1', email: 'user@test.com' });
    (getCurrentWorkspaceId as any).mockResolvedValueOnce(null);

    const action = vi.fn();
    await expect(withAuth(action)).rejects.toThrow('Workspace context required');
    expect(action).not.toHaveBeenCalled();
  });

  it('executes wrapped action with user and context workspace ID when authenticated', async () => {
    const mockUser = { id: 'u-100', email: 'owner@startup.io' };
    (getUser as any).mockResolvedValueOnce(mockUser);
    (getCurrentWorkspaceId as any).mockResolvedValueOnce('ws-999');

    const action = vi.fn().mockResolvedValueOnce({ success: true, data: 'secure-data' });
    const result = await withAuth(action);

    expect(action).toHaveBeenCalledWith(mockUser, 'ws-999');
    expect(result).toEqual({ success: true, data: 'secure-data' });
  });

  it('uses explicitly provided workspace ID override when passed', async () => {
    const mockUser = { id: 'u-100', email: 'owner@startup.io' };
    (getUser as any).mockResolvedValueOnce(mockUser);

    const action = vi.fn().mockResolvedValueOnce({ success: true });
    const result = await withAuth(action, 'ws-explicit-override');

    expect(action).toHaveBeenCalledWith(mockUser, 'ws-explicit-override');
    expect(result).toEqual({ success: true });
    expect(getCurrentWorkspaceId).not.toHaveBeenCalled();
  });
});
