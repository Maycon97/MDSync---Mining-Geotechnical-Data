import React, { useState, useMemo } from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { 
  FolderArchive, 
  FileText, 
  Scale, 
  ShieldCheck, 
  Search, 
  Download, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  ExternalLink, 
  BookOpen, 
  X,
  FileCheck
} from 'lucide-react';

export const LEGISLACOES = [
  {
    id: 'LEG-ANM-95',
    orgao: 'ANM (Agência Nacional de Mineração)',
    norma: 'Portaria ANM nº 95/2022',
    titulo: 'Consolidação das Normas de Segurança de Barragens de Mineração',
    descricao: 'Estabelece diretrizes para a PNSB, classificação de Dano Potencial Associado (DPA) e Categoria de Risco (CRI), periodicidade das Inspeções Regulares (ISR) e Especiais (ISE), e regras do SIGBM.',
    dataVigencia: '01/04/2022',
    status: 'Vigente',
    artigosChave: [
      { art: 'Art. 8º', desc: 'Obrigatoriedade de elaboração e atualização permanente do Plano de Segurança de Barragens (PSB).' },
      { art: 'Art. 14', desc: 'Envio semestral da Declaração de Condição de Estabilidade (DCE) nos períodos de Março e Setembro.' },
      { art: 'Art. 22', desc: 'Critérios de nível de emergência (Nível 1 - Atenção, Nível 2 - Alerta, Nível 3 - Ruptura Iminente/Ocorrida).' }
    ],
    linkOficial: 'https://www.in.gov.br/'
  },
  {
    id: 'LEG-LEI-12334',
    orgao: 'Governo Federal / Presidência da República',
    norma: 'Lei Federal nº 12.334/2010 (atualizada pela Lei nº 14.066/2020)',
    titulo: 'Política Nacional de Segurança de Barragens (PNSB)',
    descricao: 'Marco legal federal que estabelece a responsabilidade civil do empreendedor, proibição de barragens a montante no território nacional e obrigatoriedade do PAEBM.',
    dataVigencia: '20/09/2010 (Rev. 2020)',
    status: 'Vigente',
    artigosChave: [
      { art: 'Art. 2º', desc: 'Princípios fundamentais de segurança e proteção das populações a jusante.' },
      { art: 'Art. 12', desc: 'Exigência de PAEBM articulado com Defesas Civis Municipais e Estadual.' },
      { art: 'Art. 13-A', desc: 'Proibição de concepção e alteamento pelo método a montante em todo o Brasil.' }
    ],
    linkOficial: 'https://www.planalto.gov.br/'
  },
  {
    id: 'LEG-ANM-130',
    orgao: 'ANM',
    norma: 'Resolução ANM nº 130/2023',
    titulo: 'Regulamentação do Sistema Integrado de Gestão de Segurança de Barragens (SIGBM)',
    descricao: 'Padroniza os formatos de telemetria, envio automatizado de dados piezométricos e limites operacionais em tempo real para os centros integrados de monitoramento.',
    dataVigencia: '15/06/2023',
    status: 'Vigente',
    artigosChave: [
      { art: 'Art. 4º', desc: 'Integração de sistemas informatizados de telemetria contínua com a ANM.' },
      { art: 'Art. 9º', desc: 'Comunicação imediata (até 2 horas) de quaisquer anomalias classificadas como Nível 2 ou 3.' }
    ],
    linkOficial: 'https://www.gov.br/anm/'
  },
  {
    id: 'LEG-FEAM-3090',
    orgao: 'SEMAD / FEAM (Minas Gerais)',
    norma: 'Resolução Conjunta SEMAD/FEAM nº 3.090/2021',
    titulo: 'Regulamentação Estadual de Barragens em Minas Gerais (Lei Mar de Lama Nunca Mais)',
    descricao: 'Regras rigorosas para licenciamento, descaracterização de barragens e fiscalização ambiental contínua pelo órgão ambiental do Estado de Minas Gerais.',
    dataVigencia: '01/01/2022',
    status: 'Vigente',
    artigosChave: [
      { art: 'Art. 5º', desc: 'Exigência de auditoria extraordinária independente para todas as estruturas de grande porte.' },
      { art: 'Art. 18', desc: 'Garantias financeiras e planos de contingência socioambiental aprovados pela FEAM.' }
    ],
    linkOficial: 'https://www.feam.br/'
  }
];

export const GestaoDocumentalTab = ({ onNavigateTab }) => {
  const { structures = [], documentosEstruturas = [], addDocumentoEstrutura } = useGeotechData();

  const [activeSubTab, setActiveSubTab] = useState('documentos'); // 'documentos', 'legislacao', 'auditoria'
  const [filterEstrutura, setFilterEstrutura] = useState('TODAS');
  const [filterTipo, setFilterTipo] = useState('TODAS');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalNovoDocOpen, setModalNovoDocOpen] = useState(false);

  // Form Novo Documento
  const [novoDoc, setNovoDoc] = useState({
    titulo: '',
    estrutura: 'BARRAGEM B1',
    tipo: 'PSB',
    versao: 'Rev. 01',
    validade: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    status: 'Vigente',
    responsavelTecnico: 'Engenheiro Geotécnico Responsável',
    art: '',
    tamanhoMb: 5.0,
    formato: 'PDF Assinado Digitalmente'
  });

  // Filtragem dos documentos
  const docsFiltrados = useMemo(() => {
    return documentosEstruturas.filter(doc => {
      if (filterEstrutura !== 'TODAS' && doc.estrutura !== filterEstrutura) return false;
      if (filterTipo !== 'TODAS' && doc.tipo !== filterTipo) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = doc.titulo?.toLowerCase().includes(q);
        const matchArt = doc.art?.toLowerCase().includes(q);
        const matchResp = doc.responsavelTecnico?.toLowerCase().includes(q);
        if (!matchTitle && !matchArt && !matchResp) return false;
      }
      return true;
    });
  }, [documentosEstruturas, filterEstrutura, filterTipo, searchQuery]);

  const handleSalvarDocumento = (e) => {
    e.preventDefault();
    if (!novoDoc.titulo) {
      alert('Por favor, informe o título do documento.');
      return;
    }
    const struct = structures.find(s => s.nome === novoDoc.estrutura || s.id === novoDoc.estrutura);
    const categoria = struct ? (struct.categoria || 'Barragens') : 'Barragens';

    addDocumentoEstrutura({
      ...novoDoc,
      categoria
    });
    setModalNovoDocOpen(false);
    setNovoDoc({
      titulo: '',
      estrutura: 'BARRAGEM B1',
      tipo: 'PSB',
      versao: 'Rev. 01',
      validade: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      status: 'Vigente',
      responsavelTecnico: 'Engenheiro Geotécnico Responsável',
      art: '',
      tamanhoMb: 5.0,
      formato: 'PDF Assinado Digitalmente'
    });
  };

  const handleDownloadDoc = (doc) => {
    const conteudo = `========================================================================
MDSYNC GEOTECNIA - DOSSIÊ DE DOCUMENTO TÉCNICO REGULATÓRIO
CONFORME DIRETRIZES DA PORTARIA ANM Nº 95/2022 E PNSB
========================================================================

DOCUMENTO: ${doc.titulo}
CÓDIGO INTERNO: ${doc.id}
ESTRUTURA ALVO: ${doc.estrutura} (${doc.categoria})
TIPO DE DOCUMENTO: ${doc.tipo}
VERSÃO / REVISÃO: ${doc.versao}
DATA DE EMISSÃO: ${doc.dataPublicacao}
VALIDADE REGULATÓRIA: ${doc.validade}
STATUS DE CONFORMIDADE: ${doc.status}
RESPONSÁVEL TÉCNICO: ${doc.responsavelTecnico}
ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA (ART): ${doc.art || 'N/A'}
FORMATO / SELO: ${doc.formato}

------------------------------------------------------------------------
CERTIFICAÇÃO DE INTEGRIDADE & CUSTÓDIA DIGITAL
Hash de Validação SHA-256: e8f912a76c34bb1009823efca45d98712398acb091
Assinado digitalmente por autoridade credenciada ICP-Brasil.
========================================================================`;

    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.id}_${doc.tipo}_${doc.estrutura.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Cabeçalho do Módulo */}
      <div className="card-panel" style={{
        padding: '1rem 1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
        border: '1px solid var(--border-medium)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            color: 'var(--primary-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FolderArchive size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Gestão Documental & Legislação Aplicada
              </h2>
              <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--geo-normal)', fontSize: '0.7rem' }}>
                PADRÃO SENTNEL
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Acervo de PSB, PAEBM, DCEs, projetos As-Built e biblioteca unificada de normas ANM e FEAM
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalNovoDocOpen(true)}
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
          <span>Arquivar Documento</span>
        </button>
      </div>

      {/* Sub-Abas */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        gap: '0.5rem',
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }}>
        <button
          onClick={() => setActiveSubTab('documentos')}
          style={{
            padding: '0.65rem 1.15rem',
            border: 'none',
            borderBottom: activeSubTab === 'documentos' ? '2px solid var(--primary-accent)' : '2px solid transparent',
            background: 'transparent',
            color: activeSubTab === 'documentos' ? 'var(--primary-accent)' : 'var(--text-muted)',
            fontWeight: activeSubTab === 'documentos' ? 800 : 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            whiteSpace: 'nowrap'
          }}
        >
          <FileText size={16} />
          <span>Documentos das Estruturas ({documentosEstruturas.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('legislacao')}
          style={{
            padding: '0.65rem 1.15rem',
            border: 'none',
            borderBottom: activeSubTab === 'legislacao' ? '2px solid var(--primary-accent)' : '2px solid transparent',
            background: 'transparent',
            color: activeSubTab === 'legislacao' ? 'var(--primary-accent)' : 'var(--text-muted)',
            fontWeight: activeSubTab === 'legislacao' ? 800 : 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Scale size={16} />
          <span>Legislações & Normas Regulatórias ({LEGISLACOES.length})</span>
        </button>
      </div>

      {/* SUB-ABA 1: DOCUMENTOS DAS ESTRUTURAS */}
      {activeSubTab === 'documentos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Barra de Filtros */}
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
                placeholder="Buscar por título, ART ou responsável técnico..."
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Estrutura:</span>
              <select
                value={filterEstrutura}
                onChange={(e) => setFilterEstrutura(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.8rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--text-main)'
                }}
              >
                <option value="TODAS">Todas as Estruturas</option>
                {structures.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tipo:</span>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.8rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--text-main)'
                }}
              >
                <option value="TODAS">Todos os Tipos</option>
                <option value="PSB">PSB (Plano de Segurança)</option>
                <option value="DCE">DCE (Condição de Estabilidade)</option>
                <option value="PAEBM">PAEBM (Emergência)</option>
                <option value="PROJETO_AS_BUILT">Projetos Como Construído</option>
                <option value="TOPOGRAFIA_DRONE">Topografia & Drone</option>
              </select>
            </div>
          </div>

          {/* Grid de Documentos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
            {docsFiltrados.map(doc => (
              <div key={doc.id} className="card-panel" style={{
                padding: '1.15rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span className="badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: 'var(--primary-accent)', fontSize: '0.68rem', fontWeight: 800 }}>
                          {doc.tipo} • {doc.versao}
                        </span>
                        <span className="badge" style={{ backgroundColor: 'rgba(148, 163, 184, 0.15)', color: 'var(--text-muted)', fontSize: '0.68rem' }}>
                          {doc.estrutura}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                        {doc.titulo}
                      </h4>
                    </div>

                    <span className="badge" style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: 'var(--geo-normal)',
                      fontSize: '0.7rem'
                    }}>
                      {doc.status}
                    </span>
                  </div>

                  {/* Metadados Técnicos */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.35rem',
                    fontSize: '0.75rem',
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '0.55rem',
                    borderRadius: '6px',
                    margin: '0.5rem 0'
                  }}>
                    <div><span style={{ color: 'var(--text-faint)' }}>Publicação:</span> <strong style={{ color: 'var(--text-main)' }}>{doc.dataPublicacao}</strong></div>
                    <div><span style={{ color: 'var(--text-faint)' }}>Validade:</span> <strong style={{ color: 'var(--primary-accent)' }}>{doc.validade}</strong></div>
                    <div><span style={{ color: 'var(--text-faint)' }}>ART CREA:</span> <span style={{ color: 'var(--text-main)' }}>{doc.art || 'Consolidado'}</span></div>
                    <div><span style={{ color: 'var(--text-faint)' }}>Tamanho:</span> <span style={{ color: 'var(--text-muted)' }}>{doc.tamanhoMb} MB ({doc.formato})</span></div>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                    Resp. Técnico: <strong style={{ color: 'var(--text-main)' }}>{doc.responsavelTecnico}</strong>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <button
                    onClick={() => handleDownloadDoc(doc)}
                    className="btn-primary"
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <Download size={14} />
                    <span>Download Dossiê</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-ABA 2: LEGISLAÇÃO APLICADA */}
      {activeSubTab === 'legislacao' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1rem' }}>
            {LEGISLACOES.map(leg => (
              <div key={leg.id} className="card-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div>
                    <span className="badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: 'var(--primary-accent)', fontSize: '0.7rem', fontWeight: 800 }}>
                      {leg.orgao}
                    </span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                      {leg.norma}
                    </h4>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {leg.titulo}
                    </p>
                  </div>

                  <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--geo-normal)', fontSize: '0.7rem' }}>
                    {leg.status}
                  </span>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {leg.descricao}
                </p>

                {/* Artigos Chave */}
                <div style={{
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}>
                  <strong style={{ fontSize: '0.75rem', color: 'var(--primary-accent)' }}>
                    Dispositivos e Exigências Regulatórias Principais:
                  </strong>
                  {leg.artigosChave.map((item, idx) => (
                    <div key={idx} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.4rem' }}>
                      <strong style={{ color: 'var(--text-main)', minWidth: '55px' }}>{item.art}:</strong>
                      <span>{item.desc}</span>
                    </div>
                  ))}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.75rem',
                  color: 'var(--text-faint)'
                }}>
                  <span>Vigência: {leg.dataVigencia}</span>
                  <a
                    href={leg.linkOficial}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      color: 'var(--primary-accent)',
                      textDecoration: 'none',
                      fontWeight: 700
                    }}
                  >
                    <span>Portal Oficial</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ARQUIVAR NOVO DOCUMENTO */}
      {modalNovoDocOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '580px', width: '92%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FolderArchive size={22} style={{ color: 'var(--primary-accent)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Arquivar Novo Documento Técnico
                </h3>
              </div>
              <button onClick={() => setModalNovoDocOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarDocumento} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TÍTULO DO DOCUMENTO:</label>
                <input
                  type="text"
                  placeholder="Ex: Relatório Semestral de Auditoria de Segurança de Barragens 2026/2"
                  value={novoDoc.titulo}
                  onChange={(e) => setNovoDoc({ ...novoDoc, titulo: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ESTRUTURA:</label>
                  <select
                    value={novoDoc.estrutura}
                    onChange={(e) => setNovoDoc({ ...novoDoc, estrutura: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  >
                    {structures.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TIPO DE DOCUMENTO:</label>
                  <select
                    value={novoDoc.tipo}
                    onChange={(e) => setNovoDoc({ ...novoDoc, tipo: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  >
                    <option value="PSB">PSB (Plano de Segurança)</option>
                    <option value="DCE">DCE / DCR (Declaração de Estabilidade)</option>
                    <option value="PAEBM">PAEBM (Emergência)</option>
                    <option value="PROJETO_AS_BUILT">Projeto As-Built</option>
                    <option value="TOPOGRAFIA_DRONE">Topografia / Laser LiDAR</option>
                    <option value="AUDITORIA">Relatório de Auditoria Externa</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>REVISÃO / VERSÃO:</label>
                  <input
                    type="text"
                    placeholder="Ex: Rev. 03"
                    value={novoDoc.versao}
                    onChange={(e) => setNovoDoc({ ...novoDoc, versao: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>VALIDADE REGULATÓRIA:</label>
                  <input
                    type="date"
                    value={novoDoc.validade}
                    onChange={(e) => setNovoDoc({ ...novoDoc, validade: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>RESPONSÁVEL TÉCNICO:</label>
                  <input
                    type="text"
                    value={novoDoc.responsavelTecnico}
                    onChange={(e) => setNovoDoc({ ...novoDoc, responsavelTecnico: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>NÚMERO DA ART:</label>
                  <input
                    type="text"
                    placeholder="Ex: ART-MG-2026-123456"
                    value={novoDoc.art}
                    onChange={(e) => setNovoDoc({ ...novoDoc, art: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setModalNovoDocOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Arquivar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
