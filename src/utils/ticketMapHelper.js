/**
 * ticketMapHelper.js
 * Utilitários unificados para formatação de marcações de chamados geotécnicos no mapa:
 * - Símbolo de engrenagem ⛮ indicando manutenção
 * - Cor correspondente ao nível de criticidade (Alta/Crítica = Vermelho, Média/Atenção = Âmbar, Baixa/Preventiva = Verde)
 * - Número do protocolo do chamado
 * - Balão informativo (Leaflet Popup) com todas as informações completas do chamado
 */

import { DivIcon } from './leafletCompat';

/**
 * Escapa strings para inserção segura em HTML
 */
export const escapeHtml = (str) => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Normaliza e resolve as cores e estilos de acordo com o nível de criticidade do chamado
 */
export const getTicketCriticalityInfo = (criticidadeRaw) => {
  const c = String(criticidadeRaw || '').trim().toUpperCase();

  // Nível Alto / Crítico / Emergência / A1, A2, A3
  if (
    c.startsWith('A') || 
    c.includes('ALERTA') || 
    c.includes('EMERG') || 
    c.includes('CRITIC') || 
    c.includes('ALTA') || 
    c === 'CRÍTICA' || 
    c === 'CRITICA'
  ) {
    const code = (c.startsWith('A') && c.length <= 3) ? c : (c.includes('A1') ? 'A1' : (c.includes('A2') ? 'A2' : 'ALTA'));
    return {
      level: 'ALTA',
      code,
      label: 'Alta Criticidade',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
      glow: '0 4px 14px rgba(239, 68, 68, 0.65), 0 0 10px rgba(239, 68, 68, 0.45)',
      badgeBg: 'rgba(239, 68, 68, 0.2)',
      badgeBorder: '#ef4444',
      badgeText: '#fca5a5'
    };
  }

  // Nível Médio / Atenção / Moderado / M1, M2, M3
  if (
    c.startsWith('M') || 
    c.includes('MED') || 
    c.includes('MÉD') || 
    c.includes('ATEN') || 
    c.includes('MODERAD')
  ) {
    const code = (c.startsWith('M') && c.length <= 3) ? c : (c.includes('M1') ? 'M1' : (c.includes('M2') ? 'M2' : 'MÉDIA'));
    return {
      level: 'MEDIA',
      code,
      label: 'Média Criticidade',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      glow: '0 4px 14px rgba(245, 158, 11, 0.65), 0 0 10px rgba(245, 158, 11, 0.45)',
      badgeBg: 'rgba(245, 158, 11, 0.2)',
      badgeBorder: '#f59e0b',
      badgeText: '#fde68a'
    };
  }

  // Nível Baixo / Normal / Preventivo / B1, B2, B3
  if (
    c.startsWith('B') || 
    c.includes('BAIX') || 
    c.includes('NORM') || 
    c.includes('ROTIN') || 
    c.includes('PREVENT')
  ) {
    const code = (c.startsWith('B') && c.length <= 3) ? c : (c.includes('B1') ? 'B1' : (c.includes('B2') ? 'B2' : 'BAIXA'));
    return {
      level: 'BAIXA',
      code,
      label: 'Baixa Criticidade',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      glow: '0 4px 14px rgba(16, 185, 129, 0.65), 0 0 10px rgba(16, 185, 129, 0.45)',
      badgeBg: 'rgba(16, 185, 129, 0.2)',
      badgeBorder: '#10b981',
      badgeText: '#6ee7b7'
    };
  }

  // Padrão Informativo
  return {
    level: 'INFO',
    code: c || 'INFO',
    label: c || 'Informativo',
    color: '#0284c7',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    glow: '0 4px 14px rgba(2, 132, 199, 0.65), 0 0 10px rgba(2, 132, 199, 0.45)',
    badgeBg: 'rgba(2, 132, 199, 0.2)',
    badgeBorder: '#0284c7',
    badgeText: '#bae6fd'
  };
};

/**
 * Resolve estilização de status operacional do chamado
 */
export const getTicketStatusStyle = (statusRaw) => {
  const norm = String(statusRaw || '').toLowerCase();
  if (norm.includes('aprovado') || norm.includes('conclu') || norm.includes('finaliz') || norm.includes('realizado')) {
    return {
      textColor: '#86efac',
      bgColor: 'rgba(34, 197, 94, 0.2)',
      borderColor: 'rgba(34, 197, 94, 0.45)',
      dotColor: '#22c55e',
      label: statusRaw || 'Concluído'
    };
  }
  if (norm.includes('pendente') || norm.includes('aberto') || norm.includes('andamento') || norm.includes('execu')) {
    return {
      textColor: '#fef08a',
      bgColor: 'rgba(234, 179, 8, 0.22)',
      borderColor: 'rgba(234, 179, 8, 0.5)',
      dotColor: '#eab308',
      label: statusRaw || 'Em Aberto / Execução'
    };
  }
  if (norm.includes('cancel') || norm.includes('reprovado')) {
    return {
      textColor: '#fca5a5',
      bgColor: 'rgba(239, 68, 68, 0.2)',
      borderColor: 'rgba(239, 68, 68, 0.45)',
      dotColor: '#ef4444',
      label: statusRaw || 'Cancelado'
    };
  }
  return {
    textColor: '#7dd3fc',
    bgColor: 'rgba(14, 165, 233, 0.18)',
    borderColor: 'rgba(14, 165, 233, 0.45)',
    dotColor: '#0ea5e9',
    label: statusRaw || 'Ativo'
  };
};

/**
 * Normaliza os dados de qualquer chamado (formato PCMI fluigTickets ou controleChamadosData)
 */
export const normalizeTicketData = (t) => {
  const protocolo = t.protocolo || t.proto || t.id || 'S/N';
  const criticidadeRaw = t.criticidade || t.crit || t.criticidadeNivel || 'Média';
  const critInfo = getTicketCriticalityInfo(criticidadeRaw);
  const statusRaw = t.status || t.statusCh || 'Aberto';
  const statusStyle = getTicketStatusStyle(statusRaw);

  const titulo = t.titulo || t.acaoCorretiva || (t.proto ? `Chamado #${t.proto}` : 'Manutenção Geotécnica');
  const estrutura = t.estrutura || t.estr || 'Complexo Itaminas';
  const tipo = t.tipo || '';
  const requerido = t.requerido || t.setorResponsavel || t.setor || '';
  const acao = t.acaoCorretiva || t.acaoRecomendada || t.acao || '';
  const descricao = t.planoAcao || t.descricao || t.observacoes || '';
  const dataIdent = t.dataIdentificacao || t.identificacao || t.abertura || t.data || '';
  const dataLimite = t.dataLimite || t.limite || t.prazoSla || '';
  const prazoDias = t.prazoDias || t.prazoEstimado || '';
  const foto = t.fotoAberturaUrl || t.fotoFinalizacaoUrl || t.fotoUrl || t.foto || '';

  return {
    raw: t,
    protocolo,
    critInfo,
    statusStyle,
    titulo,
    estrutura,
    tipo,
    requerido,
    acao,
    descricao,
    dataIdent,
    dataLimite,
    prazoDias,
    foto,
    lat: t.lat,
    lon: t.lon
  };
};

/**
 * Cria o DivIcon oficial com o símbolo de engrenagem ⛮,
 * cor da criticidade e o número do protocolo do chamado.
 */
export const createTicketDivIcon = (ticket, isSelected = false, CustomDivIcon = DivIcon) => {
  const data = normalizeTicketData(ticket);
  const { protocolo, critInfo } = data;

  const html = `
    <div class="custom-ticket-marker-pin ${isSelected ? 'is-selected' : ''}" style="
      background: ${critInfo.gradient};
      color: #ffffff;
      border: ${isSelected ? '2.5px solid #38bdf8' : '2px solid rgba(255, 255, 255, 0.95)'};
      border-radius: 20px;
      padding: 3px 8px 3px 6px;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      font-size: 11px;
      font-weight: 800;
      box-shadow: ${critInfo.glow};
      display: inline-flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
      cursor: pointer;
      transform: translate(-50%, -50%);
      user-select: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    ">
      <!-- Símbolo de Engrenagem ⛮ indicando Manutenção Geotécnica -->
      <span class="ticket-gear-spin" style="
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 17px;
        height: 17px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.28);
        font-size: 11px;
        line-height: 1;
        font-weight: 900;
        filter: drop-shadow(0 1px 1px rgba(0,0,0,0.4));
      " title="Manutenção Geotécnica">⛮</span>

      <!-- Número do Protocolo do Chamado -->
      <span style="letter-spacing: 0.2px; font-weight: 800;">#${escapeHtml(protocolo)}</span>

      <!-- Badge de Criticidade Compacto -->
      ${critInfo.code ? `
        <span style="
          background: rgba(0, 0, 0, 0.35);
          border-radius: 10px;
          padding: 1px 5px;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.4px;
          margin-left: 1px;
        ">${escapeHtml(critInfo.code)}</span>
      ` : ''}
    </div>
  `;

  return new CustomDivIcon({
    className: 'custom-fluig-ticket-marker',
    html,
    iconSize: [0, 0]
  });
};

/**
 * Gera o conteúdo HTML do Balão Informativo (Leaflet Popup) com todas as informações do chamado
 */
export const generateTicketBalloonPopup = (ticket) => {
  const data = normalizeTicketData(ticket);
  const {
    protocolo,
    critInfo,
    statusStyle,
    titulo,
    estrutura,
    tipo,
    requerido,
    acao,
    descricao,
    dataIdent,
    dataLimite,
    prazoDias,
    foto,
    lat,
    lon
  } = data;

  const safeProto = escapeHtml(protocolo);
  const safeTitulo = escapeHtml(titulo);
  const safeEstrutura = escapeHtml(estrutura);
  const safeTipo = escapeHtml(tipo);
  const safeRequerido = escapeHtml(requerido);
  const safeAcao = escapeHtml(acao);
  const safeDescricao = escapeHtml(descricao);
  const safeDataIdent = escapeHtml(dataIdent);
  const safeDataLimite = escapeHtml(dataLimite);
  const safePhoto = escapeHtml(foto);

  return `
    <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; font-size: 12px; line-height: 1.45; min-width: 270px; max-width: 320px; padding: 12px 14px 14px 14px; color: #f1f5f9;">
      
      <!-- Cabeçalho com Protocolo, Ícone ⛮ de Manutenção e Nível de Criticidade -->
      <div style="padding-right: 26px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            border-radius: 6px;
            background: ${critInfo.gradient};
            color: #ffffff;
            font-size: 12px;
            font-weight: 900;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          " title="Manutenção Geotécnica">⛮</span>
          <span style="font-size: 13px; font-weight: 800; color: #38bdf8; letter-spacing: 0.3px;">
            #${safeProto}
          </span>
        </div>
        <span style="
          background: ${critInfo.badgeBg};
          border: 1px solid ${critInfo.badgeBorder};
          color: ${critInfo.badgeText};
          padding: 2px 7px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        ">
          ${escapeHtml(critInfo.label)} (${escapeHtml(critInfo.code)})
        </span>
      </div>

      <!-- Título do Chamado e Estrutura -->
      <div style="margin-bottom: 6px;">
        <div style="font-weight: 800; font-size: 13px; color: #ffffff; line-height: 1.3;">
          ${safeTitulo}
        </div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
          Estrutura: <span style="color: #cbd5e1; font-weight: 700;">${safeEstrutura}</span>
          ${safeTipo ? ` • <span style="color: #64748b;">${safeTipo}</span>` : ''}
        </div>
      </div>

      <!-- Setor Requerido -->
      ${safeRequerido ? `
        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
          Setor Requerido: <span style="color: #e2e8f0; font-weight: 600;">${safeRequerido}</span>
        </div>
      ` : ''}

      <!-- Ação Corretiva / Recomendada -->
      ${safeAcao ? `
        <div style="margin: 6px 0; padding: 6px 9px; background: rgba(56, 189, 248, 0.08); border-left: 3px solid #38bdf8; border-radius: 4px; font-size: 11px; color: #e0f2fe; font-style: italic; line-height: 1.35;">
          <strong>Ação:</strong> “${safeAcao}”
        </div>
      ` : ''}

      <!-- Detalhamento da Anomalia / Plano de Ação -->
      ${safeDescricao ? `
        <div style="margin: 6px 0; padding: 6px 8px; background: rgba(15, 23, 42, 0.6); border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.08); font-size: 11px; color: #cbd5e1; line-height: 1.4; max-height: 90px; overflow-y: auto;">
          <span style="color: #94a3b8; font-size: 10px; font-weight: 700; text-transform: uppercase; display: block; margin-bottom: 2px;">Detalhamento da Anomalia:</span>
          ${safeDescricao}
        </div>
      ` : ''}

      <!-- Status do Chamado -->
      <div style="margin-top: 8px; padding-top: 7px; border-top: 1px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: space-between; gap: 6px;">
        <span style="font-size: 11px; color: #94a3b8; font-weight: 600;">Status:</span>
        <span style="background: ${statusStyle.bgColor}; border: 1px solid ${statusStyle.borderColor}; color: ${statusStyle.textColor}; padding: 2px 8px; border-radius: 9999px; font-size: 10.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;">
          <span class="chamados-status-dot-pulse" style="width: 6px; height: 6px; border-radius: 50%; background: ${statusStyle.dotColor}; display: inline-block;"></span>
          <span>${escapeHtml(statusStyle.label)}</span>
        </span>
      </div>

      <!-- Datas & Prazo Limite -->
      <div style="margin-top: 6px; display: flex; flex-direction: column; gap: 3px; font-size: 10.5px; color: #94a3b8;">
        ${safeDataIdent ? `<div>Identificado em: <strong style="color: #e2e8f0;">${safeDataIdent}</strong></div>` : ''}
        ${safeDataLimite ? `
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span>Prazo Limite: <strong style="color: #f1f5f9;">${safeDataLimite}</strong></span>
            ${prazoDias ? `<span style="font-size: 10px; color: #38bdf8;">(${prazoDias} dias)</span>` : ''}
          </div>
        ` : ''}
      </div>

      <!-- Coordenadas Georreferenciadas WGS-84 -->
      ${(lat !== undefined && lon !== undefined) ? `
        <div style="margin-top: 6px; padding: 4px 6px; background: rgba(0, 0, 0, 0.25); border-radius: 4px; font-size: 10px; font-family: monospace; color: #94a3b8; display: flex; align-items: center; justify-content: space-between;">
          <span>Lat: ${Number(lat).toFixed(6)}</span>
          <span>Lon: ${Number(lon).toFixed(6)}</span>
        </div>
      ` : ''}

      <!-- Foto da Anomalia -->
      ${safePhoto ? `
        <div class="popup-photo-wrapper chamados-popup-photo-card" style="margin-top: 8px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.14); position: relative; background: rgba(0,0,0,0.5); cursor: pointer;" onclick="if(window.__openPhotoModal){window.__openPhotoModal('${safePhoto}', 'Chamado #${safeProto} · Foto da Anomalia', '${safeEstrutura}');}">
          <img 
            src="${safePhoto}" 
            alt="Foto da Anomalia" 
            loading="lazy" 
            onerror="this.onerror=null; var w=this.closest('.popup-photo-wrapper'); if(w) w.style.display='none';" 
            style="width: 100%; height: 95px; object-fit: cover; display: block;" 
          />
          <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 3px 6px; background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 100%); display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 9px; color: #e2e8f0; font-weight: 600;">Evidência Fotográfica</span>
            <span style="font-size: 9px; color: #38bdf8; font-weight: 700;">🔍 Ampliar</span>
          </div>
        </div>
      ` : ''}

      <!-- Botão de Ação: Abrir Ficha do Chamado -->
      <button 
        type="button" 
        class="chamados-popup-btn" 
        onclick="if(window.__openTicketDetail){window.__openTicketDetail('${safeProto}');}else if(window.__navigateToChamados){window.__navigateToChamados('${safeProto}');}" 
        style="width: 100%; margin-top: 9px; padding: 7px 10px; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; border: 1px solid rgba(255,255,255,0.22); border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 10px rgba(2,132,199,0.38);"
      >
        <span>Abrir Ficha do Chamado</span>
        <span style="font-size: 12px;">→</span>
      </button>

    </div>
  `;
};

/**
 * Gera tooltip rápido para exibição no hover do mouse
 */
export const generateTicketTooltip = (ticket) => {
  const data = normalizeTicketData(ticket);
  const { protocolo, critInfo, titulo, estrutura } = data;

  return `
    <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; font-size: 11px; padding: 3px 6px; color: #ffffff; max-width: 250px;">
      <div style="display: flex; align-items: center; gap: 4px; font-weight: 800; color: ${critInfo.color};">
        <span>⛮</span> <span>Chamado #${escapeHtml(protocolo)}</span>
        <span style="font-size: 9px; padding: 1px 4px; border-radius: 4px; background: ${critInfo.badgeBg}; color: ${critInfo.badgeText}; border: 1px solid ${critInfo.badgeBorder};">${escapeHtml(critInfo.code)}</span>
      </div>
      <div style="font-weight: 600; margin-top: 3px; color: #f8fafc; line-height: 1.25;">
        ${escapeHtml(titulo)}
      </div>
      <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">
        ${escapeHtml(estrutura)} • <span style="color: #38bdf8;">Clique para abrir o balão informativo</span>
      </div>
    </div>
  `;
};
