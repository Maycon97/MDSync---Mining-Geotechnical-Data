import{f as e}from"./index-Bf79uIXT.js";var t=e=>e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`),n=e=>{let t=String(e||``).trim().toUpperCase();return t.startsWith(`A`)||t.includes(`ALERTA`)||t.includes(`EMERG`)||t.includes(`CRITIC`)||t.includes(`ALTA`)||t===`CRÍTICA`||t===`CRITICA`?{level:`ALTA`,code:t.startsWith(`A`)&&t.length<=3?t:t.includes(`A1`)?`A1`:t.includes(`A2`)?`A2`:`ALTA`,label:`Alta Criticidade`,color:`#ef4444`,gradient:`linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)`,glow:`0 4px 14px rgba(239, 68, 68, 0.65), 0 0 10px rgba(239, 68, 68, 0.45)`,badgeBg:`rgba(239, 68, 68, 0.2)`,badgeBorder:`#ef4444`,badgeText:`#fca5a5`}:t.startsWith(`M`)||t.includes(`MED`)||t.includes(`MÉD`)||t.includes(`ATEN`)||t.includes(`MODERAD`)?{level:`MEDIA`,code:t.startsWith(`M`)&&t.length<=3?t:t.includes(`M1`)?`M1`:t.includes(`M2`)?`M2`:`MÉDIA`,label:`Média Criticidade`,color:`#f59e0b`,gradient:`linear-gradient(135deg, #f59e0b 0%, #d97706 100%)`,glow:`0 4px 14px rgba(245, 158, 11, 0.65), 0 0 10px rgba(245, 158, 11, 0.45)`,badgeBg:`rgba(245, 158, 11, 0.2)`,badgeBorder:`#f59e0b`,badgeText:`#fde68a`}:t.startsWith(`B`)||t.includes(`BAIX`)||t.includes(`NORM`)||t.includes(`ROTIN`)||t.includes(`PREVENT`)?{level:`BAIXA`,code:t.startsWith(`B`)&&t.length<=3?t:t.includes(`B1`)?`B1`:t.includes(`B2`)?`B2`:`BAIXA`,label:`Baixa Criticidade`,color:`#10b981`,gradient:`linear-gradient(135deg, #10b981 0%, #047857 100%)`,glow:`0 4px 14px rgba(16, 185, 129, 0.65), 0 0 10px rgba(16, 185, 129, 0.45)`,badgeBg:`rgba(16, 185, 129, 0.2)`,badgeBorder:`#10b981`,badgeText:`#6ee7b7`}:{level:`INFO`,code:t||`INFO`,label:t||`Informativo`,color:`#0284c7`,gradient:`linear-gradient(135deg, #0284c7 0%, #0369a1 100%)`,glow:`0 4px 14px rgba(2, 132, 199, 0.65), 0 0 10px rgba(2, 132, 199, 0.45)`,badgeBg:`rgba(2, 132, 199, 0.2)`,badgeBorder:`#0284c7`,badgeText:`#bae6fd`}},r=e=>{let t=String(e||``).toLowerCase();return t.includes(`aprovado`)||t.includes(`conclu`)||t.includes(`finaliz`)||t.includes(`realizado`)?{textColor:`#86efac`,bgColor:`rgba(34, 197, 94, 0.2)`,borderColor:`rgba(34, 197, 94, 0.45)`,dotColor:`#22c55e`,label:e||`Concluído`}:t.includes(`pendente`)||t.includes(`aberto`)||t.includes(`andamento`)||t.includes(`execu`)?{textColor:`#fef08a`,bgColor:`rgba(234, 179, 8, 0.22)`,borderColor:`rgba(234, 179, 8, 0.5)`,dotColor:`#eab308`,label:e||`Em Aberto / Execução`}:t.includes(`cancel`)||t.includes(`reprovado`)?{textColor:`#fca5a5`,bgColor:`rgba(239, 68, 68, 0.2)`,borderColor:`rgba(239, 68, 68, 0.45)`,dotColor:`#ef4444`,label:e||`Cancelado`}:{textColor:`#7dd3fc`,bgColor:`rgba(14, 165, 233, 0.18)`,borderColor:`rgba(14, 165, 233, 0.45)`,dotColor:`#0ea5e9`,label:e||`Ativo`}},i=e=>({raw:e,protocolo:e.protocolo||e.proto||e.id||`S/N`,critInfo:n(e.criticidade||e.crit||e.criticidadeNivel||`Média`),statusStyle:r(e.status||e.statusCh||`Aberto`),titulo:e.titulo||e.acaoCorretiva||(e.proto?`Chamado #${e.proto}`:`Manutenção Geotécnica`),estrutura:e.estrutura||e.estr||`Complexo Itaminas`,tipo:e.tipo||``,requerido:e.requerido||e.setorResponsavel||e.setor||``,acao:e.acaoCorretiva||e.acaoRecomendada||e.acao||``,descricao:e.planoAcao||e.descricao||e.observacoes||``,dataIdent:e.dataIdentificacao||e.identificacao||e.abertura||e.data||``,dataLimite:e.dataLimite||e.limite||e.prazoSla||``,prazoDias:e.prazoDias||e.prazoEstimado||``,foto:e.fotoAberturaUrl||e.fotoFinalizacaoUrl||e.fotoUrl||e.foto||``,lat:e.lat,lon:e.lon}),a=(n,r=!1,a=e)=>{let{protocolo:o,critInfo:s}=i(n);return new a({className:`custom-fluig-ticket-marker`,html:`
    <div class="custom-ticket-marker-pin ${r?`is-selected`:``}" style="
      background: ${s.gradient};
      color: #ffffff;
      border: ${r?`2.5px solid #38bdf8`:`2px solid rgba(255, 255, 255, 0.95)`};
      border-radius: 20px;
      padding: 3px 8px 3px 6px;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      font-size: 11px;
      font-weight: 800;
      box-shadow: ${s.glow};
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
      <span style="letter-spacing: 0.2px; font-weight: 800;">#${t(o)}</span>

      <!-- Badge de Criticidade Compacto -->
      ${s.code?`
        <span style="
          background: rgba(0, 0, 0, 0.35);
          border-radius: 10px;
          padding: 1px 5px;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.4px;
          margin-left: 1px;
        ">${t(s.code)}</span>
      `:``}
    </div>
  `,iconSize:[0,0]})},o=e=>{let{protocolo:n,critInfo:r,statusStyle:a,titulo:o,estrutura:s,tipo:c,requerido:l,acao:u,descricao:d,dataIdent:f,dataLimite:p,prazoDias:m,foto:h,lat:g,lon:_}=i(e),v=t(n),y=t(o),b=t(s),x=t(c),S=t(l),C=t(u),w=t(d),T=t(f),E=t(p),D=t(h);return`
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
            background: ${r.gradient};
            color: #ffffff;
            font-size: 12px;
            font-weight: 900;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          " title="Manutenção Geotécnica">⛮</span>
          <span style="font-size: 13px; font-weight: 800; color: #38bdf8; letter-spacing: 0.3px;">
            #${v}
          </span>
        </div>
        <span style="
          background: ${r.badgeBg};
          border: 1px solid ${r.badgeBorder};
          color: ${r.badgeText};
          padding: 2px 7px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        ">
          ${t(r.label)} (${t(r.code)})
        </span>
      </div>

      <!-- Título do Chamado e Estrutura -->
      <div style="margin-bottom: 6px;">
        <div style="font-weight: 800; font-size: 13px; color: #ffffff; line-height: 1.3;">
          ${y}
        </div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
          Estrutura: <span style="color: #cbd5e1; font-weight: 700;">${b}</span>
          ${x?` • <span style="color: #64748b;">${x}</span>`:``}
        </div>
      </div>

      <!-- Setor Requerido -->
      ${S?`
        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
          Setor Requerido: <span style="color: #e2e8f0; font-weight: 600;">${S}</span>
        </div>
      `:``}

      <!-- Ação Corretiva / Recomendada -->
      ${C?`
        <div style="margin: 6px 0; padding: 6px 9px; background: rgba(56, 189, 248, 0.08); border-left: 3px solid #38bdf8; border-radius: 4px; font-size: 11px; color: #e0f2fe; font-style: italic; line-height: 1.35;">
          <strong>Ação:</strong> “${C}”
        </div>
      `:``}

      <!-- Detalhamento da Anomalia / Plano de Ação -->
      ${w?`
        <div style="margin: 6px 0; padding: 6px 8px; background: rgba(15, 23, 42, 0.6); border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.08); font-size: 11px; color: #cbd5e1; line-height: 1.4; max-height: 90px; overflow-y: auto;">
          <span style="color: #94a3b8; font-size: 10px; font-weight: 700; text-transform: uppercase; display: block; margin-bottom: 2px;">Detalhamento da Anomalia:</span>
          ${w}
        </div>
      `:``}

      <!-- Status do Chamado -->
      <div style="margin-top: 8px; padding-top: 7px; border-top: 1px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: space-between; gap: 6px;">
        <span style="font-size: 11px; color: #94a3b8; font-weight: 600;">Status:</span>
        <span style="background: ${a.bgColor}; border: 1px solid ${a.borderColor}; color: ${a.textColor}; padding: 2px 8px; border-radius: 9999px; font-size: 10.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;">
          <span class="chamados-status-dot-pulse" style="width: 6px; height: 6px; border-radius: 50%; background: ${a.dotColor}; display: inline-block;"></span>
          <span>${t(a.label)}</span>
        </span>
      </div>

      <!-- Datas & Prazo Limite -->
      <div style="margin-top: 6px; display: flex; flex-direction: column; gap: 3px; font-size: 10.5px; color: #94a3b8;">
        ${T?`<div>Identificado em: <strong style="color: #e2e8f0;">${T}</strong></div>`:``}
        ${E?`
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span>Prazo Limite: <strong style="color: #f1f5f9;">${E}</strong></span>
            ${m?`<span style="font-size: 10px; color: #38bdf8;">(${m} dias)</span>`:``}
          </div>
        `:``}
      </div>

      <!-- Coordenadas Georreferenciadas WGS-84 -->
      ${g!==void 0&&_!==void 0?`
        <div style="margin-top: 6px; padding: 4px 6px; background: rgba(0, 0, 0, 0.25); border-radius: 4px; font-size: 10px; font-family: monospace; color: #94a3b8; display: flex; align-items: center; justify-content: space-between;">
          <span>Lat: ${Number(g).toFixed(6)}</span>
          <span>Lon: ${Number(_).toFixed(6)}</span>
        </div>
      `:``}

      <!-- Foto da Anomalia -->
      ${D?`
        <div class="popup-photo-wrapper chamados-popup-photo-card" style="margin-top: 8px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.14); position: relative; background: rgba(0,0,0,0.5); cursor: pointer;" onclick="if(window.__openPhotoModal){window.__openPhotoModal('${D}', 'Chamado #${v} · Foto da Anomalia', '${b}');}">
          <img 
            src="${D}" 
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
      `:``}

      <!-- Botão de Ação: Abrir Ficha do Chamado -->
      <button 
        type="button" 
        class="chamados-popup-btn" 
        onclick="if(window.__openTicketDetail){window.__openTicketDetail('${v}');}else if(window.__navigateToChamados){window.__navigateToChamados('${v}');}" 
        style="width: 100%; margin-top: 9px; padding: 7px 10px; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; border: 1px solid rgba(255,255,255,0.22); border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 10px rgba(2,132,199,0.38);"
      >
        <span>Abrir Ficha do Chamado</span>
        <span style="font-size: 12px;">→</span>
      </button>

    </div>
  `},s=e=>{let{protocolo:n,critInfo:r,titulo:a,estrutura:o}=i(e);return`
    <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; font-size: 11px; padding: 3px 6px; color: #ffffff; max-width: 250px;">
      <div style="display: flex; align-items: center; gap: 4px; font-weight: 800; color: ${r.color};">
        <span>⛮</span> <span>Chamado #${t(n)}</span>
        <span style="font-size: 9px; padding: 1px 4px; border-radius: 4px; background: ${r.badgeBg}; color: ${r.badgeText}; border: 1px solid ${r.badgeBorder};">${t(r.code)}</span>
      </div>
      <div style="font-weight: 600; margin-top: 3px; color: #f8fafc; line-height: 1.25;">
        ${t(a)}
      </div>
      <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">
        ${t(o)} • <span style="color: #38bdf8;">Clique para abrir o balão informativo</span>
      </div>
    </div>
  `};export{o as n,s as r,a as t};