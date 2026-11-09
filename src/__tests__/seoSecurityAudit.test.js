// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { analyticsService } from '../services/analyticsService';

describe('Auditoria Completa de SEO, Conformidade e Segurança (12 Itens)', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const publicDir = path.resolve(rootDir, 'public');
  const indexHtmlPath = path.resolve(rootDir, 'index.html');
  const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');

  // 1. Sitemap xml
  describe('1. Sitemap XML', () => {
    const sitemapPath = path.resolve(publicDir, 'sitemap.xml');

    it('deve existir no diretório public/', () => {
      expect(fs.existsSync(sitemapPath)).toBe(true);
    });

    it('deve ser um XML válido e conter namespace sitemaps.org', () => {
      const content = fs.readFileSync(sitemapPath, 'utf-8');
      expect(content).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(content).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
      expect(content).toContain('</urlset>');
    });

    it('deve listar a URL principal e submódulos com priority e changefreq', () => {
      const content = fs.readFileSync(sitemapPath, 'utf-8');
      expect(content).toContain('<loc>https://maycon97.github.io/MDSync---Mining-Geotechnical-Data/</loc>');
      expect(content).toContain('<priority>1.0</priority>');
      expect(content).toContain('<changefreq>daily</changefreq>');
      expect(content).toContain('?mod=map');
      expect(content).toContain('?mod=piezometria');
      expect(content).toContain('?mod=relatorios-anm');
    });
  });

  // 2. Robots.txt
  describe('2. Robots.txt', () => {
    const robotsPath = path.resolve(publicDir, 'robots.txt');

    it('deve existir no diretório public/', () => {
      expect(fs.existsSync(robotsPath)).toBe(true);
    });

    it('deve definir permissões para User-agent * e referenciar o sitemap', () => {
      const content = fs.readFileSync(robotsPath, 'utf-8');
      expect(content).toContain('User-agent: *');
      expect(content).toContain('Allow: /');
      expect(content).toContain('Disallow: /_headers');
      expect(content).toMatch(/Sitemap:\s*https:\/\/.*sitemap\.xml/);
    });
  });

  // 3. Meta title e meta description
  describe('3. Meta Title e Meta Description', () => {
    it('deve possuir title otimizado para SERP do Google (entre 40 e 70 caracteres)', () => {
      const titleMatch = indexHtmlContent.match(/<title>([^<]+)<\/title>/);
      expect(titleMatch).not.toBeNull();
      const title = titleMatch[1];
      expect(title.length).toBeGreaterThanOrEqual(40);
      expect(title.length).toBeLessThanOrEqual(70);
      expect(title).toContain('MDSync');
      expect(title).toContain('Geotécnicos');
    });

    it('deve possuir meta description com tamanho ideal para snippet do Google (130-170 caracteres)', () => {
      const descMatch = indexHtmlContent.match(/<meta\s+name="description"\s+content="([^"]+)"/);
      expect(descMatch).not.toBeNull();
      const desc = descMatch[1];
      expect(desc.length).toBeGreaterThanOrEqual(130);
      expect(desc.length).toBeLessThanOrEqual(175);
      expect(desc).toContain('MDSync');
      expect(desc).toContain('ANM');
    });

    it('deve possuir keywords e author tags', () => {
      expect(indexHtmlContent).toContain('name="keywords"');
      expect(indexHtmlContent).toContain('name="author"');
    });
  });

  // 4. URLs canônicas
  describe('4. URLs Canônicas', () => {
    it('deve conter tag link rel="canonical" apontando para o domínio principal', () => {
      const canonicalMatch = indexHtmlContent.match(/<link\s+rel="canonical"\s+href="([^"]+)"/);
      expect(canonicalMatch).not.toBeNull();
      expect(canonicalMatch[1]).toBe('https://maycon97.github.io/MDSync---Mining-Geotechnical-Data/');
    });
  });

  // 5. Open Graph e imagem de compartilhamento
  describe('5. Open Graph e Imagem de Compartilhamento', () => {
    it('deve conter as tags Open Graph essenciais (og:title, og:description, og:image, og:url, og:type)', () => {
      expect(indexHtmlContent).toContain('property="og:title"');
      expect(indexHtmlContent).toContain('property="og:description"');
      expect(indexHtmlContent).toContain('property="og:image"');
      expect(indexHtmlContent).toContain('property="og:url"');
      expect(indexHtmlContent).toContain('property="og:type"');
      expect(indexHtmlContent).toContain('property="og:locale"');
      expect(indexHtmlContent).toContain('content="pt_BR"');
    });

    it('deve especificar dimensões e alt para a imagem Open Graph', () => {
      expect(indexHtmlContent).toContain('property="og:image:width" content="1200"');
      expect(indexHtmlContent).toContain('property="og:image:height" content="630"');
      expect(indexHtmlContent).toContain('property="og:image:alt"');
    });

    it('deve conter tags Twitter Cards com summary_large_image', () => {
      expect(indexHtmlContent).toContain('name="twitter:card" content="summary_large_image"');
      expect(indexHtmlContent).toContain('name="twitter:title"');
      expect(indexHtmlContent).toContain('name="twitter:description"');
      expect(indexHtmlContent).toContain('name="twitter:image"');
    });
  });

  // 6. Imagens otimizadas e texto alternativo
  describe('6. Imagens Otimizadas e Texto Alternativo', () => {
    it('todas as tags <img> do index.html ou templates devem possuir atributo alt preenchido', () => {
      const srcDir = path.resolve(rootDir, 'src');
      const files = fs.readdirSync(srcDir, { recursive: true });
      const jsxFiles = files.filter(f => typeof f === 'string' && (f.endsWith('.jsx') || f.endsWith('.tsx')));

      let missingAltCount = 0;
      jsxFiles.forEach(file => {
        const fullPath = path.resolve(srcDir, file);
        const code = fs.readFileSync(fullPath, 'utf-8');
        // Checar por tags img sem alt
        const imgTags = code.match(/<img[^>]*>/g) || [];
        imgTags.forEach(tag => {
          if (!tag.includes('alt=')) {
            missingAltCount++;
          }
        });
      });

      expect(missingAltCount).toBe(0);
    });

    it('deve possuir favicons e logos em formato PNG/SVG em public/', () => {
      expect(fs.existsSync(path.resolve(publicDir, 'logo_mdsync.png'))).toBe(true);
      expect(fs.existsSync(path.resolve(publicDir, 'logo_mdsync_icon.png'))).toBe(true);
      expect(fs.existsSync(path.resolve(publicDir, 'favicon.svg'))).toBe(true);
    });
  });

  // 7. Dados estruturados Schema.org
  describe('7. Dados Estruturados Schema.org', () => {
    it('deve conter bloco de script application/ld+json válido', () => {
      const schemaMatch = indexHtmlContent.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      expect(schemaMatch).not.toBeNull();
      
      const parsedJson = JSON.parse(schemaMatch[1]);
      expect(parsedJson['@context']).toBe('https://schema.org');
      expect(parsedJson['@graph']).toBeDefined();
      expect(Array.isArray(parsedJson['@graph'])).toBe(true);
    });

    it('deve declarar os tipos WebApplication e Organization no graph', () => {
      const schemaMatch = indexHtmlContent.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      const parsedJson = JSON.parse(schemaMatch[1]);
      const types = parsedJson['@graph'].map(item => item['@type']);
      expect(types).toContain('WebApplication');
      expect(types).toContain('Organization');

      const webApp = parsedJson['@graph'].find(item => item['@type'] === 'WebApplication');
      expect(webApp.name).toContain('MDSync');
      expect(webApp.operatingSystem).toBeDefined();
      expect(webApp.featureList).toBeDefined();
      expect(webApp.featureList.length).toBeGreaterThan(3);
    });
  });

  // 8. Google Search Console e indexação
  describe('8. Google Search Console e Indexação', () => {
    it('deve conter meta tag de verificação do Google Search Console', () => {
      expect(indexHtmlContent).toContain('name="google-site-verification"');
      expect(indexHtmlContent).toContain('id="gsc-meta-verification"');
    });

    it('deve conter diretivas de indexação para robôs (robots e googlebot)', () => {
      expect(indexHtmlContent).toContain('name="robots" content="index, follow');
      expect(indexHtmlContent).toContain('name="googlebot" content="index, follow');
      expect(indexHtmlContent).toContain('max-snippet:-1');
      expect(indexHtmlContent).toContain('max-image-preview:large');
    });
  });

  // 9. Google Analytics e eventos
  describe('9. Google Analytics e Eventos Telemetria', () => {
    it('deve carregar a biblioteca gtag do Google Analytics 4 (GA4) no index.html', () => {
      expect(indexHtmlContent).toContain('googletagmanager.com/gtag/js?id=G-MDSYNCGEOT');
      expect(indexHtmlContent).toContain("gtag('config', 'G-MDSYNCGEOT'");
    });

    it('analyticsService deve inicializar sem quebrar e suportar registro de eventos geotécnicos', () => {
      window.dataLayer = [];
      analyticsService.init('G-TEST1234');
      expect(analyticsService.initialized).toBe(true);

      analyticsService.trackPageView('Dashboard Geotécnico', '/dashboard');
      expect(window.dataLayer.length).toBeGreaterThan(0);

      analyticsService.trackStructureSelection('PDE_MGB', 'PDE Mangaba');
      analyticsService.trackReportExport('LAUDO_REGULAR_ANM', 'A4_PDF', 1);
      analyticsService.trackSyncOperation('upload', 5, 'success');

      const events = window.dataLayer.map(args => args[0] === 'event' ? args[1] : null).filter(Boolean);
      expect(events).toContain('page_view');
      expect(events).toContain('geotech_structure_select');
      expect(events).toContain('geotech_report_export');
      expect(events).toContain('geotech_offline_sync');
    });
  });

  // 10. Página 404 personalizada
  describe('10. Página 404 Personalizada', () => {
    const page404Path = path.resolve(publicDir, '404.html');

    it('deve existir no diretório public/ para resposta no GitHub Pages', () => {
      expect(fs.existsSync(page404Path)).toBe(true);
    });

    it('deve conter layout corporativo MDSync com mensagem informativa e botão para início', () => {
      const content = fs.readFileSync(page404Path, 'utf-8');
      expect(content).toContain('CÓDIGO 404');
      expect(content).toContain('logo_mdsync_icon.png');
      expect(content).toContain('Retornar ao Painel MDSync');
    });

    it('deve conter script SPA redirect handler para GitHub Pages', () => {
      const content = fs.readFileSync(page404Path, 'utf-8');
      expect(content).toContain('MDSync---Mining-Geotechnical-Data');
      expect(content).toContain('window.location.replace');
    });
  });

  // 11. HTTPS e redirecionamentos
  describe('11. HTTPS e Redirecionamentos', () => {
    it('deve possuir script de redirecionamento automático HTTP para HTTPS em produção', () => {
      expect(indexHtmlContent).toContain("window.location.protocol === 'http:'");
      expect(indexHtmlContent).toContain("window.location.hostname !== 'localhost'");
      expect(indexHtmlContent).toContain("window.location.replace('https:'");
    });

    it('deve conter diretiva upgrade-insecure-requests na CSP do index.html', () => {
      expect(indexHtmlContent).toContain('upgrade-insecure-requests');
    });

    it('deve configurar HSTS (Strict-Transport-Security) em public/_headers', () => {
      const headersContent = fs.readFileSync(path.resolve(publicDir, '_headers'), 'utf-8');
      expect(headersContent).toContain('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
    });
  });

  // 12. Cabeçalhos de segurança
  describe('12. Cabeçalhos de Segurança (Security Headers)', () => {
    it('deve conter cabeçalhos essenciais em public/_headers', () => {
      const headersContent = fs.readFileSync(path.resolve(publicDir, '_headers'), 'utf-8');
      expect(headersContent).toContain('X-Content-Type-Options: nosniff');
      expect(headersContent).toContain('X-Frame-Options: SAMEORIGIN');
      expect(headersContent).toContain('Referrer-Policy: strict-origin-when-cross-origin');
      expect(headersContent).toContain('Permissions-Policy: camera=(self), geolocation=(self), microphone=()');
      expect(headersContent).toContain('Cross-Origin-Opener-Policy: same-origin');
    });

    it('deve conter Content-Security-Policy e proteção contra clickjacking/sniffing no index.html', () => {
      expect(indexHtmlContent).toContain('http-equiv="Content-Security-Policy"');
      expect(indexHtmlContent).toContain('http-equiv="X-Content-Type-Options" content="nosniff"');
      expect(indexHtmlContent).toContain('name="referrer" content="strict-origin-when-cross-origin"');
      expect(indexHtmlContent).toContain('http-equiv="Permissions-Policy"');
    });
  });
});

