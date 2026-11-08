// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { 
  getTicketCriticalityInfo, 
  createTicketDivIcon, 
  generateTicketBalloonPopup, 
  generateTicketTooltip,
  normalizeTicketData
} from '../utils/ticketMapHelper';

describe('Ticket Map Marker Formatting & Balloon Popup Suite', () => {
  const sampleTicketCritico = {
    protocolo: '132707',
    lat: -20.063056,
    lon: -44.113889,
    requerido: 'Infraestrutura de Mina',
    estrutura: 'Barragem B1',
    tipo: 'Barragem',
    dataIdentificacao: '2025-06-04',
    acaoCorretiva: 'Remoção de Material',
    planoAcao: 'As canaletas de escoamento pluvial da barragem B1, estão com uma grande concentração de detritos.',
    criticidade: 'A1',
    prazoDias: 7,
    dataLimite: '2025-06-12',
    status: 'Concluído',
    titulo: 'Remoção de Material - Barragem B1'
  };

  const sampleTicketMedio = {
    proto: '132638',
    lat: -20.063333,
    lon: -44.115,
    requerido: 'Infraestrutura de Conservação',
    estr: 'Barragem B1',
    tipo: 'Barragem',
    identificacao: '2025-06-04',
    acaoCorretiva: 'Controle de Gramíneas',
    planoAcao: 'Solicito a poda no pé da barragem B1.',
    crit: 'M2',
    limite: '2025-07-15',
    status: 'Realizado e Aprovado'
  };

  const sampleTicketBaixo = {
    protocolo: '132242',
    lat: -20.089704,
    lon: -44.117939,
    estrutura: 'PDE I',
    criticidade: 'B3',
    status: 'Concluído'
  };

  it('determines the color strictly based on the criticality level of the ticket', () => {
    // Alta / Crítica -> Red
    const critA1 = getTicketCriticalityInfo('A1');
    expect(critA1.color).toBe('#ef4444');
    expect(critA1.level).toBe('ALTA');

    const critAlta = getTicketCriticalityInfo('Alta');
    expect(critAlta.color).toBe('#ef4444');

    const critEmerg = getTicketCriticalityInfo('Crítica');
    expect(critEmerg.color).toBe('#ef4444');

    // Média / Atenção -> Amber/Orange
    const critM2 = getTicketCriticalityInfo('M2');
    expect(critM2.color).toBe('#f59e0b');
    expect(critM2.level).toBe('MEDIA');

    const critMedia = getTicketCriticalityInfo('Média');
    expect(critMedia.color).toBe('#f59e0b');

    // Baixa / Normal -> Green
    const critB3 = getTicketCriticalityInfo('B3');
    expect(critB3.color).toBe('#10b981');
    expect(critB3.level).toBe('BAIXA');

    const critBaixa = getTicketCriticalityInfo('Baixa');
    expect(critBaixa.color).toBe('#10b981');
  });

  it('createTicketDivIcon generates a visual badge containing the gear ⛮ symbol, criticality color, and protocol number', () => {
    const iconDiv = createTicketDivIcon(sampleTicketCritico);
    expect(iconDiv).toBeDefined();

    const html = iconDiv.options.html;

    // 1. Simbolo de engrenagem ⛮ indicando manutenção
    expect(html).toContain('⛮');
    expect(html).toContain('ticket-gear-spin');

    // 2. A cor deve acompanhar o nível de criticidade (#ef4444 para A1)
    expect(html).toContain('#ef4444');

    // 3. O numero do protocolo do chamado
    expect(html).toContain('#132707');
    expect(html).toContain('A1');
  });

  it('generateTicketBalloonPopup creates an informative balloon popup with all ticket information', () => {
    const popupHtml = generateTicketBalloonPopup(sampleTicketCritico);

    // Protocolo e símbolo ⛮
    expect(popupHtml).toContain('#132707');
    expect(popupHtml).toContain('⛮');

    // Criticidade
    expect(popupHtml).toContain('Alta Criticidade');
    expect(popupHtml).toContain('A1');

    // Estrutura e título
    expect(popupHtml).toContain('Barragem B1');
    expect(popupHtml).toContain('Remoção de Material - Barragem B1');

    // Setor e Ação Corretiva
    expect(popupHtml).toContain('Infraestrutura de Mina');
    expect(popupHtml).toContain('Remoção de Material');

    // Detalhamento / Plano de Ação
    expect(popupHtml).toContain('As canaletas de escoamento pluvial');

    // Datas e Prazo
    expect(popupHtml).toContain('2025-06-04');
    expect(popupHtml).toContain('2025-06-12');
    expect(popupHtml).toContain('7 dias');

    // Coordenadas
    expect(popupHtml).toContain('-20.063056');
    expect(popupHtml).toContain('-44.113889');

    // Status
    expect(popupHtml).toContain('Concluído');

    // Botão de ação
    expect(popupHtml).toContain('Abrir Ficha do Chamado');
  });

  it('handles tickets with alternative field naming (proto, estr, crit, limite)', () => {
    const icon = createTicketDivIcon(sampleTicketMedio);
    expect(icon.options.html).toContain('⛮');
    expect(icon.options.html).toContain('#132638');
    expect(icon.options.html).toContain('#f59e0b'); // M2 is orange/amber

    const popupHtml = generateTicketBalloonPopup(sampleTicketMedio);
    expect(popupHtml).toContain('#132638');
    expect(popupHtml).toContain('M2');
    expect(popupHtml).toContain('Barragem B1');
    expect(popupHtml).toContain('Controle de Gramíneas');
  });

  it('generateTicketTooltip produces a concise preview with gear symbol and protocol', () => {
    const tooltip = generateTicketTooltip(sampleTicketBaixo);
    expect(tooltip).toContain('⛮');
    expect(tooltip).toContain('#132242');
    expect(tooltip).toContain('#10b981'); // B3 is green
  });
});

