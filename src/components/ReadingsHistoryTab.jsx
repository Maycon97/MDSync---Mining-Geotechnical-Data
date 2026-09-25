import React, { useState, useMemo } from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { 
  History, 
  Search, 
  Download, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Camera,
  Droplet,
  Droplets,
  Sun,
  X
} from 'lucide-react';

export const ReadingsHistoryTab = () => {
  const { readingsPiezometria, readingsVazao, readingsVertedouro, structures, activeStructureId } = useGeotechData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStruct, setFilterStruct] = useState(activeStructureId);
  const [filterType, setFilterType] = useState('TODOS');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Consolidar todas as leituras
  const allReadings = useMemo(() => {
    const list = [];
    
    readingsPiezometria.forEach(r => {
      list.push({
        ...r,
        tipoGeral: 'Piezometria (N.A)',
        unidade: 'm',
        valorExibido: r.cotaLeitura != null ? r.cotaLeitura : (r.leitura != null ? r.leitura : '-')
      });
    });

    readingsVazao.forEach(r => {
      list.push({
        ...r,
        tipoGeral: 'Vazão (Drenos)',
        unidade: 'L/s',
        valorExibido: r.ls !== null && r.ls !== undefined ? r.ls : (r.q ? (r.q * 1000).toFixed(2) : '-')
      });
    });

    readingsVertedouro.forEach(r => {
      list.push({
        ...r,
        tipoGeral: 'Vertedouro',
        unidade: 'm³/s',
        valorExibido: r.q !== null && r.q !== undefined ? r.q : (r.h ? r.h : '-')
      });
    });

    return list.sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
  }, [readingsPiezometria, readingsVazao, readingsVertedouro]);

  // Aplicar filtros
  const filteredReadings = useMemo(() => {
    return allReadings.filter(r => {
      // Filtro de Estrutura
      if (filterStruct !== 'TODAS') {
        const matchStruct = r.estrutura && (r.estrutura.replace(/\s+/g, '_') === filterStruct || r.estrutura === filterStruct);
        if (!matchStruct) return false;
      }

      // Filtro de Tipo
      if (filterType !== 'TODOS' && r.tipo !== filterType) {
        return false;
      }

      // Filtro de Status
      if (filterStatus !== 'TODOS') {
        const st = (r.status || '').toUpperCase();
        if (filterStatus === 'NORMAL' && !st.includes('NORMAL')) return false;
        if (filterStatus === 'ATENÇÃO' && !st.includes('ATEN')) return false;
        if (filterStatus === 'EMERGÊNCIA' && !st.includes('EMERG')) return false;
      }

      // Busca de Texto Livre
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const match = 
          (r.estrutura && r.estrutura.toLowerCase().includes(term)) ||
          (r.tipo && r.tipo.toLowerCase().includes(term)) ||
          (r.id && String(r.id).toLowerCase().includes(term)) ||
          (r.data && r.data.includes(term)) ||
          (r.situacao && r.situacao.toLowerCase().includes(term));
        if (!match) return false;
      }

      return true;
    });
  }, [allReadings, filterStruct, filterType, filterStatus, searchTerm]);

  // Paginação
  const totalPages = Math.max(1, Math.ceil(filteredReadings.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReadings.slice(start, start + pageSize);
  }, [filteredReadings, currentPage, pageSize]);

  // Exportar para CSV
  const handleExportCSV = () => {
    if (filteredReadings.length === 0) return;

    const headers = ['Estrutura', 'Tipo', 'ID', 'Data', 'Valor Medido', 'Unidade', 'Status', 'Situação'];
    const rows = filteredReadings.map(r => [
      `"${r.estrutura || ''}"`,
      `"${r.tipo || ''}"`,
      `"${r.id || ''}"`,
      `"${r.data ? r.data.split(' ')[0] : ''}"`,
      r.valorExibido !== null ? r.valorExibido : '',
      `"${r.unidade || ''}"`,
      `"${r.status || 'NORMAL'}"`,
      `"${r.situacao || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MDSync_Leituras_Geotecnicas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Barra de Filtros e Busca */}
      <div className="card-panel" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={20} style={{ color: 'var(--primary-accent)' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Histórico Geral de Leituras Geotécnicas
              </h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Total de <strong>{filteredReadings.length}</strong> registros encontrados (filtrados do banco mestre)
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="btn-primary"
            style={{ fontSize: '0.825rem', padding: '0.5rem 0.95rem' }}
          >
            <Download size={16} />
            <span>Exportar CSV (Excel / ANM)</span>
          </button>
        </div>

        {/* Controles de Filtro */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          alignItems: 'center'
        }}>
          {/* Campo de Busca Livre */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input
              type="text"
              placeholder="Buscar por ID, data, estrutura..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="form-input"
              style={{ paddingLeft: '32px', width: '100%', fontSize: '0.825rem' }}
            />
          </div>

          {/* Filtro Estrutura */}
          <select
            value={filterStruct}
            onChange={(e) => {
              setFilterStruct(e.target.value);
              setCurrentPage(1);
            }}
            className="form-select"
            style={{ fontSize: '0.825rem' }}
          >
            <option value="TODAS">Todas as Estruturas</option>
            {structures.map(s => (
              <option key={s.id} value={s.id}>{s.nome}</option>
            ))}
          </select>

          {/* Filtro Tipo */}
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            className="form-select"
            style={{ fontSize: '0.825rem' }}
          >
            <option value="TODOS">Todos os Instrumentos</option>
            <option value="INA">INA (Nível d'Água)</option>
            <option value="PZ">PZ (Piezômetro)</option>
            <option value="MV">MV (Medidor de Vazão)</option>
            <option value="VT">VT (Vertedouro)</option>
          </select>

          {/* Filtro Status */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="form-select"
            style={{ fontSize: '0.825rem' }}
          >
            <option value="TODOS">Todos os Níveis</option>
            <option value="NORMAL">Normal</option>
            <option value="ATENÇÃO">Atenção</option>
            <option value="EMERGÊNCIA">Emergência</option>
          </select>
        </div>
      </div>

      {/* Tabela de Dados */}
      <div className="card-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Estrutura</th>
                <th>Instrumento</th>
                <th>Categoria</th>
                <th>Data da Leitura</th>
                <th>Valor / Cota Medida</th>
                <th>Status</th>
                <th>Evidência / Variação</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, idx) => {
                  const isEmerg = (row.status || '').includes('EMERG');
                  const isAtenc = (row.status || '').includes('ATEN');
                  const isPiezo = row.tipo === 'INA' || row.tipo === 'PZ' || row.tipo === 'NA';
                  const isSeco = isPiezo && ((row.status || '').toUpperCase().includes('SECO') || (row.situacao || '').toUpperCase().includes('SECO') || row.condicaoHistorica === 'SECO');
                  const isNA = isPiezo && !isSeco;

                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{row.estrutura}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span className="font-mono" style={{ fontWeight: 700, color: 'var(--primary-accent)' }}>
                            {row.tipo} {row.id}
                          </span>
                          {isNA && (
                            <span className="badge-na-water" style={{ padding: '0.1rem 0.4rem', fontSize: '0.62rem' }} title="Presença de Nível d'Água (N.A)">
                              <Droplet size={10} className="water-drip-1" fill="#38bdf8" />
                              <span>N.A</span>
                            </span>
                          )}
                          {isSeco && (
                            <span className="badge-seco-animated" style={{ padding: '0.1rem 0.4rem', fontSize: '0.62rem' }} title="Instrumento seco (sem espelho d'água)">
                              <Sun size={10} className="seco-icon-spin" />
                              <span>SECO</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.tipoGeral}</td>
                      <td className="font-mono">{row.data ? row.data.split(' ')[0] : '-'}</td>
                      <td>
                        <strong className="font-mono" style={{ fontSize: '0.95rem' }}>
                          {row.valorExibido !== null ? `${row.valorExibido} ${row.unidade}` : '-'}
                        </strong>
                      </td>
                      <td>
                        {row.status === 'SECO' ? (
                          <span className="badge-seco-animated" style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>
                            <Sun size={11} className="seco-icon-spin" />
                            <span>SECO</span>
                          </span>
                        ) : (
                          <span className={`badge-status ${isEmerg ? 'badge-emergencia' : isAtenc ? 'badge-atencao' : 'badge-normal'}`}>
                            {row.status || 'NORMAL'}
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                          {row.foto ? (
                            <button
                              type="button"
                              onClick={() => setSelectedPhoto(row.foto)}
                              className="btn-secondary"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                              title="Visualizar registro fotográfico da leitura"
                            >
                              <Camera size={13} style={{ color: 'var(--primary-accent)' }} />
                              <span>Foto</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>-</span>
                          )}

                          {row.deltaCm !== null && row.deltaCm !== undefined && (
                            <span
                              className={`badge-status ${Math.abs(row.deltaCm) > 5 ? 'badge-atencao' : 'badge-normal'}`}
                              style={{ fontSize: '0.68rem', padding: '0.15rem 0.35rem' }}
                              title={`Variação na leitura do piu vs anterior: ${row.deltaCm} cm (tolerância máxima: 5 cm)`}
                            >
                              Δ {row.deltaCm > 0 ? `+${row.deltaCm}` : row.deltaCm} cm
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {row.situacao || 'Operacional'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé de Paginação */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-secondary)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> ({filteredReadings.length} itens)
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-secondary"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            >
              <ChevronLeft size={16} />
              <span>Anterior</span>
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-secondary"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            >
              <span>Próxima</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Exibição da Foto da Leitura */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card-panel animate-scale-up"
            style={{
              maxWidth: '560px',
              width: '100%',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Camera size={18} style={{ color: 'var(--primary-accent)' }} />
                Evidência Fotográfica da Leitura
              </h4>
              <button onClick={() => setSelectedPhoto(null)} className="btn-secondary" style={{ padding: '0.3rem' }}>
                <X size={16} />
              </button>
            </div>
            <img
              src={selectedPhoto}
              alt="Foto da Leitura"
              style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#0f172a' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedPhoto(null)} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
