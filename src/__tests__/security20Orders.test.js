// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateSha256,
  apiKeysManager,
  gitSecretsAudit,
  publicKeyDb,
  rlsGuard,
  cryptoGuard,
  serverAuthGuard,
  rbacGuard,
  massAssignmentGuard,
  cookieGuard,
  passwordGuard,
  rateLimiter,
  botGuard,
  parameterizedQuery,
  inputValidator,
  dataLeakGuard,
  uploadGuard,
  apiTrimGuard,
  securityHeadersGuard,
  httpsEnforcer,
  dependencyAuditGuard,
  securityShield
} from '../services/securityShield';

describe('MDSync Security Engine — Verificação Completa das 20 Ordens de Segurança', () => {
  beforeEach(() => {
    rateLimiter.buckets = {};
    rateLimiter.lockouts = {};
  });

  // --------------------------------------------------------------------------
  // ORDEM 1: Esconder API Keys
  // --------------------------------------------------------------------------
  describe('Ordem 1 - Esconder API Keys', () => {
    it('deve mascarar chaves de API preservando apenas início e fim', () => {
      const key = 'AIzaSyBNm982348927492837492834';
      const masked = apiKeysManager.maskKey(key);
      expect(masked).toBe('AIza...2834');
      expect(apiKeysManager.maskKey('curta')).toBe('********');
    });

    it('deve detectar e ocultar chaves de API expostas em strings/logs', () => {
      const text = 'Log de depuração com chave AIzaSyBNm982348927492837492834789547 e sk-123456789012345678901234';
      const result = apiKeysManager.detectExposedKeys(text);
      expect(result.hasExposedKey).toBe(true);
      expect(result.redactedText).not.toContain('AIzaSyBNm982348927492837492834789547');
      expect(result.redactedText).toContain('[REDACTED_API_KEY]');
    });
  });

  // --------------------------------------------------------------------------
  // ORDEM 2: Limpar secrets do git
  // --------------------------------------------------------------------------
  describe('Ordem 2 - Limpar secrets do git', () => {
    it('deve identificar extensões e nomes de arquivos confidenciais proibidos no git', () => {
      expect(gitSecretsAudit.isSecretPath('.env')).toBe(true);
      expect(gitSecretsAudit.isSecretPath('.env.local')).toBe(true);
      expect(gitSecretsAudit.isSecretPath('certs/server.key')).toBe(true);
      expect(gitSecretsAudit.isSecretPath('keys/id_rsa')).toBe(true);
      expect(gitSecretsAudit.isSecretPath('service-account.json')).toBe(true);
      expect(gitSecretsAudit.isSecretPath('src/App.jsx')).toBe(false);
      expect(gitSecretsAudit.isSecretPath('package.json')).toBe(false);
    });

    it('deve auditar listas de arquivos e apontar violações', () => {
      const files = ['src/main.jsx', '.env', 'public/logo.png', 'secret.key'];
      const audit = gitSecretsAudit.auditPathList(files);
      expect(audit.compliant).toBe(false);
      expect(audit.violations).toEqual(['.env', 'secret.key']);
    });
  });

  // --------------------------------------------------------------------------
  // ORDEM 3: Public Key DB
  // --------------------------------------------------------------------------
  describe('Ordem 3 - Public Key DB', () => {
    it('deve gerar par de chaves e assinar/verificar registro com integridade', async () => {
      const keyPair = await publicKeyDb.generateKeyPair();
      expect(keyPair).toBeDefined();

      const record = { id: 'PZ-01', cota: 820.5, timestamp: '2026-10-31T20:00:00Z' };
      const signed = await publicKeyDb.signRecord(record, keyPair);

      expect(signed._publicKeySig).toBeDefined();
      const verify = await publicKeyDb.verifyRecordSignature(signed);
      expect(verify.valid).toBe(true);

      // Alteração maliciosa deve invalidar assinatura
      const tampered = { ...signed, cota: 999.9 };
      const verifyTampered = await publicKeyDb.verifyRecordSignature(tampered);
      expect(verifyTampered.valid).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // ORDEM 4: Ativar RLS (Row Level Security)
  // --------------------------------------------------------------------------
  describe('Ordem 4 - Ativar RLS', () => {
    it('deve isolar registros por tenant/empresa e estrutura atribuída', () => {
      const admin = { id: 1, role: 'Administrador' };
      const tecItaminas = { id: 2, role: 'Técnico de Campo', empresaId: 'ITAMINAS', allowedStructures: ['B1', 'B4'] };

      const rowB1 = { id: 101, empresaId: 'ITAMINAS', estruturaId: 'B1' };
      const rowB2 = { id: 102, empresaId: 'ITAMINAS', estruturaId: 'PILHA_B2' };
      const rowOutraEmpresa = { id: 103, empresaId: 'VALE', estruturaId: 'B1' };

      expect(rlsGuard.canAccessRow(admin, rowOutraEmpresa)).toBe(true);
      expect(rlsGuard.canAccessRow(tecItaminas, rowB1)).toBe(true);
      expect(rlsGuard.canAccessRow(tecItaminas, rowB2)).toBe(false); // estrutura não autorizada
      expect(rlsGuard.canAccessRow(tecItaminas, rowOutraEmpresa)).toBe(false); // empresa diferente
    });

    it('deve filtrar dataset completo respeitando RLS', () => {
      const user = { id: 2, role: 'Técnico de Campo', empresaId: 'ITAMINAS', allowedStructures: ['B1'] };
      const dataset = [
        { id: 1, empresaId: 'ITAMINAS', estruturaId: 'B1' },
        { id: 2, empresaId: 'ITAMINAS', estruturaId: 'B4' },
        { id: 3, empresaId: 'TERCEIRO', estruturaId: 'B1' }
      ];
      const filtered = rlsGuard.filterWithRLS(dataset, user);
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe(1);
    });
  });

  // --------------------------------------------------------------------------
  // ORDEM 5: Criptografia de dados
  // --------------------------------------------------------------------------
  describe('Ordem 5 - Criptografia de dados (AES-GCM / WebCrypto)', () => {
    it('deve criptografar e descriptografar dados sensíveis de forma reversível e segura', async () => {
      const plainText = 'Dados confidenciais de piezometria e laudo da barragem B1';
      const key = 'chave_secreta_super_forte_32bytes!';
      const cipher = await cryptoGuard.encryptData(plainText, key);

      expect(cipher).not.toBe(plainText);
      expect(typeof cipher).toBe('string');

      const decrypted = await cryptoGuard.decryptData(cipher, key);
      expect(decrypted).toBe(plainText);
    });
  });

  // --------------------------------------------------------------------------
  // ORDEM 6: Auth Server side
  // --------------------------------------------------------------------------
  describe('Ordem 6 - Auth Server side', () => {
    it('deve validar estrutura de token e expiração do servidor', () => {
      // Token válido não expirado
      const expFuture = Math.floor(Date.now() / 1000) + 3600;
      const validPayload = btoa(JSON.stringify({ sub: 'user_123', exp: expFuture, role: 'Engenheiro Geotécnico' }));
      const token = `header.${validPayload}.signature`;

      const res = serverAuthGuard.validateTokenStructure(token);
      expect(res.valid).toBe(true);
      expect(res.payload.sub).toBe('user_123');

      // Token expirado
      const expPast = Math.floor(Date.now() / 1000) - 3600;
      const expiredPayload = btoa(JSON.stringify({ sub: 'user_123', exp: expPast }));
      const expiredToken = `header.${expiredPayload}.signature`;

      const expiredRes = serverAuthGuard.validateTokenStructure(expiredToken);
      expect(expiredRes.valid).toBe(false);
      expect(expiredRes.reason).toContain('expirada');
    });

    it('deve verificar inatividade da sessão', () => {
      const recent = new Date().toISOString();
      const stale = new Date(Date.now() - 70 * 60 * 1000).toISOString();
      expect(serverAuthGuard.isSessionActive(recent, 60)).toBe(true);
      expect(serverAuthGuard.isSessionActive(stale, 60)).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // ORDEM 7: Restringir acessos (RBAC)
  // --------------------------------------------------------------------------
  describe('Ordem 7 - Restringir acessos (RBAC)', () => {
    it('deve permitir ações somente para papéis explicitamente autorizados', () => {
      expect(rbacGuard.checkPermission('Administrador', 'ANY_ACTION')).toBe(true);
      expect(rbacGuard.checkPermission('Engenheiro Geotécnico', 'OVERRIDE_LIMITS')).toBe(true);
      expect(rbacGuard.checkPermission('Técnico de Campo', 'OVERRIDE_LIMITS')).toBe(false);
      expect(rbacGuard.checkPermission('Consultor / Auditor', 'REGISTER_ANOMALY')).toBe(false);
      expect(rbacGuard.checkPermission('Consultor / Auditor', 'AUDIT_DATA')).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // ORDEM 8: Bloquear Mass Assignment
  // --------------------------------------------------------------------------
  describe('Ordem 8 - Bloquear Mass Assignment', () => {
    it('deve eliminar campos protegidos injetados em requisições de criação/atualização', () => {
      const maliciousPayload = {
        valor: 15.4,
        observacoes: 'Leitura regular',
        id: 'MODIFIED_ID',
        isAdmin: true,
        role: 'Administrador',
        sealHash: 'FAKE_HASH',
        injectedMaliciousField: 'exploit'
      };

      const clean = massAssignmentGuard.sanitizePayload('leitura', maliciousPayload);
      expect(clean.valor).toBe(15.4);
      expect(clean.observacoes).toBe('Leitura regular');
      expect(clean.id).toBeUndefined();
      expect(clean.isAdmin).toBeUndefined();
      expect(clean.role).toBeUndefined();
      expect(clean.sealHash).toBeUndefined();
      expect(clean.injectedMaliciousField).toBeUndefined();
    });
  });

  // --------------------------------------------------------------------------
  // ORDEM 9: Proteger cookies
  // --------------------------------------------------------------------------
  describe('Ordem 9 - Proteger cookies', () => {
    it('deve formatar cookies com diretivas Secure e SameSite=Strict', () => {
      const cookie = cookieGuard.formatSecureCookie('session_id', 'abc123xyz', 7);
      expect(cookie).toContain('SameSite=Strict');
      expect(cookie).toContain('Secure');
      expect(cookie).toContain('Path=/');
      expect(cookieGuard.isSecureCookieString(cookie)).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // ORDEM 10: Hash nas senhas
  // --------------------------------------------------------------------------
  describe('Ordem 10 - Hash nas senhas', () => {
    it('deve gerar salt criptográfico e calcular hash resistente', async () => {
      const salt = passwordGuard.generateSalt();
      expect(salt.length).toBeGreaterThanOrEqual(16);

      const hash = await passwordGuard.hashPassword('SenhaMina2026@', salt);
      expect(hash).not.toBe('SenhaMina2026@');

      const isMatch = await passwordGuard.verifyPassword('SenhaMina2026@', hash, salt);
      expect(isMatch).toBe(true);

      const wrongMatch = await passwordGuard.verifyPassword('SenhaIncorreta', hash, salt);
      expect(wrongMatch).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // ORDEM 11: Rate limit
  // --------------------------------------------------------------------------
  describe('Ordem 11 - Rate limit', () => {
    it('deve bloquear chamadas excessivas e aplicar lockout temporal', () => {
      const key = 'login_attempt_ip_1';
      for (let i = 0; i < 5; i++) {
        expect(rateLimiter.check(key, 5, 60000).allowed).toBe(true);
      }
      // A 6ª tentativa excede o limite de 5
      const blocked = rateLimiter.check(key, 5, 60000);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remainingTime).toBeGreaterThan(0);
    });
  });

  // --------------------------------------------------------------------------
  // ORDEM 12: Bot protection
  // --------------------------------------------------------------------------
  describe('Ordem 12 - Bot protection', () => {
    it('deve reprovar formulários com honeypot preenchido', () => {
      const humanForm = { nome: 'Maycon', website_trap_check: '' };
      const botForm = { nome: 'Spambot', website_trap_check: 'http://spam.ru' };

      expect(botGuard.validateHoneypot(humanForm).isHuman).toBe(true);
      expect(botGuard.validateHoneypot(botForm).isHuman).toBe(false);
    });

    it('deve reprovar submissões ultrarrápidas típicas de bots (< 500ms)', () => {
      const now = Date.now();
      expect(botGuard.validateSubmissionSpeed(now - 100, 500).isHuman).toBe(false);
      expect(botGuard.validateSubmissionSpeed(now - 2000, 500).isHuman).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // ORDEM 13: Queries parametrizadas
  // --------------------------------------------------------------------------
  describe('Ordem 13 - Queries parametrizadas', () => {
    it('deve escapar parâmetros e construir cláusulas WHERE parametrizadas seguras', () => {
      expect(parameterizedQuery.escapeParam("admin' OR '1'='1")).toBe("admin'' OR ''1''=''1");

      const filters = { estrutura: "B1", status: "EMERGENCIA'; DROP TABLE instrumentos;--" };
      const query = parameterizedQuery.buildWhereClause(filters);

      expect(query.clause).toBe('WHERE estrutura = $1 AND status = $2');
      expect(query.params[0]).toBe('B1');
      expect(query.params[1]).toContain("EMERGENCIA''; DROP TABLE instrumentos;--");
    });
  });

  // --------------------------------------------------------------------------
  // ORDEM 14: Validação dos Inputs
  // --------------------------------------------------------------------------
  describe('Ordem 14 - Validação dos Inputs', () => {
    it('deve validar coordenadas e leituras numéricas contra limites físicos', () => {
      // Coordenadas válidas de Minas Gerais
      expect(inputValidator.validateCoordinates(-20.1234, -44.1234)).toBe(true);
      // Coordenadas fora do globo ou absurdas
      expect(inputValidator.validateCoordinates(150, -44)).toBe(false);
      expect(inputValidator.validateCoordinates('NaN', -44)).toBe(false);

      // Leitura de piezômetro
      expect(inputValidator.validateNumericReading(12.5, 0, 100)).toBe(true);
      expect(inputValidator.validateNumericReading(-5, 0, 100)).toBe(false);

      // Sanitização de string anti-XSS
      expect(inputValidator.sanitizeString('<script>alert(1)</script>Texto limpo')).toBe('Texto limpo');
    });
  });

  // --------------------------------------------------------------------------
  // ORDEM 15: Vazar conteúdo
  // --------------------------------------------------------------------------
  describe('Ordem 15 - Vazar conteúdo', () => {
    it('deve ocultar caminhos de arquivo internos e tokens de mensagens de erro', () => {
      const rawError = new Error('Falha no arquivo C:\\Users\\maycon.nascimento\\db.sqlite com token=secret_xyz');
      const safe = dataLeakGuard.sanitizeErrorMessage(rawError);

      expect(safe).not.toContain('C:\\Users\\maycon.nascimento');
      expect(safe).toContain('[CAMINHO_RESTRITO]');
      expect(safe).toContain('token=[PROTEGIDO]');
    });

    it('deve aplicar máscara em CPFs e e-mails pessoais', () => {
      const text = 'Responsável: 123.456.789-00 / contato: maycon.nascimento@itaminas.com.br';
      const masked = dataLeakGuard.maskSensitiveInfo(text);

      expect(masked).toContain('***.456.***-00');
      expect(masked).toContain('m***@itaminas.com.br');
    });
  });

  // --------------------------------------------------------------------------
  // ORDEM 16: Restringir uploads
  // --------------------------------------------------------------------------
  describe('Ordem 16 - Restringir uploads', () => {
    it('deve rejeitar arquivos com extensão não permitida ou tamanho excessivo', () => {
      const validPhoto = { name: 'foto_evidencia.jpg', size: 1024 * 1024, type: 'image/jpeg' };
      const evilExe = { name: 'malware.exe', size: 1024, type: 'application/x-msdownload' };
      const hugeFile = { name: 'pesado.pdf', size: 25 * 1024 * 1024, type: 'application/pdf' };

      expect(uploadGuard.validateUpload(validPhoto).valid).toBe(true);
      expect(uploadGuard.validateUpload(evilExe).valid).toBe(false);
      expect(uploadGuard.validateUpload(hugeFile).valid).toBe(false);
    });

    it('deve validar Magic Numbers binários de imagens e PDFs', () => {
      const fakeJpg = new Uint8Array([0x4D, 0x5A, 0x90, 0x00]); // Header de EXE MZ
      const realJpg = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]); // Header real JPEG

      expect(uploadGuard.validateFileHeader(fakeJpg, 'jpg')).toBe(false);
      expect(uploadGuard.validateFileHeader(realJpg, 'jpg')).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // ORDEM 17: Trim respostas de API
  // --------------------------------------------------------------------------
  describe('Ordem 17 - Trim respostas de API', () => {
    it('deve podar atributos sensíveis e metadados internos de respostas de API', () => {
      const apiResponse = {
        id: 'INS-01',
        cota: 820.0,
        passwordHash: 'hash_secreto',
        tempToken: 'token_temporario',
        metadata: {
          leitura: 14.2,
          _rawDbHandle: 'db_connection_ref'
        }
      };

      const trimmed = apiTrimGuard.trimResponse(apiResponse);
      expect(trimmed.id).toBe('INS-01');
      expect(trimmed.cota).toBe(820.0);
      expect(trimmed.passwordHash).toBeUndefined();
      expect(trimmed.tempToken).toBeUndefined();
      expect(trimmed.metadata.leitura).toBe(14.2);
      expect(trimmed.metadata._rawDbHandle).toBeUndefined();
    });
  });

  // --------------------------------------------------------------------------
  // ORDEM 18: Add security headers
  // --------------------------------------------------------------------------
  describe('Ordem 18 - Add security headers', () => {
    it('deve fornecer conjunto completo de headers de segurança padrão', () => {
      const headers = securityHeadersGuard.getStandardHeaders();
      expect(headers['Content-Security-Policy']).toBeDefined();
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
      expect(headers['Permissions-Policy']).toBeDefined();
      expect(headers['Strict-Transport-Security']).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // ORDEM 19: Forçar HTTPS
  // --------------------------------------------------------------------------
  describe('Ordem 19 - Forçar HTTPS', () => {
    it('deve identificar conexões inseguras e forçar protocolo HTTPS', () => {
      expect(httpsEnforcer.isSecureProtocol('https://itaminas.com.br')).toBe(true);
      expect(httpsEnforcer.isSecureProtocol('http://itaminas.com.br')).toBe(false);
      expect(httpsEnforcer.ensureHttpsUrl('http://api.itaminas.com.br/dados')).toBe('https://api.itaminas.com.br/dados');
      // Preservar localhost em desenvolvimento
      expect(httpsEnforcer.ensureHttpsUrl('http://localhost:5173')).toBe('http://localhost:5173');
    });
  });

  // --------------------------------------------------------------------------
  // ORDEM 20: Scam de dependências
  // --------------------------------------------------------------------------
  describe('Ordem 20 - Scam de dependências', () => {
    it('deve auditar integridade de pacotes e rejeitar typosquatting conhecido', () => {
      expect(dependencyAuditGuard.auditPackageName('react').trusted).toBe(true);
      expect(dependencyAuditGuard.auditPackageName('vitest').trusted).toBe(true);
      expect(dependencyAuditGuard.auditPackageName('evil-package').trusted).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // Integração Consolidada
  // --------------------------------------------------------------------------
  describe('Integração de todas as 20 Ordens no securityShield', () => {
    it('deve disponibilizar todas as ordens de 1 a 20 indexadas no objeto principal', () => {
      for (let i = 1; i <= 20; i++) {
        expect(securityShield.orders[i]).toBeDefined();
      }
    });
  });
});
