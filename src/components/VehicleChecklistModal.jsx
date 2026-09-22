import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Truck, 
  MapPin, 
  Camera, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  PenTool, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft,
  Gauge,
  Calendar,
  User,
  ShieldCheck,
  ClipboardList,
  UploadCloud,
  Globe,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const VehicleChecklistModal = ({ isOpen, onClose, onSave, currentUser, initialMode = 'nativo' }) => {
  const [formMode, setFormMode] = useState(initialMode);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setFormMode(initialMode);
    }
  }, [isOpen, initialMode]);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);

  // Lista oficial de placas cadastradas no Survey123 Itaminas
  const VEHICLE_PLATES = [
    { placa: 'PZB-1G94', modelo: 'Toyota Hilux 4x4 (Geotecnia Operacional)' },
    { placa: 'TXY-7J22', modelo: 'Mitsubishi L200 Triton 4x4 (Campo/Piezometria)' },
    { placa: 'TEQ-1E02', modelo: 'Ford Ranger 4x4 (Supervisão Geotécnica)' },
    { placa: 'TEQ-1E17', modelo: 'Toyota Hilux 4x4 (Apoio Topografia & Radar)' },
    { placa: 'Outro', modelo: 'Outro Veículo / Terceiro' }
  ];

  // Estado completo do formulário oficial de 4 páginas
  const [formData, setFormData] = useState({
    // Página 1: Identificação
    data_e_hora: new Date().toISOString().slice(0, 16),
    condutor: currentUser?.nome || 'Carlos Eduardo Mendes',
    lat: -20.063818,
    lon: -44.114360,
    field_47: 'PZB-1G94', // Placa
    outro: '',
    hod_metro_km_atual: 84520,
    registro_do_painel: '',

    // Página 2: Itens de Segurança Obrigatório (OK / Atenção / Crítico)
    field_35_gua_no_limpador: 'OK',
    itens_de_seguran_a_obrigat_rio: 'OK', // Bandeirola de sinalização
    field_35_buzina: 'OK',
    itens_de_seguran_a_obrigat_rio_: 'OK', // Cintos de segurança
    field_35_10: 'OK', // Documentação válida (CRLV + CNH + Credencial)
    field_35_freios: 'OK',
    field_35_5: 'OK', // Giroflex
    field_35_6: 'OK', // Pneus + Estepe
    field_35_7: 'OK', // Kit de sinalização (Macaco, chave de roda, triângulo)
    foto_seguranca: '',

    // Página 3: Condições Gerais (OK / Atenção / Crítico)
    field_36_calibragem_dos_pneus: 'OK',
    field_36_ilumina_o_e_sinaliza_o: 'OK', // faróis, setas, freio, ré e lanternas
    field_36_lataria_pintura: 'OK',
    field_36_limpeza_geral: 'OK',
    field_36_n_vel_do_leo_do_motor: 'OK',
    field_36_n_vel_de_gual_quido_de: 'OK', // Nível de água/arrefecimento
    field_36_para_brisa: 'OK',
    field_36_vazamentos_aparentes: 'OK',
    foto_condicoes: '',

    // Página 4: Observações e Finalização
    descreva_aqui: '',
    registros_complementares: '',
    assinatura: ''
  });

  // Capturar coordenadas GPS do dispositivo
  const handleGetGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({
            ...prev,
            lat: Number(pos.coords.latitude.toFixed(6)),
            lon: Number(pos.coords.longitude.toFixed(6))
          }));
        },
        () => {
          setFormData(prev => ({
            ...prev,
            lat: -20.063818,
            lon: -44.114360
          }));
        }
      );
    }
  };

  // Upload genérico de imagens
  const handleFileUpload = (field, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Funções para Canvas de Assinatura
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawnSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setFormData(prev => ({ ...prev, assinatura: canvas.toDataURL('image/png') }));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawnSignature(false);
      setFormData(prev => ({ ...prev, assinatura: '' }));
    }
  };

  // Verificar se há itens com Atenção ou Crítico
  const securityIssues = [
    formData.field_35_gua_no_limpador,
    formData.itens_de_seguran_a_obrigat_rio,
    formData.field_35_buzina,
    formData.itens_de_seguran_a_obrigat_rio_,
    formData.field_35_10,
    formData.field_35_freios,
    formData.field_35_5,
    formData.field_35_6,
    formData.field_35_7
  ];

  const generalIssues = [
    formData.field_36_calibragem_dos_pneus,
    formData.field_36_ilumina_o_e_sinaliza_o,
    formData.field_36_lataria_pintura,
    formData.field_36_limpeza_geral,
    formData.field_36_n_vel_do_leo_do_motor,
    formData.field_36_n_vel_de_gual_quido_de,
    formData.field_36_para_brisa,
    formData.field_36_vazamentos_aparentes
  ];

  const hasCriticalSecurity = securityIssues.includes('Crítico') || generalIssues.includes('Crítico');
  const hasWarning = securityIssues.includes('Atenção') || generalIssues.includes('Atenção');

  // Submissão do Checklist Veicular
  const handleSubmit = (e) => {
    e.preventDefault();

    let status = 'LIBERADO';
    let badgeClass = 'badge-normal';

    if (hasCriticalSecurity) {
      status = 'BLOQUEADO';
      badgeClass = 'badge-emergencia';
    } else if (hasWarning) {
      status = 'ATENÇÃO';
      badgeClass = 'badge-atencao';
    }

    const selectedPlateObj = VEHICLE_PLATES.find(v => v.placa === formData.field_47);
    const modeloVeiculo = formData.field_47 === 'Outro' 
      ? (formData.outro || 'Outro Veículo Não Listado')
      : (selectedPlateObj?.modelo || formData.field_47);

    const newRecord = {
      id: `CHK-VEIC-${Date.now().toString().slice(-6)}`,
      surveyId: 'af6c8c59f0654638b6e566793de64618',
      titulo: 'Checklist Veicular - Diário',
      linkSurvey: 'https://arcg.is/0DuT4L1',
      data_e_hora: formData.data_e_hora,
      data: formData.data_e_hora.split('T')[0],
      hora: formData.data_e_hora.split('T')[1] || '08:00',
      condutor: formData.condutor,
      placa: formData.field_47 === 'Outro' ? (formData.outro || 'OUTRO') : formData.field_47,
      modeloVeiculo,
      hod_metro_km_atual: Number(formData.hod_metro_km_atual) || 0,
      lat: formData.lat,
      lon: formData.lon,
      localizacaoNome: 'Itaminas Mineração • Mina Sarzedo/MG',
      status,
      badgeClass,
      itensSeguranca: {
        aguaLimpador: formData.field_35_gua_no_limpador,
        bandeirola: formData.itens_de_seguran_a_obrigat_rio,
        buzina: formData.field_35_buzina,
        cintosSeguranca: formData.itens_de_seguran_a_obrigat_rio_,
        documentacao: formData.field_35_10,
        freios: formData.field_35_freios,
        giroflex: formData.field_35_5,
        pneusEstepe: formData.field_35_6,
        kitSinalizacao: formData.field_35_7
      },
      condicoesGerais: {
        calibragemPneus: formData.field_36_calibragem_dos_pneus,
        iluminacaoSinalizacao: formData.field_36_ilumina_o_e_sinaliza_o,
        latariaPintura: formData.field_36_lataria_pintura,
        limpezaGeral: formData.field_36_limpeza_geral,
        nivelOleoMotor: formData.field_36_n_vel_do_leo_do_motor,
        nivelAguaArrefecimento: formData.field_36_n_vel_de_gual_quido_de,
        parabrisa: formData.field_36_para_brisa,
        vazamentosAparentes: formData.field_36_vazamentos_aparentes
      },
      descreva_aqui: formData.descreva_aqui,
      registroPainelUrl: formData.registro_do_painel,
      registroFotosSeguranca: formData.foto_seguranca,
      registroFotosCondicoes: formData.foto_condicoes,
      registrosComplementares: formData.registros_complementares,
      assinatura: formData.assinatura || `${formData.condutor} (Assinatura Digitalizada)`
    };

    onSave(newRecord);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop animate-fade-in" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1300,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '880px', 
          width: '100%',
          maxHeight: '92vh', 
          overflowY: 'auto', 
          padding: '1.75rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-xl)',
          color: 'var(--text-main)',
          position: 'relative'
        }}
      >
        {/* Header do Modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ITAMINAS COMÉRCIO DE MINÉRIOS S.A • SARZEDO/MG
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={22} style={{ color: 'var(--primary-accent)' }} />
              Checklist Veicular - Diário
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Formulário oficial de segurança veicular e frota operacional integrado no MDSync
            </span>
          </div>

          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.4rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Seletor de Modo: Formulário Nativo MDSync vs Survey123 Web Embutido */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'var(--bg-secondary)',
          padding: '0.35rem',
          borderRadius: '10px',
          marginBottom: '1.25rem',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            type="button"
            onClick={() => setFormMode('nativo')}
            style={{
              flex: 1,
              padding: '0.5rem 0.85rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              backgroundColor: formMode === 'nativo' ? 'var(--primary-accent)' : 'transparent',
              color: formMode === 'nativo' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: formMode === 'nativo' ? '0 2px 8px rgba(2, 132, 199, 0.35)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <Sparkles size={15} />
            Preenchimento Nativo MDSync (Gravação Automática)
          </button>
          <button
            type="button"
            onClick={() => setFormMode('survey123_web')}
            style={{
              flex: 1,
              padding: '0.5rem 0.85rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              backgroundColor: formMode === 'survey123_web' ? 'var(--primary-accent)' : 'transparent',
              color: formMode === 'survey123_web' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: formMode === 'survey123_web' ? '0 2px 8px rgba(2, 132, 199, 0.35)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <Globe size={15} />
            Visualizar Survey123 Web (ArcGIS Embutido)
          </button>
        </div>

        {formMode === 'survey123_web' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <span>Visualizando formulário oficial da Esri Survey123 incorporado via Web.</span>
              <a 
                href="https://arcg.is/0DuT4L1" 
                target="_blank" 
                rel="noreferrer"
                style={{ color: 'var(--primary-accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                Abrir link direto em nova aba <ExternalLink size={13} />
              </a>
            </div>
            
            <div style={{
              width: '100%',
              height: '620px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid var(--border-medium)',
              backgroundColor: '#ffffff'
            }}>
              <iframe
                src="https://survey123.arcgis.com/share/af6c8c59f0654638b6e566793de64618"
                title="ArcGIS Survey123 Veicular Integrado"
                width="100%"
                height="100%"
                style={{ border: 'none', width: '100%', height: '100%' }}
                allow="geolocation; camera"
              />
            </div>
          </div>
        ) : (
          <>
            {/* Barra de Progresso das 4 Páginas do Survey123 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '1.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.6rem 1rem', borderRadius: '10px' }}>
              {[
                { num: 1, label: 'Identificação' },
                { num: 2, label: 'Itens de Segurança' },
                { num: 3, label: 'Condições Gerais' },
                { num: 4, label: 'Finalização & Assinatura' }
              ].map(p => (
                <button
                  key={p.num}
                  type="button"
                  onClick={() => setCurrentPage(p.num)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: currentPage === p.num ? 'var(--primary-accent)' : (currentPage > p.num ? 'var(--geo-normal)' : 'var(--text-faint)'),
                    fontWeight: currentPage === p.num ? 700 : 500,
                    fontSize: '0.75rem'
                  }}
                >
                  <span style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: currentPage === p.num ? 'var(--primary-accent)' : (currentPage > p.num ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-panel)'),
                    color: currentPage === p.num ? '#fff' : (currentPage > p.num ? 'var(--geo-normal)' : 'var(--text-faint)'),
                    fontSize: '0.7rem',
                    fontWeight: 700
                  }}>
                    {p.num}
                  </span>
                  <span className="hide-mobile">{p.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* ============================================================ */}
          {/* PÁGINA 1: IDENTIFICAÇÃO                                       */}
          {/* ============================================================ */}
          {currentPage === 1 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={18} style={{ color: 'var(--primary-accent)' }} />
                  Página 1 — Identificação do Veículo e Condutor
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                  {/* Data e Hora */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Data e Hora *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.data_e_hora}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_e_hora: e.target.value }))}
                      className="form-input"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                      required
                    />
                  </div>

                  {/* Condutor */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Condutor *
                    </label>
                    <input
                      type="text"
                      value={formData.condutor}
                      onChange={(e) => setFormData(prev => ({ ...prev, condutor: e.target.value }))}
                      className="form-input"
                      placeholder="Nome completo do condutor"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                      required
                    />
                  </div>

                  {/* Placa do Veículo */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Placa do Veículo *
                    </label>
                    <select
                      value={formData.field_47}
                      onChange={(e) => setFormData(prev => ({ ...prev, field_47: e.target.value }))}
                      className="form-select"
                      style={{ width: '100%', fontSize: '0.82rem', fontWeight: 700 }}
                      required
                    >
                      {VEHICLE_PLATES.map((vp, idx) => (
                        <option key={idx} value={vp.placa}>
                          {vp.placa} — {vp.modelo}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Campo Outro se selecionado Outro */}
                  {formData.field_47 === 'Outro' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--geo-alerta)', marginBottom: '0.25rem' }}>
                        Descrever Marca e Modelo (Outro)
                      </label>
                      <input
                        type="text"
                        value={formData.outro}
                        onChange={(e) => setFormData(prev => ({ ...prev, outro: e.target.value }))}
                        className="form-input"
                        placeholder="Ex: Fiat Strada / Placa ABC-1234"
                        style={{ width: '100%', fontSize: '0.82rem' }}
                        required
                      />
                    </div>
                  )}

                  {/* Hodômetro km atual */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Hodômetro (km atual) *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Gauge size={16} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                      <input
                        type="number"
                        value={formData.hod_metro_km_atual}
                        onChange={(e) => setFormData(prev => ({ ...prev, hod_metro_km_atual: e.target.value }))}
                        className="form-input"
                        placeholder="Ex: 84520"
                        style={{ width: '100%', paddingLeft: '2.1rem', fontSize: '0.82rem', fontWeight: 700 }}
                        required
                      />
                    </div>
                  </div>

                  {/* Localização GPS */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        Localização (GPS) *
                      </label>
                      <button
                        type="button"
                        onClick={handleGetGps}
                        style={{ fontSize: '0.68rem', color: 'var(--primary-accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                      >
                        Atualizar GPS
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={`${formData.lat}, ${formData.lon}`}
                        readOnly
                        className="form-input font-mono"
                        style={{ width: '100%', fontSize: '0.78rem', backgroundColor: 'var(--bg-panel)' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Upload Foto do Painel */}
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Registro do Painel (Foto do painel com km visível) *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem' }}>
                      <Camera size={16} />
                      <span>{formData.registro_do_painel ? 'Alterar Foto do Painel' : 'Capturar Foto do Painel'}</span>
                      <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileUpload('registro_do_painel', e)} style={{ display: 'none' }} />
                    </label>
                    {formData.registro_do_painel ? (
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={15} /> Foto anexada
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                        Obrigatório conforme padrão Survey123 Itaminas
                      </span>
                    )}
                  </div>
                  {formData.registro_do_painel && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <img src={formData.registro_do_painel} alt="Painel" style={{ maxHeight: '90px', borderRadius: '6px', border: '1px solid var(--border-medium)' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* PÁGINA 2: ITENS DE SEGURANÇA OBRIGATÓRIO                     */}
          {/* ============================================================ */}
          {currentPage === 2 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={18} style={{ color: 'var(--primary-accent)' }} />
                    Página 2 — Itens de Segurança Obrigatório
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                    Portaria e Padrão de Trânsito Itaminas
                  </span>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Avalie cada item de segurança obrigatório. Caso selecione <strong>Atenção</strong> ou <strong>Crítico</strong>, o anexo fotográfico é obrigatório.
                </p>

                {/* Grid de Itens */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[
                    { field: 'field_35_gua_no_limpador', label: 'Água no limpador' },
                    { field: 'itens_de_seguran_a_obrigat_rio', label: 'Bandeirola de sinalização' },
                    { field: 'field_35_buzina', label: 'Buzina' },
                    { field: 'itens_de_seguran_a_obrigat_rio_', label: 'Cintos de segurança' },
                    { field: 'field_35_10', label: 'Documentação válida (CRLV + CNH + Credencial de Plano de Trânsito)' },
                    { field: 'field_35_freios', label: 'Freios' },
                    { field: 'field_35_5', label: 'Giroflex' },
                    { field: 'field_35_6', label: 'Pneus + Estepe' },
                    { field: 'field_35_7', label: 'Kit de sinalização (Macaco, chave de roda, triângulo)' }
                  ].map((item, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.85rem',
                        backgroundColor: 'var(--bg-panel)',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', flex: 1, minWidth: '200px' }}>
                        {item.label}
                      </span>

                      {/* Botões de Opção OK / Atenção / Crítico */}
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {[
                          { val: 'OK', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
                          { val: 'Atenção', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
                          { val: 'Crítico', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' }
                        ].map(opt => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, [item.field]: opt.val }))}
                            style={{
                              padding: '0.25rem 0.65rem',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              borderRadius: '6px',
                              border: formData[item.field] === opt.val ? `2px solid ${opt.color}` : '1px solid var(--border-subtle)',
                              backgroundColor: formData[item.field] === opt.val ? opt.bg : 'transparent',
                              color: formData[item.field] === opt.val ? opt.color : 'var(--text-muted)',
                              cursor: 'pointer',
                              transition: 'all 0.15s'
                            }}
                          >
                            {opt.val}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upload de Fotos de Evidência se houver Atenção/Crítico */}
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <AlertTriangle size={15} style={{ color: '#f59e0b' }} />
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Registros - Itens de Segurança Obrigatório
                    </label>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#ef4444', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                    * Registro fotográfico obrigatório apenas em casos de itens marcados como atenção e/ou críticos.
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem' }}>
                      <Camera size={15} />
                      <span>{formData.foto_seguranca ? 'Alterar Foto de Evidência' : 'Anexar Foto de Evidência'}</span>
                      <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileUpload('foto_seguranca', e)} style={{ display: 'none' }} />
                    </label>
                    {formData.foto_seguranca && (
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Foto de evidência anexada!</span>
                    )}
                  </div>
                  {formData.foto_seguranca && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <img src={formData.foto_seguranca} alt="Evidência" style={{ maxHeight: '90px', borderRadius: '6px', border: '1px solid var(--border-medium)' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* PÁGINA 3: CONDIÇÕES GERAIS                                   */}
          {/* ============================================================ */}
          {currentPage === 3 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ClipboardList size={18} style={{ color: 'var(--primary-accent)' }} />
                    Página 3 — Condições Gerais do Veículo
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                    Mecânica, Fluídos & Conservação
                  </span>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Verifique o estado geral mecânico, estético e níveis de fluídos do veículo antes de iniciar a operação.
                </p>

                {/* Grid de Condições Gerais */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[
                    { field: 'field_36_calibragem_dos_pneus', label: 'Calibragem dos pneus' },
                    { field: 'field_36_ilumina_o_e_sinaliza_o', label: 'Iluminação e sinalização (faróis, setas, freio, ré e lanternas funcionando)' },
                    { field: 'field_36_lataria_pintura', label: 'Lataria + Pintura' },
                    { field: 'field_36_limpeza_geral', label: 'Limpeza geral' },
                    { field: 'field_36_n_vel_do_leo_do_motor', label: 'Nível do óleo do motor' },
                    { field: 'field_36_n_vel_de_gual_quido_de', label: 'Nível de água/líquido de arrefecimento' },
                    { field: 'field_36_para_brisa', label: 'Para-brisa' },
                    { field: 'field_36_vazamentos_aparentes', label: 'Vazamentos aparentes' }
                  ].map((item, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.85rem',
                        backgroundColor: 'var(--bg-panel)',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', flex: 1, minWidth: '200px' }}>
                        {item.label}
                      </span>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {[
                          { val: 'OK', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
                          { val: 'Atenção', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
                          { val: 'Crítico', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' }
                        ].map(opt => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, [item.field]: opt.val }))}
                            style={{
                              padding: '0.25rem 0.65rem',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              borderRadius: '6px',
                              border: formData[item.field] === opt.val ? `2px solid ${opt.color}` : '1px solid var(--border-subtle)',
                              backgroundColor: formData[item.field] === opt.val ? opt.bg : 'transparent',
                              color: formData[item.field] === opt.val ? opt.color : 'var(--text-muted)',
                              cursor: 'pointer',
                              transition: 'all 0.15s'
                            }}
                          >
                            {opt.val}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upload de Fotos de Condições Gerais */}
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <Camera size={15} style={{ color: 'var(--primary-accent)' }} />
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Registros - Condições Gerais
                    </label>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#ef4444', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                    * Registro fotográfico obrigatório apenas em casos de itens marcados como atenção e/ou críticos.
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem' }}>
                      <Camera size={15} />
                      <span>{formData.foto_condicoes ? 'Alterar Foto de Condições' : 'Anexar Foto'}</span>
                      <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileUpload('foto_condicoes', e)} style={{ display: 'none' }} />
                    </label>
                    {formData.foto_condicoes && (
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Foto anexada com sucesso!</span>
                    )}
                  </div>
                  {formData.foto_condicoes && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <img src={formData.foto_condicoes} alt="Condições Gerais" style={{ maxHeight: '90px', borderRadius: '6px', border: '1px solid var(--border-medium)' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* PÁGINA 4: OBSERVAÇÕES E FINALIZAÇÃO                           */}
          {/* ============================================================ */}
          {currentPage === 4 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <PenTool size={18} style={{ color: 'var(--primary-accent)' }} />
                  Página 4 — Observações e Assinatura Digital
                </h3>

                {/* Status Preliminar do Veículo */}
                <div style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: hasCriticalSecurity ? 'rgba(239, 68, 68, 0.12)' : (hasWarning ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)'),
                  border: `1px solid ${hasCriticalSecurity ? 'rgba(239, 68, 68, 0.3)' : (hasWarning ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)')}`,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  {hasCriticalSecurity ? (
                    <XCircle size={22} style={{ color: '#ef4444' }} />
                  ) : hasWarning ? (
                    <AlertTriangle size={22} style={{ color: '#f59e0b' }} />
                  ) : (
                    <CheckCircle2 size={22} style={{ color: '#10b981' }} />
                  )}
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: hasCriticalSecurity ? '#ef4444' : (hasWarning ? '#f59e0b' : '#10b981') }}>
                      STATUS DO CHECKLIST: {hasCriticalSecurity ? 'VEÍCULO BLOQUEADO (CRÍTICO)' : (hasWarning ? 'VEÍCULO EM ATENÇÃO (MANUTENÇÃO REQUERIDA)' : 'VEÍCULO LIBERADO / 100% CONFORME')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {hasCriticalSecurity 
                        ? 'Foram identificados itens críticos de segurança. Veículo não deve transitar em mina/campo.'
                        : (hasWarning ? 'Itens em atenção requerem revisão antes ou ao final da jornada de campo.' : 'Todos os itens atendem aos critérios de trânsito e segurança da Itaminas.')}
                    </div>
                  </div>
                </div>

                {/* Descreva aqui */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Descreva aqui (Observações e Não Conformidades)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.descreva_aqui}
                    onChange={(e) => setFormData(prev => ({ ...prev, ...{ descreva_aqui: e.target.value } }))}
                    placeholder="Descrição detalhada de qualquer anormalidade, ruído, desgaste ou necessidade de oficina..."
                    className="form-input"
                    style={{ width: '100%', fontSize: '0.8rem' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: '2px', display: 'block' }}>
                    * Descrição obrigatória apenas em casos de itens marcados como atenção e/ou críticos.
                  </span>
                </div>

                {/* Registros complementares (Fotos) */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Registros Complementares (Fotos)
                  </label>
                  <label className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem' }}>
                    <UploadCloud size={15} />
                    <span>{formData.registros_complementares ? 'Substituir Foto Complementar' : 'Anexar Foto Complementar'}</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload('registros_complementares', e)} style={{ display: 'none' }} />
                  </label>
                  {formData.registros_complementares && (
                    <span style={{ fontSize: '0.75rem', color: '#10b981', marginLeft: '0.6rem', fontWeight: 600 }}>Foto anexada</span>
                  )}
                </div>

                {/* Assinatura Digital com Canvas */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Assinatura Digital do Condutor *
                    </label>
                    <button
                      type="button"
                      onClick={clearSignature}
                      style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <RotateCcw size={13} /> Limpar Assinatura
                    </button>
                  </div>

                  <div style={{
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    width: '100%',
                    height: '140px',
                    position: 'relative',
                    cursor: 'crosshair',
                    touchAction: 'none'
                  }}>
                    <canvas
                      ref={canvasRef}
                      width={700}
                      height={140}
                      style={{ width: '100%', height: '100%', display: 'block' }}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                    {!hasDrawnSignature && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: '#94a3b8',
                        fontSize: '0.8rem',
                        pointerEvents: 'none',
                        textAlign: 'center'
                      }}>
                        <PenTool size={20} style={{ margin: '0 auto 0.25rem', opacity: 0.5 }} />
                        Assine aqui com o mouse ou toque
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: '4px', display: 'block' }}>
                    Responsável: <strong>{formData.condutor}</strong> • Itaminas Mineração
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navegação entre Páginas e Botão Salvar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            {currentPage > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
              >
                <ChevronLeft size={16} /> Página Anterior
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                style={{ fontSize: '0.8rem' }}
              >
                Cancelar
              </button>
            )}

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {currentPage < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700 }}
                >
                  Próxima Página <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 700, backgroundColor: '#0284c7' }}
                >
                  <CheckCircle2 size={16} />
                  <span>Salvar Checklist Veicular</span>
                </button>
              )}
            </div>
          </div>
        </form>
          </>
        )}
      </div>
    </div>
  );
};
