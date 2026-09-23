import { describe, it, expect, beforeEach } from 'vitest';
import { securityShield } from '../services/securityShield';

describe('SecurityShield Service', () => {
  beforeEach(() => {
    // Reset rate limit buckets between tests
    securityShield._rateLimitBuckets = {};
  });

  describe('Sanitization & Anti-XSS', () => {
    it('should strip malicious script tags', () => {
      const malicious = '<script>alert("xss")</script>Hello World';
      const clean = securityShield.sanitizeString(malicious);
      expect(clean).toBe('Hello World');
    });

    it('should strip dangerous event handlers like onclick and onload', () => {
      const payload = '<img src="x" onerror="stealCookies()" />';
      const clean = securityShield.sanitizeString(payload);
      expect(clean).not.toContain('onerror=');
      expect(clean).toContain('no_handler=');
    });

    it('should strip javascript: pseudo-protocols', () => {
      const link = 'javascript:evilFunction()';
      const clean = securityShield.sanitizeString(link);
      expect(clean).toBe('evilFunction()');
    });

    it('should protect against prototype pollution in objects', () => {
      const poisoned = JSON.parse('{"__proto__": {"admin": true}, "name": "Operador", "safe": 123}');
      const sanitized = securityShield.sanitizeObject(poisoned);
      expect(sanitized.__proto__).not.toHaveProperty('admin');
      expect(sanitized.name).toBe('Operador');
      expect(sanitized.safe).toBe(123);
    });

    it('should truncate strings exceeding maxLength', () => {
      const longStr = 'A'.repeat(3000);
      const clean = securityShield.sanitizeString(longStr, 100);
      expect(clean.length).toBe(100);
    });
  });

  describe('Cryptographic Seal & Tamper Verification', () => {
    it('should generate a valid SHA-256 seal for a record', async () => {
      const record = {
        instrumentoId: 'PZ-01',
        cotaAgua: 842.5,
        operador: 'Carlos Mendes'
      };
      const sealed = await securityShield.generateIntegritySeal(record);
      expect(sealed.sealHash).toBeDefined();
      expect(typeof sealed.sealHash).toBe('string');
      expect(sealed.sealHash.length).toBeGreaterThan(0);
      expect(sealed.sealAlgorithm).toBe('SHA-256/MDSYNC-SHIELD-V2');
    });

    it('should verify an authentic record as verified=true', async () => {
      const record = {
        instrumentoId: 'NA-02',
        nivel: 12.4,
        data: '2026-09-23T10:00:00Z'
      };
      const sealed = await securityShield.generateIntegritySeal(record);
      const result = await securityShield.verifyIntegrity(sealed);
      expect(result.verified).toBe(true);
      expect(result.reason).toContain('100% comprovada');
    });

    it('should detect unauthorized tampering and fail verification', async () => {
      const record = {
        instrumentoId: 'PZ-04',
        cotaAgua: 850.0
      };
      const sealed = await securityShield.generateIntegritySeal(record);
      // Malicious modification of water level
      sealed.cotaAgua = 899.9;
      const result = await securityShield.verifyIntegrity(sealed);
      expect(result.verified).toBe(false);
      expect(result.reason).toContain('Alerta: Alteração não autorizada');
    });

    it('should reject unsealed records', async () => {
      const rawRecord = { instrumentoId: 'PZ-05', cotaAgua: 820.0 };
      const result = await securityShield.verifyIntegrity(rawRecord);
      expect(result.verified).toBe(false);
      expect(result.reason).toContain('sem selo');
    });
  });

  describe('Rate Limiter', () => {
    it('should allow calls under max threshold', () => {
      const key = 'test_action';
      for (let i = 0; i < 5; i++) {
        expect(securityShield.checkRateLimit(key, 10, 5000)).toBe(true);
      }
    });

    it('should block calls exceeding max threshold', () => {
      const key = 'rapid_fire';
      for (let i = 0; i < 3; i++) {
        expect(securityShield.checkRateLimit(key, 3, 5000)).toBe(true);
      }
      // 4th call should be blocked
      expect(securityShield.checkRateLimit(key, 3, 5000)).toBe(false);
    });
  });

  describe('RBAC Permissions', () => {
    it('should give Administrator wildcard permissions', () => {
      expect(securityShield.hasPermission('Administrador', 'ANY_PRIVILEGE')).toBe(true);
      expect(securityShield.hasPermission('Administrador', 'OVERRIDE_LIMITS')).toBe(true);
    });

    it('should allow Field Techs to capture readings but not override limits', () => {
      expect(securityShield.hasPermission('Técnico de Campo', 'CAPTURE_READING')).toBe(true);
      expect(securityShield.hasPermission('Técnico de Campo', 'OVERRIDE_LIMITS')).toBe(false);
    });

    it('should allow Geotechnical Engineers to override limits and audit data', () => {
      expect(securityShield.hasPermission('Engenheiro Geotécnico', 'OVERRIDE_LIMITS')).toBe(true);
      expect(securityShield.hasPermission('Engenheiro Geotécnico', 'AUDIT_DATA')).toBe(true);
    });
  });
});
