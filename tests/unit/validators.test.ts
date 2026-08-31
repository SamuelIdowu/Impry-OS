import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  loginSchema,
  registerSchema,
  updatePasswordSchema,
} from '@/lib/validators/auth';

describe('Auth Validation Schemas (validators/auth.ts)', () => {
  describe('emailSchema', () => {
    it('accepts valid email addresses', () => {
      expect(emailSchema.safeParse('user@example.com').success).toBe(true);
      expect(emailSchema.safeParse('test.dev+123@domain.co.uk').success).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(emailSchema.safeParse('').success).toBe(false);
      expect(emailSchema.safeParse('not-an-email').success).toBe(false);
      expect(emailSchema.safeParse('@nodomain.com').success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('accepts passwords >= 8 chars', () => {
      expect(passwordSchema.safeParse('securePassword123!').success).toBe(true);
    });

    it('rejects passwords < 8 chars', () => {
      expect(passwordSchema.safeParse('short').success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('validates correct login credentials', () => {
      const valid = loginSchema.safeParse({
        email: 'founder@startup.com',
        password: 'validpassword123',
      });
      expect(valid.success).toBe(true);
    });

    it('fails when email is invalid', () => {
      const invalid = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'validpassword123',
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('validates complete registration payload when terms are agreed', () => {
      const valid = registerSchema.safeParse({
        name: 'Samuel Dev',
        email: 'samuel@impry.io',
        password: 'superSecretPassword1',
        agreeToTerms: true,
      });
      expect(valid.success).toBe(true);
    });

    it('rejects registration if agreeToTerms is false', () => {
      const invalid = registerSchema.safeParse({
        name: 'Samuel Dev',
        email: 'samuel@impry.io',
        password: 'superSecretPassword1',
        agreeToTerms: false,
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe('updatePasswordSchema', () => {
    it('rejects when new password matches current password', () => {
      const result = updatePasswordSchema.safeParse({
        currentPassword: 'samePassword123',
        newPassword: 'samePassword123',
        confirmPassword: 'samePassword123',
      });
      expect(result.success).toBe(false);
    });

    it('rejects when confirmPassword does not match newPassword', () => {
      const result = updatePasswordSchema.safeParse({
        currentPassword: 'currentPassword123',
        newPassword: 'newPassword12345',
        confirmPassword: 'differentPassword99',
      });
      expect(result.success).toBe(false);
    });

    it('accepts valid password change with matching confirmPassword', () => {
      const result = updatePasswordSchema.safeParse({
        currentPassword: 'oldPassword1234',
        newPassword: 'newBrandSecret99',
        confirmPassword: 'newBrandSecret99',
      });
      expect(result.success).toBe(true);
    });
  });
});
