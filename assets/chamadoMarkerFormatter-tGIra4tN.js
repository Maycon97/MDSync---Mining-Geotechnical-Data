function e(e){if(!e)return{code:`ND`,level:`Não Informado`,color:`#64748b`,bgGradient:`linear-gradient(135deg, #64748b 0%, #475569 100%)`,borderColor:`#94a3b8`,glow:`0 0 8px rgba(100, 116, 139, 0.6), 0 2px 6px rgba(0,0,0,0.5)`,prazoMaximo:`—`};let t=String(e.crit||e.criticidade||e.criticidadeNivel||e.severidade||``).trim().toUpperCase();return t.startsWith(`M`)||t.includes(`MED`)||t.includes(`ATEN`)||t.includes(`ALERT`)||t===`2`?{code:t.startsWith(`M`)&&t.length<=3?t:`M1`,level:`Média / Atenção`,color:`#f59e0b`,bgGradient:`linear-gradient(135deg, #f59e0b 0%, #c2410c 100%)`,borderColor:`#fde68a`,glow:`0 0 12px rgba(245, 158, 11, 0.8), 0 2px 6px rgba(0,0,0,0.6)`,prazoMaximo:`30 a 60 dias`}:t.startsWith(`A`)||t.includes(`ALT`)||t.includes(`CRIT`)||t.includes(`EMERG`)||t===`3`?{code:t.length<=3?t:`A3`,level:`Crítica / Alta`,color:`#ef4444`,bgGradient:`linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)`,borderColor:`#fca5a5`,glow:`0 0 12px rgba(239, 68, 68, 0.8), 0 2px 6px rgba(0,0,0,0.6)`,prazoMaximo:`1 a 15 dias`}:t.startsWith(`B`)||t.includes(`BAIX`)||t.includes(`NORM`)||t.includes(`MONIT`)||t===`1`?{code:t.length<=3?t:`B3`,level:`Baixa / Normal`,color:`#10b981`,bgGradient:`linear-gradient(135deg, #10b981 0%, #047857 100%)`,borderColor:`#86efac`,glow:`0 0 12px rgba(16, 185, 129, 0.8), 0 2px 6px rgba(0,0,0,0.6)`,prazoMaximo:`90 a 120 dias`}:{code:t.length<=3&&t?t:`R`,level:`Operacional`,color:`#0284c7`,bgGradient:`linear-gradient(135deg, #0284c7 0%, #0369a1 100%)`,borderColor:`#7dd3fc`,glow:`0 0 12px rgba(2, 132, 199, 0.8), 0 2px 6px rgba(0,0,0,0.6)`,prazoMaximo:`30 dias`}}function t(t,n=!1){if(!t)return``;let r=e(t),i=String(t.proto||t.protocolo||t.id||`—`).trim(),a=r.code;return`
    <div class="mdsync-chamado-marker-pill ${n?`is-selected`:``}" style="
      display: inline-flex;
      align-items: center;
      gap: 3px;
      background: ${r.bgGradient};
      color: #ffffff;
      border: ${n?`2.5px solid #38bdf8`:`1.8px solid ${r.borderColor}`};
      border-radius: 9999px;
      padding: 3px 8px 3px 6px;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      font-size: 11px;
      font-weight: 800;
      box-shadow: ${r.glow};
      cursor: pointer;
      white-space: nowrap;
      user-select: none;
      transform: translate(-50%, -50%);
      transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.18s ease;
    ">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 3px; flex-shrink: 0;">
  <circle cx="12" cy="12" r="3"></circle>
  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
</svg>
      <span style="letter-spacing: 0.3px; color: #ffffff;">#${i}</span>
      ${a?`
        <span style="
          background: rgba(0, 0, 0, 0.32);
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 9999px;
          padding: 1px 5px;
          margin-left: 4px;
          font-size: 9.5px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.1;
        ">${a}</span>
      `:``}
    </div>
  `.trim()}function n(t,n={}){if(!t)return`
      <div style="padding: 14px; font-family: 'Inter', sans-serif; color: #ffffff;">
        <p>Dados do chamado indisponíveis.</p>
      </div>
    `;let r=e(t),i=String(t.proto||t.protocolo||t.id||`—`).replace(/"/g,`&quot;`),a=String(t.estr||t.estrutura||`Complexo Itaminas`).replace(/"/g,`&quot;`),o=String(t.tipo||`Manutenção Geral`).replace(/"/g,`&quot;`),s=String(t.requerido||t.setorResponsavel||t.setor||t.areaResponsavel||`Manutenção Civil / Geotécnica`).replace(/"/g,`&quot;`),c=String(t.acaoCorretiva||t.titulo||`Inspeção e Reparo Geotécnico`).replace(/"/g,`&quot;`),l=String(t.planoAcao||t.descricao||t.observacoes||``).replace(/"/g,`&quot;`),u=String(t.status||t.statusCh||`Em Aberto`).replace(/"/g,`&quot;`),d=String(t.statusCh||t.etapa||``).replace(/"/g,`&quot;`);t.abertura||t.dataIdentificacao||t.identificacao||t.data;let f=t.limite||t.dataLimite||t.prazo||``,p=t.fotoAberturaUrl||t.foto||t.evidenciaUrl||``,m=t.lat!==void 0&&!isNaN(Number(t.lat))?Number(t.lat).toFixed(6):null,h=t.lon!==void 0&&!isNaN(Number(t.lon))?Number(t.lon).toFixed(6):null,g=``;if(f)try{let e=String(f).split(`-`);if(e.length===3){let t=new Date(Number(e[0]),Number(e[1])-1,Number(e[2])),n=new Date;n.setHours(0,0,0,0);let r=Math.ceil((t-n)/864e5);g=r<0?`<span style="background: rgba(239,68,68,0.22); color: #fca5a5; border: 1px solid rgba(239,68,68,0.5); padding: 2px 7px; border-radius: 9999px; font-size: 10px; font-weight: 800;">Vencido há ${Math.abs(r)}d</span>`:r<=5?`<span style="background: rgba(245,158,11,0.22); color: #fde68a; border: 1px solid rgba(245,158,11,0.5); padding: 2px 7px; border-radius: 9999px; font-size: 10px; font-weight: 800;">Vence em ${r}d</span>`:`<span style="background: rgba(16,185,129,0.22); color: #86efac; border: 1px solid rgba(16,185,129,0.5); padding: 2px 7px; border-radius: 9999px; font-size: 10px; font-weight: 800;">No prazo (${r}d)</span>`}}catch{}return`
    <div style="
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      font-size: 12px;
      line-height: 1.45;
      min-width: 280px;
      max-width: 330px;
      padding: 14px 16px;
      color: #f1f5f9;
      background: linear-gradient(180deg, rgba(14, 38, 74, 0.98) 0%, rgba(9, 23, 46, 0.99) 100%);
      border-radius: 12px;
    ">
      
      <!-- Topo: Protocolo e Criticidade -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="display: flex; align-items: center; gap: 5px;">
          <span style="color: ${r.color}; font-size: 15px; display: inline-flex; align-items: center;">⛮</span>
          <span style="font-size: 13.5px; font-weight: 800; color: #ffffff; letter-spacing: 0.3px;">
            Chamado #${i}
          </span>
        </div>
        
        <span style="
          background: ${r.bgGradient};
          color: #ffffff;
          border: 1px solid ${r.borderColor};
          padding: 2px 7px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.4px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          white-space: nowrap;
        ">
          ${r.code} · ${r.level}
        </span>
      </div>

      <!-- Estrutura Vinculada -->
      <div style="margin-bottom: 8px;">
        <div style="font-size: 13px; font-weight: 800; color: #38bdf8;">
          ${a}
        </div>
        <div style="font-size: 11px; color: #94a3b8;">
          Ativo / Tipo: <strong style="color: #cbd5e1;">${o}</strong>
        </div>
      </div>

      <!-- SETOR RESPONSÁVEL PELA MANUTENÇÃO (DESTAQUE REQUISITADO PELO USUÁRIO) -->
      <div style="
        margin: 8px 0;
        padding: 7px 10px;
        background: rgba(14, 165, 233, 0.12);
        border: 1px solid rgba(14, 165, 233, 0.35);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      ">
        <div style="font-size: 10px; font-weight: 800; color: #7dd3fc; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 4px;">
          <span>🏢</span>
          <span>Setor Responsável pela Manutenção:</span>
        </div>
        <div style="font-size: 12px; font-weight: 700; color: #ffffff;">
          ${s}
        </div>
      </div>

      <!-- Ação Corretiva Solicitada -->
      <div style="margin: 8px 0;">
        <div style="font-size: 10.5px; color: #94a3b8; font-weight: 600;">Ação Corretiva Requerida:</div>
        <div style="font-size: 12px; font-weight: 700; color: #f8fafc; margin-top: 1px;">
          ${c}
        </div>
      </div>

      <!-- Plano de Ação Detalhado -->
      ${l?`
        <div style="
          margin: 6px 0;
          padding: 6px 9px;
          background: rgba(255, 255, 255, 0.04);
          border-left: 3px solid ${r.color};
          border-radius: 4px;
          font-size: 11px;
          color: #e2e8f0;
          font-style: italic;
          line-height: 1.35;
          max-height: 75px;
          overflow-y: auto;
        ">
          “${l}”
        </div>
      `:``}

      <!-- Status e Etapa -->
      <div style="
        margin-top: 8px;
        padding-top: 6px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        flex-wrap: wrap;
      ">
        <div style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: #94a3b8;">
          <span>Status:</span>
          <strong style="color: #ffffff;">${u}</strong>
        </div>
        ${d?`
          <div style="font-size: 10.5px; color: #7dd3fc;">
            Etapa: <strong style="color: #e0f2fe;">${d}</strong>
          </div>
        `:``}
      </div>

      <!-- Prazos & SLA -->
      ${f?`
        <div style="margin-top: 6px; display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #94a3b8;">
          <span>Limite: <strong style="color: #f1f5f9;">${(e=>{if(!e)return`—`;let t=String(e).split(`-`);return t.length===3?`${t[2]}/${t[1]}/${t[0]}`:e})(f)}</strong></span>
          ${g}
        </div>
      `:``}

      <!-- Coordenadas GPS -->
      ${m&&h?`
        <div style="margin-top: 5px; font-size: 10px; color: #64748b; font-family: monospace;">
          GPS: ${m}, ${h} (WGS-84)
        </div>
      `:``}

      <!-- Foto da Anomalia / Manutenção -->
      ${p?`
        <div class="popup-photo-wrapper chamados-popup-photo-card" style="
          margin-top: 8px;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.18);
          position: relative;
          background: rgba(0,0,0,0.6);
        ">
          <img 
            src="${p}" 
            alt="Foto Manutenção" 
            loading="lazy" 
            onerror="this.onerror=null; var w=this.closest('.popup-photo-wrapper'); if(w) w.style.display='none';" 
            style="width: 100%; height: 95px; object-fit: cover; display: block;" 
          />
          <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 3px 6px; background: rgba(0,0,0,0.75); display: flex; justify-content: space-between; font-size: 9px; color: #cbd5e1;">
            <span>Evidência Fotográfica</span>
            <span style="color: #38bdf8; font-weight: 700;">Foto de Campo</span>
          </div>
        </div>
      `:``}

      <!-- Botão para Navegar / Abrir Ficha -->
      <div style="margin-top: 10px; text-align: center;">
        <button
          onclick="window.__handleSelectChamadoDetail ? window.__handleSelectChamadoDetail('${i}') : null"
          style="
            width: 100%;
            padding: 5px 10px;
            border-radius: 6px;
            border: 1px solid rgba(56, 189, 248, 0.4);
            background: linear-gradient(135deg, rgba(2, 132, 199, 0.8) 0%, rgba(14, 165, 233, 0.8) 100%);
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            box-shadow: 0 2px 8px rgba(2, 132, 199, 0.4);
          "
        >
          <span>⛮</span>
          <span>Ver Ficha Completa da Manutenção</span>
        </button>
      </div>

    </div>
  `.trim()}export{n,t};