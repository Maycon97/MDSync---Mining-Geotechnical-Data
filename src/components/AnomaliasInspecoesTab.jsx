import React, { useState, useMemo } from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Search, 
  Plus, 
  FileText, 
  Camera, 
  MapPin, 
  SlidersHorizontal, 
  ChevronRight, 
  Wrench, 
  ArrowUpRight, 
  CheckSquare, 
  X, 
  ExternalLink,
  LifeBuoy,
  ClipboardCheck,
  ShieldCheck,
  Sparkles,
  Settings,
  Flame
} from 'lucide-react';
import { FirSurvey123Form } from './FirSurvey123Form';
import { RecordIdTemplateModal } from './RecordIdTemplateModal';
import { InspectionSettingsModal } from './InspectionSettingsModal';
import { recordIdTemplateService } from '../services/recordIdTemplateService';
import { storageService } from '../services/storageService';

export const AnomaliasInspecoesTab = ({ onNavigateTab }) => {
  const { 
    structures = [], 
    anomaliasGeotecnicas = [], 
    inspecoesGeotecnicas = [], 
    planosAcao = [],
    anomalies = [],
    addAnomaliaGeotecnica,
    updateAnomaliaGeotecnica,
    addInspecaoGeotecnica,
    addPlanoAcao,
    updatePlanoAcao,
    setSystemToast
  } = useGeotechData();

  const [activeSubTab, setActiveSubTab] = useState('anomalias'); // 'anomalias', 'inspecoes', 'planos', 'radar'
  const [filterEstrutura, setFilterEstrutura] = useState('TODAS');
  const [filterCategoria, setFilterCategoria] = useState('TODAS');
  const [filterSeveridade, setFilterSeveridade] = useState('TODAS');
  const [searchQuery, setSearchQuery] = useState('');

  // Modais
  const [modalAnomaliaOpen, setModalAnomaliaOpen] = useState(false);
  const [modalInspecaoOpen, setModalInspecaoOpen] = useState(false);
  const [modalPlanoOpen, setModalPlanoOpen] = useState(false);
  const [selectedAnomaliaParaPlano, setSelectedAnomaliaParaPlano] = useState(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [inspectionSettingsModalOpen, setInspectionSettingsModalOpen] = useState(false);

  // Formulário Nova Anomalia
  const [novaAnomalia, setNovaAnomalia] = useState({
    estrutura: 'BARRAGEM B1',
    categoria: 'Barragens',
    localizacao: '',
    cota: '',
    tipo: 'Trinca Longitudinal',
    classificacao: 'Nível 1 - Baixa (Atenção)',
    severidade: 1,
    descricao: '',
    responsavel: 'Engenheiro Geotécnico'
  });

  // Formulário Nova Inspeção
  const [novaInspecao, setNovaInspecao] = useState({
    tipo: 'ISR',
    titulo: '',
    estrutura: 'BARRAGEM B1',
    categoria: 'Barragens',
    data: new Date().toISOString().split('T')[0],
    inspetor: 'Eng. Geotécnico Responsável (CREA)',
    resultadoGeral: 'Conforme / Normal',
    parecerTecnico: ''
  });

  // Formulário Novo Plano 5W2H
  const [novoPlano, setNovoPlano] = useState({
    titulo: '',
    estrutura: 'BARRAGEM B1',
    categoria: 'Barragens',
    anomaliaId: '',
    oQue: '',
    porQue: '',
    quem: '',
    onde: '',
    quando: '',
    como: '',
    quanto: '',
    prioridade: 'Alta'
  });

  // Anomalias filtradas
  const anomaliasFiltradas = useMemo(() => {
    return anomaliasGeotecnicas.filter(anom => {
      if (filterEstrutura !== 'TODAS' && anom.estrutura !== filterEstrutura) return false;
      if (filterCategoria !== 'TODAS' && anom.categoria !== filterCategoria) return false;
      if (filterSeveridade !== 'TODAS' && String(anom.severidade) !== String(filterSeveridade)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = anom.codigo?.toLowerCase().includes(q);
        const matchDesc = anom.descricao?.toLowerCase().includes(q);
        const matchLoc = anom.localizacao?.toLowerCase().includes(q);
        const matchTipo = anom.tipo?.toLowerCase().includes(q);
        if (!matchCode && !matchDesc && !matchLoc && !matchTipo) return false;
      }
      return true;
    });
  }, [anomaliasGeotecnicas, filterEstrutura, filterCategoria, filterSeveridade, searchQuery]);

  // Contadores de Severidade
  const contadores = useMemo(() => {
    const total = anomaliasGeotecnicas.length;
    const n1 = anomaliasGeotecnicas.filter(a => a.severidade === 1).length;
    const n2 = anomaliasGeotecnicas.filter(a => a.severidade === 2).length;
    const n3 = anomaliasGeotecnicas.filter(a => a.severidade === 3).length;
    const tratadas = anomaliasGeotecnicas.filter(a => a.status === 'Mitigada / Fechada').length;
    return { total, n1, n2, n3, tratadas };
  }, [anomaliasGeotecnicas]);

  // Handlers
  const handleCriarAnomalia = (e) => {
    e.preventDefault();
    if (!novaAnomalia.localizacao || !novaAnomalia.descricao) {
      alert('Por favor, preencha a localização e a descrição da anomalia.');
      return;
    }

    const rules = storageService.getInspectionRules();
    if (rules.habilitarRegistroAvulso === false) {
      alert('Atenção: A inserção de registro avulso está desabilitada nas configurações do sistema. Os registros só podem ser criados dentro de uma campanha formal de inspeção.');
      return;
    }

    const struct = structures.find(s => s.nome === novaAnomalia.estrutura || s.id === novaAnomalia.estrutura);
    const categoria = struct ? (struct.categoria || 'Barragens') : 'Barragens';

    // Gerar código usando o template engine do SYSDAM
    const template = storageService.getRecordIdTemplate();
    const nextCounter = anomaliasGeotecnicas.length + 1;
    const codigoGerado = recordIdTemplateService.interpolateTemplate(template, {
      siglaEmpreendimento: 'IT',
      estrutura: novaAnomalia.estrutura,
      nomeSintoma: novaAnomalia.tipo,
      id: String(nextCounter),
      dataOcorrencia: new Date()
    }, nextCounter);

    addAnomaliaGeotecnica({
      ...novaAnomalia,
      codigo: codigoGerado,
      categoria,
      status: 'Identificada'
    });

    if (setSystemToast) {
      setSystemToast({
        type: 'success',
        message: `Ocorrência "${codigoGerado}" registrada com sucesso!`
      });
    }

    setModalAnomaliaOpen(false);
    setNovaAnomalia({
      estrutura: 'BARRAGEM B1',
      categoria: 'Barragens',
      localizacao: '',
      cota: '',
      tipo: 'Trinca Longitudinal',
      classificacao: 'Nível 1 - Baixa (Atenção)',
      severidade: 1,
      descricao: '',
      responsavel: 'Engenheiro Geotécnico'
    });
  };

  const handleCriarInspecao = (e) => {
    e.preventDefault();
    if (!novaInspecao.titulo || !novaInspecao.parecerTecnico) {
      alert('Por favor, informe o título e o parecer técnico da inspeção.');
      return;
    }
    const struct = structures.find(s => s.nome === novaInspecao.estrutura || s.id === novaInspecao.estrutura);
    const categoria = struct ? (struct.categoria || 'Barragens') : 'Barragens';

    addInspecaoGeotecnica({
      ...novaInspecao,
      categoria,
      status: 'Concluída'
    });
    setModalInspecaoOpen(false);
  };

  const handleAbrirPlanoParaAnomalia = (anomalia) => {
    setSelectedAnomaliaParaPlano(anomalia);
    setNovoPlano({
      titulo: `Plano de Tratamento para ${anomalia.codigo} (${anomalia.tipo})`,
      estrutura: anomalia.estrutura,
      categoria: anomalia.categoria,
      anomaliaId: anomalia.id,
      oQue: `Mitigação da anomalia ${anomalia.tipo} na cota ${anomalia.cota || 'N/A'}.`,
      porQue: `Evitar evolução do dano e manter conformidade com a Portaria ANM nº 95/2022.`,
      quem: anomalia.responsavel || 'Equipe Geotécnica Itaminas',
      onde: anomalia.localizacao,
      quando: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      como: 'Mobilização de equipe especializada para intervenção civil preventiva.',
      quanto: 'A estimar',
      prioridade: anomalia.severidade >= 2 ? 'Crítica' : 'Alta'
    });
    setModalPlanoOpen(true);
  };

  const handleSalvarPlano = (e) => {
    e.preventDefault();
    if (!novoPlano.titulo || !novoPlano.oQue) {
      alert('Por favor, preencha o título e as ações do plano 5W2H.');
      return;
    }
    const saved = addPlanoAcao(novoPlano);
    if (saved && selectedAnomaliaParaPlano) {
      updateAnomaliaGeotecnica(selectedAnomaliaParaPlano.id, {
        status: 'Ação em Andamento',
        planoAcaoId: saved.id
      });
    }
    setModalPlanoOpen(false);
    setSelectedAnomaliaParaPlano(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Cabeçalho do Módulo Sentnel */}
      <div className="card-panel" style={{
        padding: '1rem 1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: 'var(--geo-emergencia)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Gestão de Anomalias & Inspeções (ISR / ISE)
              </h2>
              <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: 'var(--geo-atencao)', fontSize: '0.7rem' }}>
                PORTARIA ANM 95/2022
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Registro de ocorrências, classificação de risco regulatório e planos de ação corretiva 5W2H
            </p>
          </div>
        </div>

        {/* Botões de Ação Rápida */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setTemplateModalOpen(true)}
            className="btn-subtle"
            style={{
              padding: '0.5rem 0.85rem',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(124, 58, 237, 0.1)',
              borderColor: 'rgba(124, 58, 237, 0.3)',
              color: '#a855f7',
              fontWeight: 700
            }}
            title="Configurar Template do Identificador do Registro (SYSDAM)"
          >
            <Sparkles size={16} />
            <span>Template ID</span>
          </button>

          <button
            onClick={() => setInspectionSettingsModalOpen(true)}
            className="btn-subtle"
            style={{
              padding: '0.5rem 0.85rem',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              fontWeight: 600
            }}
            title="Configurar regras operacionais de inspeção (SYSDAM)"
          >
            <Settings size={16} />
            <span>Regras SYSDAM</span>
          </button>

          <button
            onClick={() => setActiveSubTab('fir_survey123')}
            className="btn-secondary"
            style={{
              padding: '0.5rem 0.9rem',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: activeSubTab === 'fir_survey123' ? 'var(--primary-accent)' : 'rgba(2, 132, 199, 0.1)',
              borderColor: 'var(--primary-accent)',
              color: activeSubTab === 'fir_survey123' ? '#ffffff' : 'var(--primary-accent)',
              fontWeight: 700
            }}
            title="Abrir Formulário de Inspeção Regular FIR - Survey123 (Portaria ANM 95/2022)"
          >
            <ClipboardCheck size={16} />
            <span>Ficha FIR Survey123 (ANM 95)</span>
          </button>

          <button
            onClick={() => setModalAnomaliaOpen(true)}
            className="btn-primary"
            style={{
              padding: '0.5rem 0.9rem',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#ef4444',
              borderColor: '#ef4444'
            }}
          >
            <AlertTriangle size={16} />
            <span>Registrar Anomalia</span>
          </button>

          <button
            onClick={() => setModalInspecaoOpen(true)}
            className="btn-primary"
            style={{
              padding: '0.5rem 0.9rem',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Plus size={16} />
            <span>Nova Inspeção</span>
          </button>
        </div>
      </div>

      {/* Cards de Resumo e Severidade */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.75rem'
      }}>
        <div className="card-panel" style={{ padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)', color: 'var(--primary-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FileText size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Total de Anomalias</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {contadores.total}
            </div>
          </div>
        </div>

        <div className="card-panel" style={{ padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderColor: 'var(--geo-atencao-border)' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            backgroundColor: 'var(--geo-atencao-bg)', color: 'var(--geo-atencao)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Nível 1 (Atenção)</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--geo-atencao)' }}>
              {contadores.n1}
            </div>
          </div>
        </div>

        <div className="card-panel" style={{ padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderColor: 'rgba(249, 115, 22, 0.4)' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            backgroundColor: 'rgba(249, 115, 22, 0.15)', color: '#f97316',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Flame size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Nível 2 (Alerta)</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f97316' }}>
              {contadores.n2}
            </div>
          </div>
        </div>

        <div className="card-panel" style={{ padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderColor: 'var(--geo-emergencia-border)' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            backgroundColor: 'var(--geo-emergencia-bg)', color: 'var(--geo-emergencia)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Nível 3 (Emergência)</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--geo-emergencia)' }}>
              {contadores.n3}
            </div>
          </div>
        </div>

        <div className="card-panel" style={{ padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--geo-normal)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Mitigadas / Fechadas</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--geo-normal)' }}>
              {contadores.tratadas}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Abas de Navegação */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        gap: '0.5rem',
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }}>
        <button
          onClick={() => setActiveSubTab('fir_survey123')}
          style={{
            padding: '0.65rem 1.15rem',
            border: 'none',
            borderBottom: activeSubTab === 'fir_survey123' ? '2px solid var(--primary-accent)' : '2px solid transparent',
            background: 'transparent',
            color: activeSubTab === 'fir_survey123' ? 'var(--primary-accent)' : 'var(--text-muted)',
            fontWeight: activeSubTab === 'fir_survey123' ? 800 : 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            whiteSpace: 'nowrap'
          }}
        >
          <ClipboardCheck size={16} />
          <span>Ficha FIR Survey123 (Portaria ANM 95)</span>
          <span className="badge-pill-clean" style={{ backgroundColor: 'rgba(2, 132, 199, 0.15)', color: 'var(--primary-accent)' }}>
            OFICIAL
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('anomalias')}
          style={{
            padding: '0.65rem 1.15rem',
            border: 'none',
            borderBottom: activeSubTab === 'anomalias' ? '2px solid var(--primary-accent)' : '2px solid transparent',
            background: 'transparent',
            color: activeSubTab === 'anomalias' ? 'var(--primary-accent)' : 'var(--text-muted)',
            fontWeight: activeSubTab === 'anomalias' ? 800 : 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            whiteSpace: 'nowrap'
          }}
        >
          <AlertTriangle size={16} />
          <span>Matriz de Anomalias ({anomaliasGeotecnicas.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('inspecoes')}
          style={{
            padding: '0.65rem 1.15rem',
            border: 'none',
            borderBottom: activeSubTab === 'inspecoes' ? '2px solid var(--primary-accent)' : '2px solid transparent',
            background: 'transparent',
            color: activeSubTab === 'inspecoes' ? 'var(--primary-accent)' : 'var(--text-muted)',
            fontWeight: activeSubTab === 'inspecoes' ? 800 : 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            whiteSpace: 'nowrap'
          }}
        >
          <CheckSquare size={16} />
          <span>Inspeções Regulares e Especiais ({inspecoesGeotecnicas.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('planos')}
          style={{
            padding: '0.65rem 1.15rem',
            border: 'none',
            borderBottom: activeSubTab === 'planos' ? '2px solid var(--primary-accent)' : '2px solid transparent',
            background: 'transparent',
            color: activeSubTab === 'planos' ? 'var(--primary-accent)' : 'var(--text-muted)',
            fontWeight: activeSubTab === 'planos' ? 800 : 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Wrench size={16} />
          <span>Planos de Ação 5W2H ({planosAcao.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('anomalias_pcmi')}
          style={{
            padding: '0.65rem 1.15rem',
            border: 'none',
            borderBottom: activeSubTab === 'anomalias_pcmi' ? '2px solid var(--primary-accent)' : '2px solid transparent',
            background: 'transparent',
            color: activeSubTab === 'anomalias_pcmi' ? 'var(--primary-accent)' : 'var(--text-muted)',
            fontWeight: activeSubTab === 'anomalias_pcmi' ? 800 : 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            whiteSpace: 'nowrap'
          }}
        >
          <ShieldAlert size={16} />
          <span>Anomalias Piezométricas PCMI ({anomalies.length})</span>
          <span className="badge-pill-clean" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
            VALIDADO PCMI
          </span>
        </button>
      </div>

      {/* ABA 0: FICHA FIR SURVEY123 (PORTARIA ANM 95/2022) */}
      {activeSubTab === 'fir_survey123' && (
        <FirSurvey123Form />
      )}

      {/* ABA 0.5: ANOMALIAS PIEZOMÉTRICAS CONFRONTADAS COM O BANCO PCMI */}
      {activeSubTab === 'anomalias_pcmi' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Card de Auditoria Geotécnica com o Banco Central */}
          <div className="card-panel glass-panel" style={{
            padding: '1.25rem',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: 'var(--primary-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Auditoria e Reconciliação com o Banco Central PCMI (Itaminas)
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Origem dos Dados: <code style={{ color: 'var(--primary-accent)', fontSize: '0.72rem' }}>C:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\01) PCMI</code>
                  </span>
                </div>
              </div>
              <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 800, fontSize: '0.75rem' }}>
                ✓ 32.311 LEITURAS AUDITADAS
              </span>
            </div>

            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
              Todas as anomalias detectadas pelo sistema foram confrontadas e auditadas contra o banco histórico oficial de monitoramento da Itaminas (<strong style={{ color: 'var(--text-main)' }}>Banco_De_Dados.xlsx</strong> e <strong style={{ color: 'var(--text-main)' }}>CARTA DE RISCO.xlsx</strong>). As 7 anomalias da Pilha B2 e Barragem B4 eram decorrentes de falso-positivo de igualdade de topo ou tubo seco com status oficial <strong>NORMAL</strong>, tendo sido baixadas tecnicamente. Permanece como <strong>Prioridade Máxima Operacional</strong> a sobrelevação de nível freático no piezômetro <strong>07/04 na Cava Jangada</strong> (+1.0m acima da atenção).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.25rem' }}>
              <div style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Total de Eventos Auditados</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{anomalies.length}</div>
              </div>
              <div style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <span style={{ fontSize: '0.7rem', color: '#10b981' }}>Resolvidas / Baixadas PCMI</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                  {anomalies.filter(a => a.status === 'RESOLVIDA').length}
                </div>
              </div>
              <div style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>Em Monitoramento Prioritário</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444' }}>
                  {anomalies.filter(a => a.status !== 'RESOLVIDA').length}
                </div>
              </div>
            </div>
          </div>

          {/* Cards das Anomalias Piezométricas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
            {anomalies.map(anom => {
              const isResolvida = anom.status === 'RESOLVIDA';
              const corStatus = isResolvida ? '#10b981' : '#ef4444';
              const bgStatus = isResolvida ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.12)';

              return (
                <div 
                  key={anom.id}
                  className="card-panel glass-panel"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderLeft: `4px solid ${corStatus}`,
                    padding: '1.15rem',
                    gap: '0.85rem'
                  }}
                >
                  <div>
                    {/* Cabeçalho */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                            {anom.tipo} - {anom.instrumentoId}
                          </strong>
                          <span className="badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: 'var(--primary-accent)', fontSize: '0.7rem' }}>
                            {anom.estruturaNome || anom.estrutura}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ID: {anom.id} • Data: {anom.dataHora}
                        </span>
                      </div>
                      <span className="badge" style={{ backgroundColor: bgStatus, color: corStatus, fontSize: '0.7rem', fontWeight: 800 }}>
                        {anom.statusLabel || anom.status}
                      </span>
                    </div>

                    {/* Descrição */}
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-main)', margin: '0.35rem 0', fontWeight: 600 }}>
                      {anom.descricao}
                    </p>

                    {/* Parecer Geotécnico */}
                    <div style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: isResolvida ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                      border: isResolvida ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.25)',
                      marginTop: '0.5rem',
                      fontSize: '0.775rem',
                      lineHeight: '1.45',
                      color: 'var(--text-main)'
                    }}>
                      <div style={{ fontWeight: 800, color: corStatus, fontSize: '0.7rem', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>PARECER TÉCNICO OFICIAL (BANCO PCMI)</span>
                      </div>
                      {anom.parecerGeotecnico}
                    </div>

                    {/* Cotas & Limites */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.4rem',
                      fontSize: '0.75rem',
                      backgroundColor: 'var(--bg-secondary)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      marginTop: '0.6rem'
                    }}>
                      <div>
                        <span style={{ color: 'var(--text-faint)' }}>Cota Lida:</span>{' '}
                        <strong className="font-mono" style={{ color: 'var(--text-main)' }}>{anom.cotaAtual} m</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-faint)' }}>Limite Atenção:</span>{' '}
                        <strong className="font-mono" style={{ color: isResolvida ? 'var(--text-main)' : '#ef4444' }}>{anom.limite} m</strong>
                      </div>
                    </div>
                  </div>

                  {/* Rodapé e Ações */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.65rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.725rem',
                    color: 'var(--text-muted)'
                  }}>
                    <span>Validado: <strong>{anom.responsavelAuditoria || anom.responsavelResolucao || 'Eng. Geotécnico'}</strong></span>
                    <button
                      onClick={() => {
                        if (onNavigateTab) onNavigateTab('gis');
                      }}
                      className="btn-secondary"
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <MapPin size={12} />
                      <span>Ver na Planta GIS</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 1: MATRIZ DE ANOMALIAS */}
      {activeSubTab === 'anomalias' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Barra de Filtros e Pesquisa */}
          <div className="card-panel" style={{
            padding: '0.85rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{ flex: '1 1 200px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              <input
                type="text"
                placeholder="Buscar por código, tipo, localização ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem 0.45rem 2rem',
                  fontSize: '0.8rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--text-main)'
                }}
              />
            </div>

            {/* Filtro de Categoria Sentnel */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Categoria:</span>
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.8rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--text-main)'
                }}
              >
                <option value="TODAS">Todas as Categorias</option>
                <option value="Barragens">Barragens</option>
                <option value="Pilhas">Pilhas</option>
                <option value="Taludes">Taludes</option>
                <option value="Cavas">Cavas</option>
              </select>
            </div>

            {/* Filtro de Severidade */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Severidade:</span>
              <select
                value={filterSeveridade}
                onChange={(e) => setFilterSeveridade(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.8rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--text-main)'
                }}
              >
                <option value="TODAS">Todos os Níveis</option>
                <option value="1">Nível 1 - Baixa (Atenção)</option>
                <option value="2">Nível 2 - Média (Alerta)</option>
                <option value="3">Nível 3 - Alta (Emergência)</option>
              </select>
            </div>
          </div>

          {/* Listagem de Anomalias */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '0.85rem' }}>
            {anomaliasFiltradas.length === 0 ? (
              <div className="card-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                <CheckCircle2 size={36} style={{ color: 'var(--geo-normal)', margin: '0 auto 0.5rem' }} />
                <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 700 }}>
                  Nenhuma anomalia encontrada com os filtros selecionados
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  As estruturas monitoradas estão dentro dos parâmetros de estabilidade regulamentar.
                </p>
              </div>
            ) : (
              anomaliasFiltradas.map(anom => {
                const corSeveridade = anom.severidade === 3 ? 'var(--geo-emergencia)' : (anom.severidade === 2 ? '#f97316' : 'var(--geo-atencao)');
                const bgSeveridade = anom.severidade === 3 ? 'var(--geo-emergencia-bg)' : (anom.severidade === 2 ? 'rgba(249, 115, 22, 0.15)' : 'var(--geo-atencao-bg)');

                return (
                  <div 
                    key={anom.id}
                    className="card-panel"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderLeft: `4px solid ${corSeveridade}`,
                      padding: '1rem',
                      gap: '0.75rem'
                    }}
                  >
                    <div>
                      {/* Topo do Card */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                              {anom.codigo}
                            </strong>
                            <span className="badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: 'var(--primary-accent)', fontSize: '0.68rem' }}>
                              {anom.estrutura}
                            </span>
                            <span className="badge" style={{ backgroundColor: 'rgba(148, 163, 184, 0.15)', color: 'var(--text-muted)', fontSize: '0.68rem' }}>
                              {anom.categoria}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: corSeveridade, display: 'block', marginTop: '2px' }}>
                            {anom.tipo}
                          </span>
                        </div>

                        <span className="badge" style={{ backgroundColor: bgSeveridade, color: corSeveridade, fontSize: '0.7rem', fontWeight: 800 }}>
                          {anom.classificacao}
                        </span>
                      </div>

                      {/* Descrição */}
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', margin: '0.4rem 0' }}>
                        {anom.descricao}
                      </p>

                      {/* Metadados Geotécnicos */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.4rem',
                        fontSize: '0.75rem',
                        backgroundColor: 'var(--bg-secondary)',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        marginTop: '0.5rem'
                      }}>
                        <div>
                          <span style={{ color: 'var(--text-faint)' }}>Local:</span>{' '}
                          <strong style={{ color: 'var(--text-main)' }}>{anom.localizacao}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-faint)' }}>Cota:</span>{' '}
                          <strong style={{ color: 'var(--text-main)' }}>{anom.cota || 'N/A'}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-faint)' }}>Data:</span>{' '}
                          <span style={{ color: 'var(--text-main)' }}>{anom.dataIdentificacao}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-faint)' }}>Status:</span>{' '}
                          <strong style={{ color: anom.status === 'Mitigada / Fechada' ? 'var(--geo-normal)' : '#f59e0b' }}>
                            {anom.status}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Ações Rápidas */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid var(--border-subtle)',
                      gap: '0.5rem'
                    }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                        Resp: {anom.responsavel}
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {anom.planoAcaoId ? (
                          <button
                            onClick={() => setActiveSubTab('planos')}
                            className="btn-secondary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Wrench size={12} />
                            <span>Ver Plano ({anom.planoAcaoId})</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAbrirPlanoParaAnomalia(anom)}
                            className="btn-primary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Plus size={12} />
                            <span>Criar 5W2H</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ABA 2: INSPEÇÕES REGULARES & ESPECIAIS (ISR / ISE) */}
      {activeSubTab === 'inspecoes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
            {inspecoesGeotecnicas.map(insp => {
              const isISR = insp.tipo === 'ISR';

              return (
                <div key={insp.id} className="card-panel" style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className="badge" style={{
                          backgroundColor: isISR ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isISR ? 'var(--primary-accent)' : 'var(--geo-emergencia)',
                          fontSize: '0.75rem',
                          fontWeight: 800
                        }}>
                          {insp.tipo} • {insp.id}
                        </span>
                        <span className="badge" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                          {insp.estrutura}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                        {insp.titulo}
                      </h4>
                    </div>

                    <span className="badge" style={{
                      backgroundColor: insp.status === 'Concluída' ? 'var(--geo-normal-bg)' : 'var(--geo-atencao-bg)',
                      color: insp.status === 'Concluída' ? 'var(--geo-normal)' : 'var(--geo-atencao)',
                      fontSize: '0.7rem'
                    }}>
                      {insp.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    "{insp.parecerTecnico}"
                  </p>

                  {/* Checklist dos Componentes Inspecionados */}
                  {insp.itensInspecionados && Object.keys(insp.itensInspecionados).length > 0 && (
                    <div style={{
                      backgroundColor: 'var(--bg-secondary)',
                      padding: '0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.3rem'
                    }}>
                      <strong style={{ color: 'var(--text-main)', fontSize: '0.75rem' }}>Status dos Componentes:</strong>
                      {Object.entries(insp.itensInspecionados).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                          <span style={{ textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}:</span>
                          <strong style={{ color: 'var(--text-main)' }}>{v}</strong>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.72rem',
                    color: 'var(--text-faint)',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--border-subtle)'
                  }}>
                    <div>Data: {insp.data} • Inspetor: {insp.inspetor}</div>
                    {insp.proximaInspecao && (
                      <div>Próxima: <strong style={{ color: 'var(--primary-accent)' }}>{insp.proximaInspecao}</strong></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 3: PLANOS DE AÇÃO 5W2H */}
      {activeSubTab === 'planos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
            {planosAcao.map(plano => {
              return (
                <div key={plano.id} className="card-panel" style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className="badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: 'var(--primary-accent)', fontSize: '0.7rem', fontWeight: 800 }}>
                          5W2H • {plano.id}
                        </span>
                        <span className="badge" style={{ backgroundColor: 'rgba(249, 115, 22, 0.15)', color: '#f97316', fontSize: '0.7rem' }}>
                          Prioridade: {plano.prioridade}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                        {plano.titulo}
                      </h4>
                    </div>

                    <span className="badge" style={{
                      backgroundColor: plano.status === 'Concluído' ? 'var(--geo-normal-bg)' : 'var(--geo-atencao-bg)',
                      color: plano.status === 'Concluído' ? 'var(--geo-normal)' : 'var(--geo-atencao)',
                      fontSize: '0.7rem'
                    }}>
                      {plano.status} ({plano.progresso}%)
                    </span>
                  </div>

                  {/* Barra de Progresso */}
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${plano.progresso}%`,
                      height: '100%',
                      backgroundColor: plano.progresso === 100 ? 'var(--geo-normal)' : 'var(--primary-accent)',
                      transition: 'width 0.3s'
                    }} />
                  </div>

                  {/* Grid 5W2H Técnico */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.4rem',
                    fontSize: '0.75rem',
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '0.6rem',
                    borderRadius: '6px'
                  }}>
                    <div><span style={{ color: 'var(--text-faint)' }}>What (O quê):</span> <p style={{ color: 'var(--text-main)', margin: '2px 0' }}>{plano.oQue}</p></div>
                    <div><span style={{ color: 'var(--text-faint)' }}>Why (Por quê):</span> <p style={{ color: 'var(--text-main)', margin: '2px 0' }}>{plano.porQue}</p></div>
                    <div><span style={{ color: 'var(--text-faint)' }}>Who (Quem):</span> <p style={{ color: 'var(--text-main)', margin: '2px 0' }}>{plano.quem}</p></div>
                    <div><span style={{ color: 'var(--text-faint)' }}>Where (Onde):</span> <p style={{ color: 'var(--text-main)', margin: '2px 0' }}>{plano.onde}</p></div>
                    <div><span style={{ color: 'var(--text-faint)' }}>When (Quando):</span> <p style={{ color: 'var(--text-main)', margin: '2px 0' }}>{plano.quando}</p></div>
                    <div><span style={{ color: 'var(--text-faint)' }}>Cost (Quanto):</span> <p style={{ color: 'var(--text-main)', margin: '2px 0' }}>{plano.quanto || 'Sem custo'}</p></div>
                  </div>

                  {/* Atualizar Progresso Rápido */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.4rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Avanço da Execução:</span>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      {[25, 50, 75, 100].map(val => (
                        <button
                          key={val}
                          onClick={() => updatePlanoAcao(plano.id, { progresso: val, status: val === 100 ? 'Concluído' : 'Em Execução' })}
                          style={{
                            padding: '0.2rem 0.45rem',
                            fontSize: '0.7rem',
                            borderRadius: '4px',
                            border: '1px solid var(--border-subtle)',
                            backgroundColor: plano.progresso >= val ? 'var(--primary-accent)' : 'transparent',
                            color: plano.progresso >= val ? '#ffffff' : 'var(--text-muted)',
                            cursor: 'pointer'
                          }}
                        >
                          {val}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: REGISTRAR NOVA ANOMALIA */}
      {modalAnomaliaOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '580px', width: '92%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={22} style={{ color: 'var(--geo-emergencia)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Registrar Anomalia Geotécnica
                </h3>
              </div>
              <button onClick={() => setModalAnomaliaOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCriarAnomalia} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ESTRUTURA:</label>
                  <select
                    value={novaAnomalia.estrutura}
                    onChange={(e) => setNovaAnomalia({ ...novaAnomalia, estrutura: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  >
                    {structures.map(s => <option key={s.id} value={s.nome}>{s.nome} ({s.categoria || 'Estrutura'})</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TIPO DE ANOMALIA:</label>
                  <select
                    value={novaAnomalia.tipo}
                    onChange={(e) => setNovaAnomalia({ ...novaAnomalia, tipo: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  >
                    <option value="Trinca Longitudinal">Trinca Longitudinal (Crista / Berma)</option>
                    <option value="Trinca Transversal">Trinca Transversal</option>
                    <option value="Surgência de Água">Surgência de Água / Percolação</option>
                    <option value="Erosão de Superfície / Sulco">Erosão de Superfície / Sulco</option>
                    <option value="Assoreamento de Canaleta">Assoreamento de Canaleta</option>
                    <option value="Recalque / Deformação Visual">Recalque / Deformação Visual</option>
                    <option value="Desplacamento de Rocha">Desplacamento de Rocha em Bancada</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>CLASSIFICAÇÃO DE SEVERIDADE:</label>
                  <select
                    value={novaAnomalia.severidade}
                    onChange={(e) => {
                      const sev = parseInt(e.target.value, 10);
                      const labels = {
                        1: 'Nível 1 - Baixa (Atenção)',
                        2: 'Nível 2 - Média (Alerta)',
                        3: 'Nível 3 - Alta (Emergência)'
                      };
                      setNovaAnomalia({ ...novaAnomalia, severidade: sev, classificacao: labels[sev] });
                    }}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  >
                    <option value="1">Nível 1 - Baixa (Atenção)</option>
                    <option value="2">Nível 2 - Média (Alerta)</option>
                    <option value="3">Nível 3 - Alta (Emergência)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>COTA APROXIMADA (m):</label>
                  <input
                    type="text"
                    placeholder="Ex: 851.60 m"
                    value={novaAnomalia.cota}
                    onChange={(e) => setNovaAnomalia({ ...novaAnomalia, cota: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>LOCALIZAÇÃO DETALHADA / ESTACA:</label>
                <input
                  type="text"
                  placeholder="Ex: Crista central, Estaca 14+15m, próximo ao PZ-03"
                  value={novaAnomalia.localizacao}
                  onChange={(e) => setNovaAnomalia({ ...novaAnomalia, localizacao: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>DESCRIÇÃO DETALHADA & MEDIDAS OBSERVADAS:</label>
                <textarea
                  rows="3"
                  placeholder="Descreva extensões, aberturas, presença de água límpida ou com finos, vestígios de movimentação..."
                  value={novaAnomalia.descricao}
                  onChange={(e) => setNovaAnomalia({ ...novaAnomalia, descricao: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setModalAnomaliaOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}>
                  Salvar Anomalia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CRIAR PLANO 5W2H */}
      {modalPlanoOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '640px', width: '92%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wrench size={22} style={{ color: 'var(--primary-accent)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Plano de Ação 5W2H (Ação Corretiva CAPA)
                </h3>
              </div>
              <button onClick={() => setModalPlanoOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarPlano} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TÍTULO DO PLANO:</label>
                <input
                  type="text"
                  value={novoPlano.titulo}
                  onChange={(e) => setNovoPlano({ ...novoPlano, titulo: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>WHAT (O que será feito):</label>
                  <input
                    type="text"
                    value={novoPlano.oQue}
                    onChange={(e) => setNovoPlano({ ...novoPlano, oQue: e.target.value })}
                    style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>WHY (Por que fazer):</label>
                  <input
                    type="text"
                    value={novoPlano.porQue}
                    onChange={(e) => setNovoPlano({ ...novoPlano, porQue: e.target.value })}
                    style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>WHO (Quem executará):</label>
                  <input
                    type="text"
                    value={novoPlano.quem}
                    onChange={(e) => setNovoPlano({ ...novoPlano, quem: e.target.value })}
                    style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>WHEN (Prazo Limite):</label>
                  <input
                    type="date"
                    value={novoPlano.quando}
                    onChange={(e) => setNovoPlano({ ...novoPlano, quando: e.target.value })}
                    style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>HOW (Como será executado):</label>
                  <input
                    type="text"
                    value={novoPlano.como}
                    onChange={(e) => setNovoPlano({ ...novoPlano, como: e.target.value })}
                    style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>HOW MUCH (Custo):</label>
                  <input
                    type="text"
                    value={novoPlano.quanto}
                    onChange={(e) => setNovoPlano({ ...novoPlano, quanto: e.target.value })}
                    style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setModalPlanoOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Salvar Plano 5W2H
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: NOVA INSPEÇÃO REGULAR / ESPECIAL */}
      {modalInspecaoOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '580px', width: '92%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckSquare size={22} style={{ color: 'var(--primary-accent)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Registrar Inspeção de Segurança
                </h3>
              </div>
              <button onClick={() => setModalInspecaoOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCriarInspecao} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TIPO DE INSPEÇÃO:</label>
                  <select
                    value={novaInspecao.tipo}
                    onChange={(e) => setNovaInspecao({ ...novaInspecao, tipo: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  >
                    <option value="ISR">ISR (Regular ANM 95/2022)</option>
                    <option value="ISE">ISE (Especial Pós-Evento Crítico)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TÍTULO DA INSPEÇÃO:</label>
                  <input
                    type="text"
                    placeholder="Ex: Inspeção Regular Quinzenal - Barragem B1"
                    value={novaInspecao.titulo}
                    onChange={(e) => setNovaInspecao({ ...novaInspecao, titulo: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ESTRUTURA:</label>
                  <select
                    value={novaInspecao.estrutura}
                    onChange={(e) => setNovaInspecao({ ...novaInspecao, estrutura: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  >
                    {structures.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>INSPETOR RESPONSÁVEL:</label>
                  <input
                    type="text"
                    value={novaInspecao.inspetor}
                    onChange={(e) => setNovaInspecao({ ...novaInspecao, inspetor: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PARECER TÉCNICO CONCLUSIVO:</label>
                <textarea
                  rows="3"
                  placeholder="Condição geral da estrutura, comportamento dos drenos e instrumentação, recomendações imediatas..."
                  value={novaInspecao.parecerTecnico}
                  onChange={(e) => setNovaInspecao({ ...novaInspecao, parecerTecnico: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setModalInspecaoOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Concluir Inspeção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modais SYSDAM: Template do Identificador e Regras de Inspeção */}
      <RecordIdTemplateModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSave={(tpl) => {
          if (setSystemToast) {
            setSystemToast({
              type: 'success',
              message: `Template do identificador atualizado: "${tpl}"`
            });
          }
        }}
      />

      <InspectionSettingsModal
        isOpen={inspectionSettingsModalOpen}
        onClose={() => setInspectionSettingsModalOpen(false)}
        onSave={() => {
          if (setSystemToast) {
            setSystemToast({
              type: 'success',
              message: 'Parâmetros de inspeção atualizados com sucesso!'
            });
          }
        }}
      />
    </div>
  );
};
