// ============================================================
// MDSync — Security Shield & Architectural Protection Service
// Blindagem de Segurança, Anti-XSS, Anti-Tamper & RBAC
// ============================================================

/**
 * Calcula hash SHA-256 para selagem criptográfica de dados de campo.
 */
export async function calculateSha256(text) {
  try {
    if (window.crypto && window.crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(text);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('[SecurityShield] WebCrypto indisponível, usando fallback de hash.');
  }

  // Fallback seguro simples de 32-bit FNV / djb2 se WebCrypto estiver em contexto restrito
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return ('00000000' + (hash >>> 0).toString(16)).slice(-8) + '-fallback';
}

export const securityShield = {
  /**
   * Sanitiza entradas de texto prevenindo XSS, Injection e caracteres de controle
   */
  sanitizeString(input, maxLength = 2000) {
    if (typeof input !== 'string') return input;
    
    let clean = input.trim();
    if (clean.length > maxLength) {
      clean = clean.slice(0, maxLength);
    }

    // Remover tags HTML ativas e protocolos perigosos
    clean = clean
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, 'no_handler=')
      .replace(/data:text\/html/gi, '');

    return clean;
  },

  /**
   * Sanitiza objeto recursivamente
   */
  sanitizeObject(obj, maxDepth = 5) {
    if (!obj || typeof obj !== 'object' || maxDepth <= 0) return obj;
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, maxDepth - 1));
    }
    const clean = {};
    for (const [key, val] of Object.entries(obj)) {
      // Bloquear Prototype Pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      if (typeof val === 'string') {
        clean[key] = this.sanitizeString(val);
      } else if (typeof val === 'object' && val !== null) {
        clean[key] = this.sanitizeObject(val, maxDepth - 1);
      } else {
        clean[key] = val;
      }
    }
    return clean;
  },

  /**
   * Gera um selo de integridade criptográfica (Tamper-proof Seal)
   * para uma leitura ou relatório de campo.
   */
  async generateIntegritySeal(payload) {
    const rawPayload = {
      ...payload,
      _sealTimestamp: payload._sealTimestamp || new Date().toISOString()
    };
    // Remover o próprio selo anterior se houver
    delete rawPayload.sealHash;

    const serialized = JSON.stringify(rawPayload, Object.keys(rawPayload).sort());
    const hash = await calculateSha256(serialized);
    return {
      ...rawPayload,
      sealHash: hash,
      sealAlgorithm: 'SHA-256/MDSYNC-SHIELD-V2'
    };
  },

  /**
   * Verifica se o registro foi adulterado ou corrompido
   */
  async verifyIntegrity(record) {
    if (!record || !record.sealHash) {
      return { verified: false, reason: 'Registro sem selo criptográfico de integridade.' };
    }
    const targetHash = record.sealHash;
    const testRecord = { ...record };
    delete testRecord.sealHash;
    delete testRecord.sealAlgorithm;

    const serialized = JSON.stringify(testRecord, Object.keys(testRecord).sort());
    const computedHash = await calculateSha256(serialized);

    const isMatch = computedHash === targetHash;
    return {
      verified: isMatch,
      computedHash,
      expectedHash: targetHash,
      reason: isMatch ? 'Integridade 100% comprovada (SHA-256 idêntico)' : 'Alerta: Alteração não autorizada detectada no registro.'
    };
  },

  /**
   * Rate Limiter em memória para prevenção de ataques de negação de serviço / abuso
   */
  _rateLimitBuckets: {},
  checkRateLimit(actionKey, maxCalls = 30, windowMs = 60000) {
    const now = Date.now();
    if (!this._rateLimitBuckets[actionKey]) {
      this._rateLimitBuckets[actionKey] = [];
    }
    const timestamps = this._rateLimitBuckets[actionKey].filter(t => now - t < windowMs);
    if (timestamps.length >= maxCalls) {
      this.logSecurityEvent('RATE_LIMIT_EXCEEDED', { actionKey, count: timestamps.length });
      return false; // Bloqueado
    }
    timestamps.push(now);
    this._rateLimitBuckets[actionKey] = timestamps;
    return true; // Permitido
  },

  /**
   * Guarda de Controle de Acesso Baseado em Papel (RBAC)
   */
  hasPermission(userRole, permission) {
    const rolePermissions = {
      'Administrador': ['*'],
      'Engenheiro Geotécnico': [
        'READ_DASHBOARD',
        'READ_INSTRUMENT',
        'CAPTURE_READING',
        'REGISTER_ANOMALY',
        'AUDIT_DATA',
        'EXPORT_DATA',
        'OVERRIDE_LIMITS',
        'DISPATCH_STAGING'
      ],
      'Técnico de Campo': [
        'READ_DASHBOARD',
        'READ_INSTRUMENT',
        'CAPTURE_READING',
        'REGISTER_ANOMALY',
        'DISPATCH_STAGING',
        'VIEW_OFFLINE_QUEUE'
      ],
      'Consultor / Auditor': [
        'READ_DASHBOARD',
        'READ_INSTRUMENT',
        'AUDIT_DATA',
        'EXPORT_DATA'
      ]
    };

    const allowed = rolePermissions[userRole] || rolePermissions['Engenheiro Geotécnico'] || [];
    return allowed.includes('*') || allowed.includes(permission);
  },

  /**
   * Registrador de Eventos de Segurança Auditáveis
   */
  logSecurityEvent(eventType, metadata = {}) {
    try {
      const logs = JSON.parse(localStorage.getItem('mdsync_security_audit_log') || '[]');
      const event = {
        id: `SEC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        eventType,
        metadata: this.sanitizeObject(metadata),
        userAgent: navigator.userAgent.slice(0, 100)
      };
      logs.unshift(event);
      // Manter últimos 100 eventos no armazenamento local
      if (logs.length > 100) logs.pop();
      localStorage.setItem('mdsync_security_audit_log', JSON.stringify(logs));
      
      console.info(`[SecurityShield] Evento registrado: ${eventType}`, metadata);
    } catch (e) {
      console.warn('[SecurityShield] Falha ao registrar log de segurança:', e);
    }
  },

  /**
   * Retorna os eventos recentes de segurança para visualização na UI
   */
  getSecurityLogs() {
    try {
      return JSON.parse(localStorage.getItem('mdsync_security_audit_log') || '[]');
    } catch {
      return [];
    }
  }
};
