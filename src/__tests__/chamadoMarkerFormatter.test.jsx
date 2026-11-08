// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  GEAR_SVG_ICON,
  resolveChamadoCriticidade,
  createChamadoMarkerHtml,
  createChamadoPopupContent
} from '../utils/chamadoMarkerFormatter';

describe('Formatador de Marcadores de Chamados Geotécnicos & Fluig', () => {
  beforeEach(() => {
    delete window.__handleSelectChamadoDetail;
  });

  afterEach(() => {
    delete window.__handleSelectChamadoDetail;
  });

  describe('resolveChamadoCriticidade', () => {
    it('resolve criticidade Alta / Crítica para Vermelho (#ef4444)', () => {
      const critA1 = resolveChamadoCriticidade({ crit: 'A1' });
      expect(critA1.color).toBe('#ef4444');
      expect(critA1.code).toBe('A1');
      expect(critA1.level).toContain('Crítica');

      const critAlta = resolveChamadoCriticidade({ criticidade: 'ALTA' });
      expect(critAlta.color).toBe('#ef4444');
      expect(critAlta.code).toBe('A3');

      const critEmerg = resolveChamadoCriticidade({ severidade: 'EMERGÊNCIA' });
      expect(critEmerg.color).toBe('#ef4444');
    });

    it('resolve criticidade Média / Alerta para Laranja / Âmbar (#f59e0b)', () => {
      const critM1 = resolveChamadoCriticidade({ crit: 'M1' });
      expect(critM1.color).toBe('#f59e0b');
      expect(critM1.code).toBe('M1');
      expect(critM1.level).toContain('Média');

      const critMed = resolveChamadoCriticidade({ criticidade: 'MÉDIA' });
      expect(critMed.color).toBe('#f59e0b');

      const critAlerta = resolveChamadoCriticidade({ criticidadeNivel: 'Alerta' });
      expect(critAlerta.color).toBe('#f59e0b');
    });

    it('resolve criticidade Baixa / Normal para Verde (#10b981)', () => {
      const critB3 = resolveChamadoCriticidade({ crit: 'B3' });
      expect(critB3.color).toBe('#10b981');
      expect(critB3.code).toBe('B3');
      expect(critB3.level).toContain('Baixa');

      const critBaixa = resolveChamadoCriticidade({ criticidade: 'BAIXA' });
      expect(critBaixa.color).toBe('#10b981');

      const critNormal = resolveChamadoCriticidade({ severidade: 'Normal' });
      expect(critNormal.color).toBe('#10b981');
    });

    it('retorna fallback seguro para chamados nulos ou sem criticidade', () => {
      const fallbackNull = resolveChamadoCriticidade(null);
      expect(fallbackNull).toBeDefined();
      expect(fallbackNull.color).toBe('#64748b');
      expect(fallbackNull.code).toBe('ND');

      const fallbackEmpty = resolveChamadoCriticidade({});
      expect(fallbackEmpty).toBeDefined();
      expect(fallbackEmpty.code).toBe('R');
    });
  });

  describe('createChamadoMarkerHtml', () => {
    it('gera marcador pílula com ícone de engrenagem ⛮ e número de protocolo (#132707)', () => {
      const ticket = {
        proto: '132707',
        crit: 'A3',
        lat: -20.0939,
        lon: -44.1062
      };

      const html = createChamadoMarkerHtml(ticket, false);

      expect(html).toContain('mdsync-chamado-marker-pill');
      expect(html).toContain('#132707');
      expect(html).toContain('A3');
      // Contém o SVG da engrenagem
      expect(html).toContain('<svg');
      expect(html).toContain('<circle cx="12" cy="12" r="3"');
      // Usa cor de criticidade vermelha para A3
      expect(html).toContain('#ef4444');
    });

    it('destaca a borda quando o marcador está selecionado', () => {
      const ticket = {
        protocolo: '226406',
        crit: 'M1'
      };

      const html = createChamadoMarkerHtml(ticket, true);
      expect(html).toContain('is-selected');
      expect(html).toContain('#38bdf8');
      expect(html).toContain('#226406');
      expect(html).toContain('M1');
    });

    it('retorna string vazia para chamados nulos', () => {
      expect(createChamadoMarkerHtml(null)).toBe('');
    });
  });

  describe('createChamadoPopupContent (Balão Informativo)', () => {
    it('inclui destaque ao Setor Responsável pela Manutenção, protocolo e estrutura', () => {
      const ticket = {
        proto: '132707',
        estr: 'Barragem B1 / B4',
        tipo: 'Canal de Drenagem',
        crit: 'A3',
        requerido: 'Infraestrutura e Obras Civis',
        acaoCorretiva: 'Desobstrução urgente da canaleta oeste',
        planoAcao: 'Mobilizar retroescavadeira e equipe de solo imediatamente',
        statusCh: 'Em Andamento',
        abertura: '2026-11-01',
        limite: '2026-11-15',
        lat: -20.093978,
        lon: -44.106216
      };

      const popupHtml = createChamadoPopupContent(ticket);

      // Verificações essenciais
      expect(popupHtml).toContain('Chamado #132707');
      expect(popupHtml).toContain('A3');
      expect(popupHtml).toContain('Barragem B1 / B4');
      expect(popupHtml).toContain('Canal de Drenagem');
      
      // Setor Responsável pela Manutenção
      expect(popupHtml).toContain('Setor Responsável pela Manutenção:');
      expect(popupHtml).toContain('Infraestrutura e Obras Civis');

      // Ação Corretiva e Plano
      expect(popupHtml).toContain('Desobstrução urgente da canaleta oeste');
      expect(popupHtml).toContain('Mobilizar retroescavadeira e equipe de solo imediatamente');
      
      // GPS e Ação
      expect(popupHtml).toContain('GPS: -20.093978, -44.106216');
      expect(popupHtml).toContain('Ver Ficha Completa da Manutenção');
    });

    it('suporta esquema alternativo de dados (protocolo, estrutura, setorResponsavel)', () => {
      const ticketAlt = {
        protocolo: '232972',
        estrutura: 'Cava Jangada',
        criticidade: 'A3',
        setorResponsavel: 'Engenharia Geotécnica PCMI',
        titulo: 'Instalação de Piezômetro Complementar',
        descricao: 'Perfuração e instalação em cota 890m',
        status: 'Pendente',
        dataLimite: '2026-12-01'
      };

      const popupHtml = createChamadoPopupContent(ticketAlt);

      expect(popupHtml).toContain('Chamado #232972');
      expect(popupHtml).toContain('Cava Jangada');
      expect(popupHtml).toContain('Setor Responsável pela Manutenção:');
      expect(popupHtml).toContain('Engenharia Geotécnica PCMI');
      expect(popupHtml).toContain('Instalação de Piezômetro Complementar');
      expect(popupHtml).toContain('Perfuração e instalação em cota 890m');
    });

    it('trata campos vazios, ausentes ou nulos sem lançar erros ou quebrar a renderização', () => {
      const ticketIncompleto = {
        id: '99999'
      };

      expect(() => {
        const html = createChamadoPopupContent(ticketIncompleto);
        expect(html).toContain('Chamado #99999');
        expect(html).toContain('Setor Responsável pela Manutenção:');
        expect(html).toContain('Manutenção Civil / Geotécnica');
      }).not.toThrow();

      expect(() => {
        const htmlNull = createChamadoPopupContent(null);
        expect(htmlNull).toContain('indisponíveis');
      }).not.toThrow();
    });

    it('configura o atributo onclick para chamar window.__handleSelectChamadoDetail no botão do balão', () => {
      const mockHandler = vi.fn();
      window.__handleSelectChamadoDetail = mockHandler;

      const ticket = {
        proto: '197237',
        crit: 'B3',
        requerido: 'Topografia e Monitoramento'
      };

      const div = document.createElement('div');
      div.innerHTML = createChamadoPopupContent(ticket);
      document.body.appendChild(div);

      const btn = div.querySelector('button');
      expect(btn).not.toBeNull();
      const onclickAttr = btn.getAttribute('onclick');
      expect(onclickAttr).toContain('window.__handleSelectChamadoDetail');
      expect(onclickAttr).toContain('197237');

      // Testa a execução do código de dentro do atributo onclick
      const clickFn = new Function(onclickAttr);
      clickFn.call(btn);

      expect(mockHandler).toHaveBeenCalledWith('197237');

      div.remove();
    });
  });
});
