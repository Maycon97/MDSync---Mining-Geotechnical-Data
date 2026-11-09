import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Crosshair, 
  Globe, 
  FileText, 
  Activity, 
  Briefcase, 
  Layers, 
  X, 
  AlertTriangle,
  Award,
  Calendar,
  Compass,
  Phone,
  Mail,
  UserCheck
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { toUtm23s } from './SysdamEmpreendimentosPanel';

export const EmpreendimentosTab = ({ onNavigateTab }) => {
  const [empreendimentos, setEmpreendimentos] = useState(() => storageService.getEmpreendimentos());
  const [activeEmp, setActiveEmp] = useState(() => storageService.getActiveEmpreendimento());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('TODOS');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Formulário de Cadastro / Edição
  const [formData, setFormData] = useState({
    nome: '',
    razaoSocial: '',
    cnpj: '',
    sigla: '',
    processoAnm: '',
    substanciaMineral: 'Minério de Ferro (Hematita e Itabirito)',
    municipio: 'Sarzedo',
    uf: 'MG',
    baciaHidrografica: 'Bacia do Rio Paraopeba',
    faseOperacional: 'Em Operação Regular',
    statusOperacional: 'Ativo',
    lat: '-20.088788',
    lon: '-44.092452',
    rtNome: '',
    rtTitulo: 'Engenheiro Geotécnico Responsável (RT)',
    rtCrea: '',
    rtArt: '',
    rtEmail: '',
    rtTelefone: '',
    orgaoAmbiental: 'ANM & FEAM',
    licencaOperacao: '',
    validadeLo: '',
    statusDceGeral: '100% Conforme (PNSB)',
    paebmProtocolado: true,
    descricao: ''
  });

  // Atualizar quando houver mudanças no storage
  useEffect(() => {
    const handleChanged = () => {
      setEmpreendimentos(storageService.getEmpreendimentos());
      setActiveEmp(storageService.getActiveEmpreendimento());
    };
    window.addEventListener('mdsync:empreendimentos-changed', handleChanged);
    window.addEventListener('mdsync:active-empreendimento-changed', handleChanged);
    return () => {
      window.removeEventListener('mdsync:empreendimentos-changed', handleChanged);
      window.removeEventListener('mdsync:active-empreendimento-changed', handleChanged);
    };
  }, []);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtragem
  const filteredList = useMemo(() => {
    return empreendimentos.filter(emp => {
      if (selectedStatus !== 'TODOS') {
        if (selectedStatus === 'ATIVO' && emp.statusOperacional !== 'Ativo') return false;
        if (selectedStatus === 'OPERACAO' && !emp.faseOperacional?.includes('Operação')) return false;
        if (selectedStatus === 'DESCARACTERIZACAO' && !emp.faseOperacional?.includes('Descaracterização')) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNome = emp.nome?.toLowerCase().includes(q);
        const matchRazao = emp.razaoSocial?.toLowerCase().includes(q);
        const matchSigla = emp.sigla?.toLowerCase().includes(q);
        const matchCnpj = emp.cnpj?.toLowerCase().includes(q);
        const matchMun = emp.municipio?.toLowerCase().includes(q);
        const matchMin = emp.substanciaMineral?.toLowerCase().includes(q);
        if (!matchNome && !matchRazao && !matchSigla && !matchCnpj && !matchMun && !matchMin) return false;
      }
      return true;
    });
  }, [empreendimentos, selectedStatus, searchQuery]);

  // Contagem de estruturas do catálogo
  const totalEstruturas = useMemo(() => {
    try {
      const list = storageService.getEstruturasEmpreendimento();
      return list.length;
    } catch (e) {
      return 9;
    }
  }, []);

  // Abrir Modal para Novo Cadastro
  const handleOpenCreateModal = () => {
    setEditingEmp(null);
    setFormData({
      nome: '',
      razaoSocial: '',
      cnpj: '',
      sigla: '',
      processoAnm: '',
      substanciaMineral: 'Minério de Ferro',
      municipio: '',
      uf: 'MG',
      baciaHidrografica: '',
      faseOperacional: 'Em Operação Regular',
      statusOperacional: 'Ativo',
      lat: '',
      lon: '',
      rtNome: '',
      rtTitulo: 'Engenheiro Geotécnico Responsável (RT)',
      rtCrea: '',
      rtArt: '',
      rtEmail: '',
      rtTelefone: '',
      orgaoAmbiental: 'ANM & FEAM',
      licencaOperacao: '',
      validadeLo: '',
      statusDceGeral: '100% Conforme (PNSB)',
      paebmProtocolado: true,
      descricao: ''
    });
    setModalOpen(true);
  };

  // Abrir Modal para Edição
  const handleOpenEditModal = (emp) => {
    setEditingEmp(emp);
    setFormData({
      nome: emp.nome || '',
      razaoSocial: emp.razaoSocial || '',
      cnpj: emp.cnpj || '',
      sigla: emp.sigla || '',
      processoAnm: emp.processoAnm || '',
      substanciaMineral: emp.substanciaMineral || 'Minério de Ferro',
      municipio: emp.municipio || '',
      uf: emp.uf || 'MG',
      baciaHidrografica: emp.baciaHidrografica || '',
      faseOperacional: emp.faseOperacional || 'Em Operação Regular',
      statusOperacional: emp.statusOperacional || 'Ativo',
      lat: emp.coordenadas?.lat != null ? String(emp.coordenadas.lat) : (emp.lat || ''),
      lon: emp.coordenadas?.lon != null ? String(emp.coordenadas.lon) : (emp.lon || ''),
      rtNome: emp.responsavelTecnico?.nome || emp.rtNome || '',
      rtTitulo: emp.responsavelTecnico?.titulo || 'Engenheiro Geotécnico Responsável (RT)',
      rtCrea: emp.responsavelTecnico?.crea || emp.rtCrea || '',
      rtArt: emp.responsavelTecnico?.art || emp.rtArt || '',
      rtEmail: emp.responsavelTecnico?.email || emp.rtEmail || '',
      rtTelefone: emp.responsavelTecnico?.telefone || emp.rtTelefone || '',
      orgaoAmbiental: emp.licenciamento?.orgaoAmbiental || emp.orgaoAmbiental || 'ANM & FEAM',
      licencaOperacao: emp.licenciamento?.licencaOperacao || emp.licencaOperacao || '',
      validadeLo: emp.licenciamento?.validadeLo || emp.validadeLo || '',
      statusDceGeral: emp.licenciamento?.statusDceGeral || '100% Conforme (PNSB)',
      paebmProtocolado: emp.licenciamento?.paebmProtocolado ?? true,
      descricao: emp.descricao || ''
    });
    setModalOpen(true);
  };

  // Capturar GPS
  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      showToast('Geolocalização não suportada pelo navegador.', 'error');
      return;
    }
    setIsCapturingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsCapturingGps(false);
        setFormData(prev => ({
          ...prev,
          lat: pos.coords.latitude.toFixed(6),
          lon: pos.coords.longitude.toFixed(6)
        }));
        showToast('Coordenadas GPS capturadas com sucesso!');
      },
      (err) => {
        setIsCapturingGps(false);
        showToast(`Falha ao obter GPS: ${err.message}`, 'error');
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  // Salvar Empreendimento
  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      showToast('O nome do empreendimento é obrigatório.', 'error');
      return;
    }
    if (!formData.sigla.trim()) {
      showToast('A sigla/código do empreendimento é obrigatória.', 'error');
      return;
    }

    const payload = {
      ...(editingEmp || {}),
      nome: formData.nome.trim(),
      razaoSocial: formData.razaoSocial.trim() || formData.nome.trim(),
      cnpj: formData.cnpj.trim(),
      sigla: formData.sigla.trim().toUpperCase(),
      processoAnm: formData.processoAnm.trim(),
      substanciaMineral: formData.substanciaMineral.trim(),
      municipio: formData.municipio.trim() || 'Sarzedo',
      uf: formData.uf.trim().toUpperCase() || 'MG',
      baciaHidrografica: formData.baciaHidrografica.trim(),
      faseOperacional: formData.faseOperacional,
      statusOperacional: formData.statusOperacional,
      lat: formData.lat !== '' ? Number(formData.lat) : undefined,
      lon: formData.lon !== '' ? Number(formData.lon) : undefined,
      responsavelTecnico: {
        nome: formData.rtNome.trim(),
        titulo: formData.rtTitulo.trim(),
        crea: formData.rtCrea.trim(),
        art: formData.rtArt.trim(),
        email: formData.rtEmail.trim(),
        telefone: formData.rtTelefone.trim()
      },
      licenciamento: {
        orgaoAmbiental: formData.orgaoAmbiental.trim(),
        licencaOperacao: formData.licencaOperacao.trim(),
        validadeLo: formData.validadeLo,
        statusDceGeral: formData.statusDceGeral,
        paebmProtocolado: Boolean(formData.paebmProtocolado)
      },
      descricao: formData.descricao.trim(),
      estruturasCount: editingEmp?.estruturasCount ?? (empreendimentos.length === 1 ? totalEstruturas : 0)
    };

    const saved = storageService.saveEmpreendimento(payload);
    if (saved) {
      showToast(editingEmp ? 'Empreendimento atualizado com sucesso!' : 'Novo empreendimento cadastrado com sucesso!');
      setModalOpen(false);
      setEditingEmp(null);
    } else {
      showToast('Erro ao salvar empreendimento.', 'error');
    }
  };

  // Excluir Empreendimento
  const handleDelete = (emp) => {
    if (empreendimentos.length <= 1) {
      showToast('O sistema necessita de ao menos um empreendimento corporativo ativo.', 'error');
      return;
    }
    if (window.confirm(`Deseja realmente excluir o empreendimento "${emp.nome}"? Esta ação removerá os parâmetros operacionais vinculados.`)) {
      const ok = storageService.deleteEmpreendimento(emp.id);
      if (ok) {
        showToast('Empreendimento excluído.');
      } else {
        showToast('Erro ao excluir empreendimento.', 'error');
      }
    }
  };

  // Definir como ativo
  const handleSetActive = (emp) => {
    storageService.setActiveEmpreendimento(emp.id);
    setActiveEmp(emp);
    showToast(`Empreendimento ativo alterado para: ${emp.nome}`);
  };

  return (
    <div className="empreendimentos-tab-container" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      paddingBottom: '3rem'
    }}>
      {/* Toast Notificação */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: toastMessage.type === 'error' ? '#ef4444' : '#10b981',
          color: '#ffffff',
          padding: '0.65rem 1.1rem',
          borderRadius: '8px',
          fontWeight: 700,
          fontSize: '0.82rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {toastMessage.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Header Corporativo Multi-Empreendimentos */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
        borderRadius: '12px',
        padding: '1.4rem 1.6rem',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                backgroundColor: 'rgba(56, 189, 248, 0.18)',
                color: '#38bdf8',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '0.68rem',
                fontWeight: 800,
                border: '1px solid rgba(56, 189, 248, 0.35)',
                letterSpacing: '0.5px'
              }}>
                MDSYNC ENTERPRISE · SAAS COMERCIAL
              </span>
              <span style={{
                backgroundColor: 'rgba(16, 185, 129, 0.18)',
                color: '#34d399',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.68rem',
                fontWeight: 800
              }}>
                Multi-Site Ativo
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{
                margin: '4px 0 0',
                fontSize: '1.45rem',
                fontWeight: 900,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Building2 size={24} style={{ color: '#38bdf8' }} />
                Gestão de Empreendimentos & Complexos Minerários
              </h1>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="btn-structure-add"
                title="Cadastrar novo empreendimento (+)"
                aria-label="Cadastrar novo empreendimento"
              >
                <span className="icon-plus-animated">
                  <Plus size={17} strokeWidth={2.8} />
                </span>
              </button>
            </div>
            <p style={{
              margin: '6px 0 0',
              fontSize: '0.82rem',
              color: '#94a3b8',
              maxWidth: '850px',
              lineHeight: 1.45
            }}>
              Módulo comercial dedicado ao cadastro corporativo de complexos minerários, concessões de lavra ANM, licenças ambientais e governança técnica centralizada multi-empresas.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', alignSelf: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              SaaS Multi-Empresas: <strong style={{ color: '#ffffff' }}>Ativo</strong>
            </span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.25rem 0.65rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8'
            }}>
              {empreendimentos.length} Empreendimentos
            </span>
          </div>
        </div>

        {/* Métricas Top KPIs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.85rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600 }}>Complexos Cadastrados:</div>
            <div style={{ color: '#ffffff', fontSize: '1.35rem', fontWeight: 900, marginTop: '2px' }}>
              {empreendimentos.length} <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>unidade(s)</span>
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600 }}>Estruturas Geotécnicas:</div>
            <div style={{ color: '#34d399', fontSize: '1.35rem', fontWeight: 900, marginTop: '2px' }}>
              {totalEstruturas} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>ativas</span>
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600 }}>Conformidade ANM 95/2022:</div>
            <div style={{ color: '#38bdf8', fontSize: '1.35rem', fontWeight: 900, marginTop: '2px' }}>
              100% <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>DCEs Emitidas</span>
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600 }}>Empreendimento Ativo Atual:</div>
            <div style={{ color: '#fbbf24', fontSize: '0.95rem', fontWeight: 800, marginTop: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeEmp?.nome || 'Complexo Itaminas'}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        backgroundColor: '#1e293b',
        padding: '0.85rem 1rem',
        borderRadius: '8px',
        border: '1px solid #334155'
      }}>
        {/* Campo de Busca */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#0f172a',
          padding: '0.45rem 0.85rem',
          borderRadius: '6px',
          border: '1px solid #475569',
          flex: '1',
          minWidth: '260px'
        }}>
          <Search size={16} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome, sigla, CNPJ, município ou substância..."
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '0.8rem',
              width: '100%',
              fontFamily: 'inherit'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filtros por Status */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'TODOS', label: 'Todos os Empreendimentos' },
            { id: 'ATIVO', label: 'Ativos' },
            { id: 'OPERACAO', label: 'Em Operação' },
            { id: 'DESCARACTERIZACAO', label: 'Descaracterização' }
          ].map(f => {
            const isActive = selectedStatus === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedStatus(f.id)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: isActive ? '1px solid #38bdf8' : '1px solid #334155',
                  backgroundColor: isActive ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  fontSize: '0.74rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de Cards dos Empreendimentos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))',
        gap: '1.25rem'
      }}>
        {filteredList.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            padding: '3rem 1rem',
            textAlign: 'center',
            backgroundColor: '#1e293b',
            borderRadius: '8px',
            border: '1px dashed #475569',
            color: '#94a3b8'
          }}>
            <Building2 size={36} style={{ color: '#475569', marginBottom: '8px' }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Nenhum empreendimento localizado</div>
            <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>Tente alterar os termos de pesquisa ou cadastre um novo empreendimento.</div>
          </div>
        ) : (
          filteredList.map((emp) => {
            const isActiveCurrent = activeEmp?.id === emp.id || activeEmp?.sigla === emp.sigla;
            const lat = emp.coordenadas?.lat ?? emp.lat;
            const lon = emp.coordenadas?.lon ?? emp.lon;
            const utm = (lat != null && lon != null) ? toUtm23s(Number(lat), Number(lon)) : null;

            return (
              <div
                key={emp.id || emp.sigla}
                style={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: isActiveCurrent ? '2px solid #38bdf8' : '1px solid #334155',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: isActiveCurrent ? '0 8px 24px rgba(56, 189, 248, 0.18)' : '0 4px 12px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Header do Card */}
                <div style={{
                  padding: '1rem 1.25rem',
                  background: isActiveCurrent 
                    ? 'linear-gradient(135deg, #0f2744 0%, #1e3a8a 100%)'
                    : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  borderBottom: '1px solid #334155',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{
                        backgroundColor: 'rgba(56, 189, 248, 0.25)',
                        color: '#38bdf8',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        letterSpacing: '0.5px'
                      }}>
                        {emp.sigla}
                      </span>
                      <span style={{
                        backgroundColor: emp.statusOperacional === 'Ativo' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)',
                        color: emp.statusOperacional === 'Ativo' ? '#34d399' : '#fbbf24',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '0.64rem',
                        fontWeight: 700
                      }}>
                        {emp.statusOperacional || 'Ativo'}
                      </span>
                      {isActiveCurrent && (
                        <span style={{
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.64rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <CheckCircle2 size={11} /> ATIVO
                        </span>
                      )}
                    </div>
                    <h3 style={{
                      margin: 0,
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      lineHeight: 1.3
                    }}>
                      {emp.nome}
                    </h3>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span>{emp.razaoSocial}</span>
                      {emp.cnpj && (
                        <span style={{ fontFamily: 'monospace', color: '#cbd5e1', backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: '1px 5px', borderRadius: '3px', fontSize: '0.68rem' }}>
                          CNPJ: {emp.cnpj}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={() => handleOpenEditModal(emp)}
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#cbd5e1',
                        cursor: 'pointer'
                      }}
                      title="Editar cadastro deste empreendimento"
                    >
                      <Edit3 size={15} />
                    </button>
                    {empreendimentos.length > 1 && (
                      <button
                        onClick={() => handleDelete(emp)}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          cursor: 'pointer'
                        }}
                        title="Excluir empreendimento"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Conteúdo Detalhado do Empreendimento */}
                <div style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  fontSize: '0.74rem',
                  flex: 1
                }}>
                  {/* Grid de Informações Chave */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.65rem'
                  }}>
                    <div style={{ backgroundColor: '#1e293b', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #334155' }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>Localização / Bacia:</span>
                      <div style={{ color: '#ffffff', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} style={{ color: '#38bdf8' }} />
                        <span>{emp.municipio} / {emp.uf}</span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.65rem', marginTop: '1px' }}>{emp.baciaHidrografica || 'Bacia Hidrográfica Regional'}</div>
                    </div>

                    <div style={{ backgroundColor: '#1e293b', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #334155' }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>Substância / Concessão:</span>
                      <div style={{ color: '#ffffff', fontWeight: 700, marginTop: '2px' }}>
                        {emp.substanciaMineral || 'Minério de Ferro'}
                      </div>
                      <div style={{ color: '#34d399', fontSize: '0.65rem', marginTop: '1px', fontWeight: 600 }}>
                        Processo ANM: {emp.processoAnm || 'SIGBM Reg.'}
                      </div>
                    </div>
                  </div>

                  {/* Georreferenciamento & Coordenadas */}
                  {(lat != null && lon != null) && (
                    <div style={{
                      backgroundColor: '#1e293b',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #334155',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Globe size={13} style={{ color: '#38bdf8' }} />
                        <span style={{ color: '#94a3b8' }}>WGS-84:</span>
                        <span style={{ fontFamily: 'monospace', color: '#ffffff', fontWeight: 700 }}>{Number(lat).toFixed(6)}, {Number(lon).toFixed(6)}</span>
                      </div>
                      {utm && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Compass size={13} style={{ color: '#34d399' }} />
                          <span style={{ color: '#94a3b8' }}>UTM 23S:</span>
                          <span style={{ fontFamily: 'monospace', color: '#34d399', fontWeight: 700 }}>E {utm.easting} / N {utm.northing}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Responsabilidade Técnica & Licenciamento */}
                  <div style={{
                    backgroundColor: '#1e293b',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #334155',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <UserCheck size={13} style={{ color: '#38bdf8' }} />
                        Responsável Técnico (RT):
                      </span>
                      <strong style={{ color: '#f8fafc' }}>{emp.responsavelTecnico?.nome || emp.rtNome || 'Engenharia Geotécnica'}</strong>
                    </div>
                    {emp.responsavelTecnico?.crea && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94a3b8' }}>
                        <span>Registro Profissional:</span>
                        <span style={{ color: '#cbd5e1' }}>{emp.responsavelTecnico.crea} ({emp.responsavelTecnico.art || 'ART Vigente'})</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', paddingTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={13} style={{ color: '#34d399' }} />
                        Licenciamento / Fiscalização:
                      </span>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>
                        {emp.licenciamento?.orgaoAmbiental || 'ANM & FEAM'} ({emp.licenciamento?.licencaOperacao || 'LO Vigente'})
                      </span>
                    </div>
                  </div>

                  {/* Descrição */}
                  {emp.descricao && (
                    <p style={{
                      margin: 0,
                      color: '#94a3b8',
                      fontSize: '0.7rem',
                      lineHeight: 1.4,
                      fontStyle: 'italic'
                    }}>
                      "{emp.descricao}"
                    </p>
                  )}
                </div>

                {/* Rodapé do Card com Ações */}
                <div style={{
                  padding: '0.75rem 1.25rem',
                  backgroundColor: '#0b1329',
                  borderTop: '1px solid #334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  <div>
                    {!isActiveCurrent ? (
                      <button
                        onClick={() => handleSetActive(emp)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(56, 189, 248, 0.15)',
                          border: '1px solid #38bdf8',
                          color: '#38bdf8',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <CheckCircle2 size={13} />
                        Definir como Ativo
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={13} /> Contexto Operacional Ativo
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => onNavigateTab && onNavigateTab('estruturas_empreendimento')}
                      style={{
                        padding: '0.35rem 0.7rem',
                        borderRadius: '6px',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        color: '#cbd5e1',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Ver estruturas geotécnicas"
                    >
                      <Layers size={13} />
                      Estruturas ({emp.estruturasCount || totalEstruturas})
                    </button>
                    <button
                      onClick={() => onNavigateTab && onNavigateTab('mapa', { lat, lon })}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        backgroundColor: '#0284c7',
                        border: '1px solid #38bdf8',
                        color: '#ffffff',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Abrir no mapa de georreferenciamento"
                    >
                      <MapPin size={13} />
                      Ver no Mapa
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Cadastro / Edição de Empreendimento */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#0f172a',
            border: '1px solid #38bdf8',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            overflow: 'hidden'
          }}>
            {/* Header do Modal */}
            <div style={{
              padding: '1rem 1.4rem',
              backgroundColor: '#1e293b',
              borderBottom: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} style={{ color: '#38bdf8' }} />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                  {editingEmp ? 'Editar Empreendimento Minerário' : 'Cadastrar Novo Empreendimento (SaaS Comercial)'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Formulário Rolável */}
            <form onSubmit={handleSave} style={{
              padding: '1.4rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              fontSize: '0.78rem'
            }}>
              {/* 1. Identificação Corporativa */}
              <div style={{ borderBottom: '1px solid #334155', paddingBottom: '0.85rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                  1. Identificação Corporativa & Registro
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '3px', fontWeight: 600 }}>
                      Nome do Empreendimento / Complexo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Complexo Minerário Itaminas, Mina de Jangada"
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '3px', fontWeight: 600 }}>
                      Sigla / Código Operacional *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sigla}
                      onChange={(e) => setFormData({ ...formData, sigla: e.target.value.toUpperCase() })}
                      placeholder="Ex: ITAMINAS, VALE-VG, SAMARCO"
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        outline: 'none',
                        textTransform: 'uppercase'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '3px', fontWeight: 600 }}>
                      Razão Social da Empresa Titular *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.razaoSocial}
                      onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                      placeholder="Ex: Itaminas Mineração S/A, Vale S.A."
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '3px', fontWeight: 600 }}>
                      CNPJ da Empresa
                    </label>
                    <input
                      type="text"
                      value={formData.cnpj}
                      onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                      placeholder="00.000.000/0000-00"
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Mineração & Regulação ANM */}
              <div style={{ borderBottom: '1px solid #334155', paddingBottom: '0.85rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                  2. Regulação ANM, Minério & Licenciamento
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '3px', fontWeight: 600 }}>
                      Processo ANM / SIGBM
                    </label>
                    <input
                      type="text"
                      value={formData.processoAnm}
                      onChange={(e) => setFormData({ ...formData, processoAnm: e.target.value })}
                      placeholder="Ex: 830.123/1982"
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '3px', fontWeight: 600 }}>
                      Substância Mineral Principal
                    </label>
                    <input
                      type="text"
                      value={formData.substanciaMineral}
                      onChange={(e) => setFormData({ ...formData, substanciaMineral: e.target.value })}
                      placeholder="Ex: Minério de Ferro, Bauxita, Ouro"
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '3px', fontWeight: 600 }}>
                      Fase Operacional
                    </label>
                    <select
                      value={formData.faseOperacional}
                      onChange={(e) => setFormData({ ...formData, faseOperacional: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        outline: 'none'
                      }}
                    >
                      <option value="Em Operação Regular">Em Operação Regular</option>
                      <option value="Em Implantação / Obras">Em Implantação / Obras</option>
                      <option value="Descaracterização em Planejamento">Descaracterização em Planejamento</option>
                      <option value="Pós-Fechamento / Manutenção">Pós-Fechamento / Manutenção</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '3px', fontWeight: 600 }}>
                      Órgão Ambiental Fiscalizador
                    </label>
                    <input
                      type="text"
                      value={formData.orgaoAmbiental}
                      onChange={(e) => setFormData({ ...formData, orgaoAmbiental: e.target.value })}
                      placeholder="Ex: ANM & FEAM, IBAMA, CETESB"
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '3px', fontWeight: 600 }}>
                      Licença de Operação (LO)
                    </label>
                    <input
                      type="text"
                      value={formData.licencaOperacao}
                      onChange={(e) => setFormData({ ...formData, licencaOperacao: e.target.value })}
                      placeholder="Ex: LO nº 042/2022"
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '3px', fontWeight: 600 }}>
                      Validade da LO
                    </label>
                    <input
                      type="date"
                      value={formData.validadeLo}
                      onChange={(e) => setFormData({ ...formData, validadeLo: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Localização & Georreferenciamento */}
              <div style={{ borderBottom: '1px solid #334155', paddingBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                    3. Localização & Georreferenciamento
                  </div>
                  <button
                    type="button"
                    onClick={handleCaptureGps}
                    disabled={isCapturingGps}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid #38bdf8',
                      color: '#38bdf8',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Crosshair size={12} />
                    {isCapturingGps ? 'Capturando GPS...' : 'Capturar GPS Atual'}
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '3px', fontWeight: 600 }}>
                      Município *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.municipio}
                      onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                      placeholder="Ex: Sarzedo, Brumadinho"
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '3px', fontWeight: 600 }}>
                      UF *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={2}
                      value={formData.uf}
                      onChange={(e) => setFormData({ ...formData, uf: e.target.value.toUpperCase() })}
                      placeholder="MG"
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        outline: 'none',
                        textTransform: 'uppercase'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '3px', fontWeight: 600 }}>
                      Latitude (WGS-84)
                    </label>
                    <input
                      type="text"
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                      placeholder="-20.088788"
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        outline: 'none',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '3px', fontWeight: 600 }}>
                      Longitude (WGS-84)
                    </label>
                    <input
                      type="text"
                      value={formData.lon}
                      onChange={(e) => setFormData({ ...formData, lon: e.target.value })}
                      placeholder="-44.092452"
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        outline: 'none',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 4' }}>
                    <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '3px', fontWeight: 600 }}>
                      Bacia Hidrográfica
                    </label>
                    <input
                      type="text"
                      value={formData.baciaHidrografica}
                      onChange={(e) => setFormData({ ...formData, baciaHidrografica: e.target.value })}
                      placeholder="Ex: Bacia Hidrográfica do Rio Paraopeba"
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 4. Responsabilidade Técnica (RT Geotecnia) */}
              <div style={{ borderBottom: '1px solid #334155', paddingBottom: '0.85rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                  4. Responsável Técnico Geotécnico (RT) & Contatos
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '3px', fontWeight: 600 }}>
                      Nome do RT Geotecnia
                    </label>
                    <input
                      type="text"
                      value={formData.rtNome}
                      onChange={(e) => setFormData({ ...formData, rtNome: e.target.value })}
                      placeholder="Ex: Eng. Maycon Douglas M.D. Nascimento"
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '3px', fontWeight: 600 }}>
                      Registro CREA e ART
                    </label>
                    <input
                      type="text"
                      value={formData.rtCrea}
                      onChange={(e) => setFormData({ ...formData, rtCrea: e.target.value })}
                      placeholder="Ex: CREA-MG 214.892/D (ART 2026/0988)"
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '3px', fontWeight: 600 }}>
                      E-mail Operacional Geotecnia
                    </label>
                    <input
                      type="email"
                      value={formData.rtEmail}
                      onChange={(e) => setFormData({ ...formData, rtEmail: e.target.value })}
                      placeholder="geotecnia@empresa.com.br"
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '3px', fontWeight: 600 }}>
                      Telefone Sala de Controle / Emergência
                    </label>
                    <input
                      type="text"
                      value={formData.rtTelefone}
                      onChange={(e) => setFormData({ ...formData, rtTelefone: e.target.value })}
                      placeholder="(31) 3577-9000"
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 5. Descrição Técnica */}
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '3px', fontWeight: 600 }}>
                  Descrição & Observações Operacionais do Empreendimento
                </label>
                <textarea
                  rows={3}
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Informações adicionais sobre o complexo minerário, histórico de lavra e infraestrutura..."
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    color: '#ffffff',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Botões do Rodapé */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '8px',
                paddingTop: '0.75rem',
                borderTop: '1px solid #334155'
              }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '0.55rem 1.1rem',
                    borderRadius: '6px',
                    backgroundColor: 'transparent',
                    border: '1px solid #475569',
                    color: '#cbd5e1',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '6px',
                    backgroundColor: '#0284c7',
                    border: '1px solid #38bdf8',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(2, 132, 199, 0.4)'
                  }}
                >
                  {editingEmp ? 'Salvar Alterações' : 'Cadastrar Empreendimento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpreendimentosTab;
