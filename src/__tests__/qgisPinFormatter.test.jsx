// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  QGIS_PIN_COLORS,
  resolveStructureDefaultColor,
  createQgisPinSvg,
  createQgisPinMarkerHtml
} from '../utils/qgisPinFormatter';
import { storageService } from '../services/storageService';
import { StructureLocationPickerModal } from '../components/StructureLocationPickerModal';

describe('Simbologia e Alfinetes Cartográficos QGIS Suite', () => {
  let container, root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  describe('QGIS_PIN_COLORS & resolveStructureDefaultColor', () => {
    it('disponibiliza paleta completa com as cores clássicas de geotecnia e mineração do QGIS', () => {
      expect(QGIS_PIN_COLORS.length).toBeGreaterThanOrEqual(8);
      const hexList = QGIS_PIN_COLORS.map(c => c.hex);
      expect(hexList).toContain('#ef4444'); // Vermelho QGIS
      expect(hexList).toContain('#0284c7'); // Azul Geotécnico
      expect(hexList).toContain('#f97316'); // Laranja Mineração
      expect(hexList).toContain('#10b981'); // Verde Ambiental
      expect(hexList).toContain('#8b5cf6'); // Roxo Cavas
      expect(hexList).toContain('#eab308'); // Amarelo Pátios
      expect(hexList).toContain('#06b6d4'); // Ciano SUMPs
    });

    it('preserva a cor personalizada definida pelo usuário (corMarcador / corPin / pinColor)', () => {
      expect(resolveStructureDefaultColor({ corMarcador: '#ec4899' })).toBe('#ec4899');
      expect(resolveStructureDefaultColor({ corPin: '#eab308' })).toBe('#eab308');
      expect(resolveStructureDefaultColor({ pinColor: '#10b981' })).toBe('#10b981');
    });

    it('resolve cores temáticas inteligentes de acordo com o tipo de estrutura quando não informada', () => {
      // Barragem -> Azul
      expect(resolveStructureDefaultColor({ tipo: 'BARRAGEM', nome: 'Barragem B1' })).toBe('#0284c7');
      // Pilha de Estéril (PDE) -> Laranja
      expect(resolveStructureDefaultColor({ tipo: 'PILHA', nome: 'Pilha Samambaia' })).toBe('#f97316');
      expect(resolveStructureDefaultColor({ sigla: 'PDE ES1' })).toBe('#f97316');
      // Cava -> Roxo
      expect(resolveStructureDefaultColor({ tipo: 'CAVA', nome: 'Cava Jangada' })).toBe('#8b5cf6');
      // Dique -> Verde
      expect(resolveStructureDefaultColor({ tipo: 'DIQUE', nome: 'Dique Auxiliar' })).toBe('#10b981');
      // SUMP -> Ciano
      expect(resolveStructureDefaultColor({ tipo: 'SUMP', nome: 'Sump 01' })).toBe('#06b6d4');
      // Fallback -> Vermelho QGIS
      expect(resolveStructureDefaultColor(null)).toBe('#ef4444');
      expect(resolveStructureDefaultColor({})).toBe('#ef4444');
    });
  });

  describe('createQgisPinSvg & createQgisPinMarkerHtml', () => {
    it('cria vetor SVG de alfinete com ponta de precisão na base e sombra no terreno', () => {
      const svg = createQgisPinSvg({
        color: '#f97316',
        sigla: 'ES1',
        isSelected: false
      });

      expect(svg).toContain('<svg');
      expect(svg).toContain('viewBox="0 0 32 44"');
      // Sombra na base da agulha (cy="42")
      expect(svg).toContain('<ellipse cx="16" cy="42"');
      // Gradiente e cor laranja
      expect(svg).toContain('#f97316');
      // Sigla no miolo
      expect(svg).toContain('ES');
    });

    it('adiciona anel pulsante e realce no alfinete quando isSelected é verdadeiro', () => {
      const svgSelected = createQgisPinSvg({
        color: '#0284c7',
        isSelected: true
      });

      expect(svgSelected).toContain('<animate attributeName="rx"');
      expect(svgSelected).toContain('#38bdf8');
    });

    it('createQgisPinMarkerHtml gera wrapper com classe qgis-structure-pin-wrapper e atributos corretos', () => {
      const html = createQgisPinMarkerHtml({
        sigla: 'SMB',
        nome: 'PDE Samambaia',
        corMarcador: '#ef4444'
      }, { isSelected: true });

      expect(html).toContain('qgis-structure-pin-wrapper');
      expect(html).toContain('is-selected');
      expect(html).toContain('title="PDE Samambaia (SMB)"');
      expect(html).toContain('#ef4444');
    });
  });

  describe('storageService e Persistência de Cor QGIS', () => {
    it('armazena e recupera a cor personalizada corMarcador de uma estrutura', () => {
      const testStructure = {
        id: 'TEST_EST_QGIS',
        sigla: 'TQG',
        nome: 'Estrutura Teste QGIS',
        tipo: 'CAVA',
        lat: -20.0888,
        lon: -44.1055,
        corMarcador: '#ec4899'
      };

      const saved = storageService.saveEstruturaEmpreendimento(testStructure);
      expect(saved).toBe(true);

      const list = storageService.getEstruturasEmpreendimento();
      const found = list.find(e => e.id === 'TEST_EST_QGIS' || e.sigla === 'TQG');
      expect(found).toBeDefined();
      expect(found.corMarcador).toBe('#ec4899');

      // Limpeza
      storageService.deleteEstruturaEmpreendimento('TEST_EST_QGIS');
    });

    it('garante que todas as estruturas carregadas pelo storageService possuem corMarcador válida', () => {
      const list = storageService.getEstruturasEmpreendimento();
      expect(list.length).toBeGreaterThan(0);
      list.forEach(est => {
        expect(est.corMarcador).toBeDefined();
        expect(typeof est.corMarcador).toBe('string');
        expect(est.corMarcador.startsWith('#')).toBe(true);
      });
    });
  });

  describe('StructureLocationPickerModal - Seletor de Cores QGIS', () => {
    it('renderiza os botões da paleta de cores QGIS e aciona onConfirm com a cor escolhida', async () => {
      const mockConfirm = vi.fn();
      const mockClose = vi.fn();

      await act(async () => {
        root.render(
          <StructureLocationPickerModal
            isOpen={true}
            onClose={mockClose}
            initialCoords={{ lat: -20.0825, lon: -44.1085 }}
            structureName="Nova Pilha Teste"
            structureSigla="NPT"
            initialColor="#f97316"
            onConfirm={mockConfirm}
          />
        );
      });

      // Verifica presença da seção de simbologia QGIS
      expect(container.textContent).toContain('Simbologia do Alfinete (Padrão QGIS)');

      // Localiza o botão da cor verde (#10b981) na paleta
      const greenBtn = container.querySelector('button[data-color="#10b981"]');
      expect(greenBtn).not.toBeNull();

      // Clica no botão verde
      await act(async () => {
        greenBtn.click();
      });

      // Confirma a localização
      const confirmBtn = container.querySelector('button.btn-primary');
      expect(confirmBtn).not.toBeNull();
      await act(async () => {
        confirmBtn.click();
      });

      expect(mockConfirm).toHaveBeenCalledTimes(1);
      const callArg = mockConfirm.mock.calls[0][0];
      expect(callArg.lat).toBe(-20.0825);
      expect(callArg.lon).toBe(-44.1085);
      expect(callArg.corMarcador).toBe('#10b981');
      expect(mockClose).toHaveBeenCalled();
    });
  });
});
