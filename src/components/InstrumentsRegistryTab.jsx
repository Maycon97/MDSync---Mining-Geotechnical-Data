import React, { useState, useMemo } from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { 
  Database, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Info,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Sun
} from 'lucide-react';

export const InstrumentsRegistryTab = () => {
  const { instruments, structures, activeStructureId } = useGeotechData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStruct, setFilterStruct] = useState(activeStructureId);
  const [filterType, setFilterType] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const filtered = useMemo(() => {
    return instruments.filter(inst => {
      if (filterStruct !== 'TODAS') {
        const matchStruct = inst.estrutura && (inst.estrutura.replace(/\s+/g, '_') === filterStruct || inst.estrutura === filterStruct);
        if (!matchStruct) return false;
      }
      if (filterType !== 'TODOS' && inst.tipo !== filterType) {
        return false;
      }
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const match = 
          (inst.estrutura && inst.estrutura.toLowerCase().includes(term)) ||
          (inst.tipo && inst.tipo.toLowerCase().includes(term)) ||
          (inst.id && String(inst.id).toLowerCase().includes(term)) ||
          (inst.secao && inst.secao.toLowerCase().includes(term));
        if (!match) return false;
      }
      return true;
    });
  }, [instruments, filterStruct, filterType, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Exportar Cadastro para CSV
  const handleExportRegistry = () => {
    if (filtered.length === 0) return;
    const headers = [
      'Estrutura', 'Tipo', 'ID', 'Seção', 'Data Instalação', 'Diâmetro',
      'Profundidade', 'Cota Topo', 'Cota Base', 'Cota Fundo', 'Lat', 'Lon',
      'Limite Normal', 'Limite Atenção', 'Limite Alerta', 'Limite Emergência', 'Status Atual'
    ];
    const rows = filtered.map(i => [
      `"${i.estrutura || ''}"`,
      `"${i.tipo || ''}"`,
      `"${i.id || ''}"`,
      `"${i.secao || ''}"`,
      `"${i.dataInstalacao || ''}"`,
      `"${i.diametro || ''}"`,
      i.profundidadeInstalacao || '',
      i.cotaTopo || '',
      i.cotaBase || '',
      i.cotaFundo || '',
      i.lat || '',
      i.lon || '',
      i.limiteNormal || '',
      i.limiteAtencao || '',
      i.limiteAlerta || '',
      i.limiteEmergencia || '',
      `"${i.statusCalculado || 'NORMAL'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MDSync_Cadastro_218_Instrumentos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Barra de Filtro e Controles */}
      <div className="card-panel" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={20} style={{ color: 'var(--primary-accent)' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Cadastro Geral de Instrumentação Geotécnica ({instruments.length} Instrumentos)
              </h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Ficha técnica com cotas de projeto, profundidades, coordenadas e limites de controle da ANM
            </p>
          </div>

          <button
            onClick={handleExportRegistry}
            className="btn-primary"
            style={{ fontSize: '0.825rem', padding: '0.5rem 0.95rem' }}
          >
            <Download size={16} />
            <span>Exportar Cadastro Completo</span>
          </button>
        </div>

        {/* Inputs de Busca e Filtros */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '0.75rem'
        }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input
              type="text"
              placeholder="Buscar por ID, tipo, seção..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="form-input"
              style={{ paddingLeft: '32px', width: '100%', fontSize: '0.825rem' }}
            />
          </div>

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

          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            className="form-select"
            style={{ fontSize: '0.825rem' }}
          >
            <option value="TODOS">Todos os Tipos de Instrumentos</option>
            <option value="INA">INA (Indicador de Nível d'Água)</option>
            <option value="PZ">PZ (Piezômetro)</option>
            <option value="MV">MV (Medidor de Vazão)</option>
            <option value="VT">VT (Vertedouro)</option>
            <option value="TILT">TILT (Tiltímetro / Inclinômetro)</option>
            <option value="REF">REF (Marco Topográfico)</option>
            <option value="ETR">ETR (Estação Total / Extensômetro)</option>
            <option value="MCD">MCD (Marco de Deslocamento)</option>
          </select>
        </div>
      </div>

      {/* Tabela de Instrumentos */}
      <div className="card-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Estrutura</th>
                <th>Tipo / ID</th>
                <th>Seção</th>
                <th>Cota Topo</th>
                <th>Cota Base</th>
                <th>Profundidade</th>
                <th>Limite Atenção</th>
                <th>Limite Emergência</th>
                <th>Status Atual</th>
                <th>Leitura</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((inst, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{inst.estrutura}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span className="font-mono" style={{ fontWeight: 700, color: 'var(--primary-accent)' }}>
                        {inst.tipo} {inst.id}
                      </span>
                      {inst.condicaoHistorica === 'NA' && (
                        <span className="badge-na-water" style={{ padding: '0.1rem 0.35rem', fontSize: '0.62rem' }} title="Nível d'Água (N.A) ativo">
                          <Droplet size={10} className="water-drip-1" fill="#38bdf8" />
                          <span>N.A</span>
                        </span>
                      )}
                      {inst.condicaoHistorica === 'SECO' && (
                        <span className="badge-seco-animated" style={{ padding: '0.1rem 0.35rem', fontSize: '0.62rem' }} title="Instrumento historicamente seco">
                          <Sun size={10} className="seco-icon-spin" />
                          <span>SECO</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{inst.secao || '-'}</td>
                  <td className="font-mono">{inst.cotaTopo !== null ? `${inst.cotaTopo} m` : '-'}</td>
                  <td className="font-mono">{inst.cotaBase !== null ? `${inst.cotaBase} m` : '-'}</td>
                  <td className="font-mono">{inst.profundidadeInstalacao !== null ? `${inst.profundidadeInstalacao} m` : '-'}</td>
                  <td className="font-mono" style={{ color: 'var(--geo-atencao)' }}>
                    {inst.limiteAtencao !== null ? `${inst.limiteAtencao} m` : '-'}
                  </td>
                  <td className="font-mono" style={{ color: 'var(--geo-emergencia)', fontWeight: 700 }}>
                    {inst.limiteEmergencia !== null ? `${inst.limiteEmergencia} m` : '-'}
                  </td>
                  <td>
                    <span className={`badge-status ${inst.statusCalculado === 'EMERGÊNCIA' ? 'badge-emergencia' : inst.statusCalculado === 'ATENÇÃO' ? 'badge-atencao' : 'badge-normal'}`}>
                      {inst.statusCalculado}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {inst.leituraTipo || 'Manual'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
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
            Exibindo <strong>{paginatedData.length}</strong> de <strong>{filtered.length}</strong> instrumentos
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
            <span>{currentPage} / {totalPages}</span>
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
    </div>
  );
};
