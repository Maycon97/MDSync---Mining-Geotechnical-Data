// ============================================================
// MDSync - Assistente & Motor de Inteligência Geotécnica
// ============================================================

export const aiGeotechService = {
  /**
   * Avalia uma leitura frente aos limites de projeto do instrumento
   */
  evaluateInstrument(instrument, readingValue) {
    if (!instrument) return { status: 'NORMAL', label: 'Estável', color: 'var(--geo-normal)' };

    // Se o instrumento tem Cota Topo e a leitura for de profundidade (típico de INA)
    let cotaCalculada = readingValue;
    if (instrument.tipo === 'INA' || instrument.tipo === 'PZ') {
      if (instrument.cotaTopo && readingValue < 100) {
        // leitura é a distância da boca do tubo ao espelho d'água
        cotaCalculada = Number((instrument.cotaTopo - readingValue).toFixed(3));
      }
    }

    const { limiteNormal, limiteAtencao, limiteAlerta, limiteEmergencia } = instrument;

    if (limiteEmergencia && cotaCalculada >= limiteEmergencia) {
      return {
        status: 'EMERGÊNCIA',
        cotaCalculada,
        label: 'Nível Crítico de Emergência',
        badgeClass: 'badge-emergencia',
        dotClass: 'dot-emergencia',
        color: 'var(--geo-emergencia)',
        descricao: `A cota medida (${cotaCalculada} m) atingiu ou superou o limite de Emergência (${limiteEmergencia} m).`,
        recomendacao: 'Acionar imediatamente o Plano de Ação de Emergência (PAEBM), notificar coordenação geotécnica e realizar contraprova em campo.',
        prioridade: 'Crítica'
      };
    }

    if (limiteAlerta && cotaCalculada >= limiteAlerta) {
      return {
        status: 'ALERTA',
        cotaCalculada,
        label: 'Nível de Alerta Geotécnico',
        badgeClass: 'badge-alerta',
        dotClass: 'dot-alerta',
        color: 'var(--geo-alerta)',
        descricao: `A cota medida (${cotaCalculada} m) ultrapassou o patamar de Alerta (${limiteAlerta} m).`,
        recomendacao: 'Intensificar frequência de leitura para regime diário, inspecionar talude de jusante e drenagem superficial.',
        prioridade: 'Alta'
      };
    }

    if (limiteAtencao && cotaCalculada >= limiteAtencao) {
      return {
        status: 'ATENÇÃO',
        cotaCalculada,
        label: 'Nível de Atenção',
        badgeClass: 'badge-atencao',
        dotClass: 'dot-atencao',
        color: 'var(--geo-atencao)',
        descricao: `A cota medida (${cotaCalculada} m) entrou na faixa de Atenção (${limiteAtencao} m).`,
        recomendacao: 'Monitorar evolução nas próximas 48h e correlacionar com a precipitação pluviométrica acumulada.',
        prioridade: 'Média'
      };
    }

    return {
      status: 'NORMAL',
      cotaCalculada,
      label: 'Operação Normal',
      badgeClass: 'badge-normal',
      dotClass: 'dot-normal',
      color: 'var(--geo-normal)',
      descricao: `A cota medida (${cotaCalculada} m) está abaixo dos limites de controle cadastrados.`,
      recomendacao: 'Manter rotina padrão de leituras conforme cronograma da Portaria ANM.',
      prioridade: 'Baixa'
    };
  },

  /**
   * Gera parecer técnico estruturado de estabilidade geotécnica
   */
  generateStabilityReport({ estrutura, instrumentos = [], leituras = [], anomalias = [], pluviometria = [] }) {
    const totalInst = instrumentos.length;
    const instCriticos = instrumentos.filter(i => i.statusCalculado === 'EMERGÊNCIA' || i.statusCalculado === 'ALERTA');
    const instAtencao = instrumentos.filter(i => i.statusCalculado === 'ATENÇÃO');
    const anomaliasAtivas = anomalias.filter(a => a.estrutura === estrutura || estrutura === 'TODAS');

    // Chuva acumulada recente (últimos 7 dias)
    const ultimaChuva = pluviometria.length > 0 ? pluviometria[pluviometria.length - 1] : { precipitacaoMm: 0, acumulado7Dias: 0 };
    const acumulado7d = ultimaChuva.acumulado7Dias || 0;

    let nivelGeral = 'Estável';
    let classeAlerta = 'badge-normal';
    let recomendacaoGeral = 'Manter rotina de inspeção ordinária quinzenal.';

    if (instCriticos.length > 0) {
      nivelGeral = 'Atenção Redobrada / Crítico';
      classeAlerta = 'badge-emergencia';
      recomendacaoGeral = `Revisar imediatamente os instrumentos [${instCriticos.map(i => i.tipo + '-' + i.id).join(', ')}] com inspeção presencial no pé do maciço.`;
    } else if (instAtencao.length > 0 || anomaliasAtivas.length > 0) {
      nivelGeral = 'Atenção Operacional';
      classeAlerta = 'badge-atencao';
      recomendacaoGeral = `Acompanhar instrumentos em atenção [${instAtencao.map(i => i.tipo + '-' + i.id).join(', ')}] e verificar drenagens.`;
    }

    const dataHoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return {
      titulo: `Parecer Técnico Geotécnico Preliminar - ${estrutura === 'TODAS' ? 'Geral do Complexo Itaminas' : estrutura}`,
      dataEmissao: dataHoje,
      classificacao: nivelGeral,
      classeAlerta,
      resumoMetrico: {
        totalInstrumentos: totalInst,
        instrumentosNormais: totalInst - instCriticos.length - instAtencao.length,
        instrumentosAtencao: instAtencao.length,
        instrumentosCriticos: instCriticos.length,
        anomaliasAbertas: anomaliasAtivas.length,
        pluviometria7d: `${acumulado7d} mm`
      },
      diagnosticoTecnico: `O monitoramento piezométrico e hidrométrico da estrutura indica condições gerais de ${nivelGeral.toLowerCase()}. O regime de percolação interna está sendo acompanhado pelas seções de instrumentação. Foram registradas precipitações acumuladas de ${acumulado7d} mm nos últimos 7 dias, compatíveis com a sazonalidade regional do Quadrilátero Ferrífero.`,
      pontosAtencao: instCriticos.concat(instAtencao).map(i => ({
        instrumento: `${i.tipo} ${i.id}`,
        secao: i.secao || 'Geral',
        status: i.statusCalculado,
        ultimaCota: i.ultimaCota ? `${i.ultimaCota} m` : 'Sem leitura recente',
        limiteAtencao: i.limiteAtencao ? `${i.limiteAtencao} m` : '-',
        limiteEmergencia: i.limiteEmergencia ? `${i.limiteEmergencia} m` : '-'
      })),
      acoesRecomendadas: [
        recomendacaoGeral,
        'Verificar limpeza e integridade das canaletas de crista, bermas e bacias de amortecimento.',
        'Assegurar calibração e desobstrução dos medidores de vazão (MV) e vertedouros (VT).',
        'Validar envio de relatórios de conformidade e integridade no SIGBM (ANM).'
      ]
    };
  }
};
