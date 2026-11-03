import React, { useState, useMemo } from 'react';
import {
  CRONOGRAMA_ITEMS,
  ESTRUTURAS_COORDENADAS,
  STATUS_CONFIG,
  MESES_ORDENADOS,
  getCronogramaStatusBadge
} from '../data/cronogramaData';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Search,
  RotateCcw,
  Download,
  ChevronRight,
  Eye,
  MapPin,
  Building2,
  Layers,
  AlertCircle,
  FileSpreadsheet,
  X,
  Activity,
  Check,
  ChevronDown
} from 'lucide-react';

export const CronogramaSection = ({ onNavigateTab }) => {
  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMes, setSelectedMes] = useState('Todos');
  const [selectedAno, setSelectedAno] = useState('Todos');
  const [selectedEstrutura, setSelectedEstrutura] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedDesvio, setSelectedDesvio] = useState('Todos');
  const [quickFilter, setQuickFilter] = useState('todos'); // 'todos' | 'atrasadas' | 'futuras' | 'concluidas'

  // Visualização e paginação
  const [viewMode, setViewMode] = useState('tabela'); // 'tabela' | 'calendario' | 'estruturas'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Modal de detalhes
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);

  // Lista de estruturas distintas
  const estruturasList = useMemo(() => {
    const set = new Set();
    CRONOGRAMA_ITEMS.forEach(item => {
      if (item.estrutura) set.add(item.estrutura);
    });
    return Array.from(set).sort();
  }, []);

  // Lista de desvios distintos
  const desviosList = useMemo(() => {
    const set = new Set();
    CRONOGRAMA_ITEMS.forEach(item => {
      if (item.desvio) set.add(item.desvio);
    });
    return Array.from(set).sort();
  }, []);

  // Filtragem precisa dos itens do cronograma
  const filteredItems = useMemo(() => {
    return CRONOGRAMA_ITEMS.filter(item => {
      // Filtro Ano
      if (selectedAno !== 'Todos') {
        const itemAno = (item.dataPlanejada || '').slice(0, 4);
        if (itemAno !== selectedAno) return false;
      }

      // Filtro Mês
      if (selectedMes !== 'Todos') {
        if (item.mes !== selectedMes) return false;
      }

      // Filtro Estrutura
      if (selectedEstrutura !== 'Todas') {
        if (item.estrutura !== selectedEstrutura) return false;
      }

      // Filtro Status
      if (selectedStatus !== 'Todos') {
        if (item.status !== selectedStatus) return false;
      }

      // Filtro Desvio
      if (selectedDesvio !== 'Todos') {
        if (selectedDesvio === 'Sem Desvio') {
          if (item.desvio) return false;
        } else if (item.desvio !== selectedDesvio) {
          return false;
        }
      }

      // Filtro Rápido
      if (quickFilter === 'atrasadas') {
        if (item.status !== 'Realizado com Atraso' && item.status !== 'Reprogramada') return false;
      } else if (quickFilter === 'futuras') {
        if (item.status !== 'Ações futuras') return false;
      } else if (quickFilter === 'concluidas') {
        if (item.status !== 'Concluído') return false;
      }

      // Busca textual
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${item.id} ${item.estrutura} ${item.acao} ${item.dataPlanejada} ${item.dataRealizada} ${item.status} ${item.desvio || ''} ${item.justificativa || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [selectedAno, selectedMes, selectedEstrutura, selectedStatus, selectedDesvio, quickFilter, searchQuery]);

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const total = CRONOGRAMA_ITEMS.length;
    const concluidos = CRONOGRAMA_ITEMS.filter(i => i.status === 'Concluído').length;
    const comAtraso = CRONOGRAMA_ITEMS.filter(i => i.status === 'Realizado com Atraso').length;
    const reprogramadas = CRONOGRAMA_ITEMS.filter(i => i.status === 'Reprogramada').length;
    const futuras = CRONOGRAMA_ITEMS.filter(i => i.status === 'Ações futuras').length;
    const aderencia = total > 0 ? ((concluidos / (concluidos + comAtraso + reprogramadas || 1)) * 100).toFixed(1) : '0';

    return { total, concluidos, comAtraso, reprogramadas, futuras, aderencia };
  }, []);

  // Paginação
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Resetar página ao mudar filtros
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedMes('Todos');
    setSelectedAno('Todos');
    setSelectedEstrutura('Todas');
    setSelectedStatus('Todos');
    setSelectedDesvio('Todos');
    setQuickFilter('todos');
    setCurrentPage(1);
  };

  // Formatação de data
  const formatDateBR = (iso) => {
    if (!iso) return '—';
    const parts = iso.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return iso;
  };

  // Exportar para CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Estrutura', 'Mês', 'Dia', 'Data Planejada', 'Ação', 'Ciclo', 'Data Realizada', 'Desvio', 'Status', 'Justificativa'];
    const rows = filteredItems.map(item => [
      item.id,
      `"${item.estrutura || ''}"`,
      `"${item.mes || ''}"`,
      item.dia || '',
      item.dataPlanejada || '',
      `"${(item.acao || '').replace(/"/g, '""')}"`,
      item.ciclo || '',
      item.dataRealizada || '',
      `"${item.desvio || ''}"`,
      `"${item.status || ''}"`,
      `"${(item.justificativa || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Cronograma_Geotecnico_PCM_Itaminas.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Agrupamento para visão calendário (datas distintas)
  const calendarGroups = useMemo(() => {
    const groups = {};
    filteredItems.forEach(item => {
      const dateKey = item.dataPlanejada || 'Sem Data';
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0])).slice(0, 30);
  }, [filteredItems]);

  // Agrupamento para visão estruturas
  const structureGroups = useMemo(() => {
    const groups = {};
    filteredItems.forEach(item => {
      const est = item.estrutura || 'Geral';
      if (!groups[est]) groups[est] = { total: 0, concluidos: 0, atraso: 0, reprog: 0, futuras: 0, items: [] };
      groups[est].total += 1;
      if (item.status === 'Concluído') groups[est].concluidos += 1;
      else if (item.status === 'Realizado com Atraso') groups[est].atraso += 1;
      else if (item.status === 'Reprogramada') groups[est].reprog += 1;
      else groups[est].futuras += 1;
      groups[est].items.push(item);
    });
    return Object.entries(groups).sort((a, b) => b[1].total - a[1].total);
  }, [filteredItems]);

  return (
    <div id="cronograma-section" className="card-panel" style={{
      padding: '1.5rem',
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-medium)',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      position: 'relative'
    }}>
      
      {/* 1. CABEÇALHO DO CRONOGRAMA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            color: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.25)'
          }}>
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                Cronograma Geotécnico & PCM
              </h2>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <CheckCircle2 size={12} />
                Espelho Fiel Excel (1.693 Tarefas)
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Planejamento e rastreamento rigoroso de inspeções, monitoramento de instrumentação, FIR, voos de drone e relatórios com datas e justificativas.
            </p>
          </div>
        </div>

        {/* Controles de visualização e download */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Alternador de visualizações */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '10px',
            padding: '3px',
            border: '1px solid var(--border-subtle)',
            gap: '3px'
          }}>
            <button
              onClick={() => setViewMode('tabela')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'tabela' ? 'var(--primary-accent)' : 'transparent',
                color: viewMode === 'tabela' ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.15s'
              }}
            >
              <FileSpreadsheet size={13} />
              <span>Tabela</span>
            </button>

            <button
              onClick={() => setViewMode('calendario')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'calendario' ? 'var(--primary-accent)' : 'transparent',
                color: viewMode === 'calendario' ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.15s'
              }}
            >
              <Calendar size={13} />
              <span>Linha do Tempo</span>
            </button>

            <button
              onClick={() => setViewMode('estruturas')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'estruturas' ? 'var(--primary-accent)' : 'transparent',
                color: viewMode === 'estruturas' ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.15s'
              }}
            >
              <Layers size={13} />
              <span>Por Estrutura</span>
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              backgroundColor: 'rgba(2, 132, 199, 0.18)',
              border: '1px solid rgba(2, 132, 199, 0.35)',
              borderRadius: '8px',
              color: 'var(--primary-accent)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Download size={14} />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* 2. MINI-CARDS DE KPIS DO CRONOGRAMA */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.75rem'
      }}>
        {/* Total */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          borderLeft: '4px solid #3b82f6'
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Total de Tarefas
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
            {stats.total.toLocaleString('pt-BR')}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            2025 – 2026 mapeadas
          </div>
        </div>

        {/* Concluídas */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          borderLeft: '4px solid #10b981'
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Concluídas
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
            {stats.concluidos.toLocaleString('pt-BR')}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Ações executadas
          </div>
        </div>

        {/* Com Atraso */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          borderLeft: '4px solid #f59e0b'
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Realizadas c/ Atraso
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
            {stats.comAtraso.toLocaleString('pt-BR')}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Com desvios operacionais
          </div>
        </div>

        {/* Reprogramadas */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          borderLeft: '4px solid #ef4444'
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Reprogramadas
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ef4444', marginTop: '2px' }}>
            {stats.reprogramadas.toLocaleString('pt-BR')}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Reajustadas na escala
          </div>
        </div>

        {/* Futuras */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          borderLeft: '4px solid #38bdf8'
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Ações Futuras
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
            {stats.futuras.toLocaleString('pt-BR')}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Programadas a executar
          </div>
        </div>

        {/* Taxa de Efetividade */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          borderLeft: '4px solid #8b5cf6'
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Aderência no Prazo
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#8b5cf6', marginTop: '2px' }}>
            {stats.aderencia}%
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Efetividade de cumprimento
          </div>
        </div>
      </div>

      {/* 3. BARRA DE FILTROS AVANÇADOS */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '0.85rem 1.15rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        {/* Linha 1: Busca e Seletores */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          
          {/* Input de busca */}
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar ação, ID, estrutura, data ou justificativa..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                padding: '6px 10px 6px 32px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Ano */}
          <select
            value={selectedAno}
            onChange={e => { setSelectedAno(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '6px 10px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <option value="Todos">Todos os Anos</option>
            <option value="2025">Ano 2025</option>
            <option value="2026">Ano 2026</option>
          </select>

          {/* Mês */}
          <select
            value={selectedMes}
            onChange={e => { setSelectedMes(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '6px 10px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <option value="Todos">Todos os Meses</option>
            {MESES_ORDENADOS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Estrutura */}
          <select
            value={selectedEstrutura}
            onChange={e => { setSelectedEstrutura(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '6px 10px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              maxWidth: '170px'
            }}
          >
            <option value="Todas">Todas as Estruturas</option>
            {estruturasList.map(est => (
              <option key={est} value={est}>{est}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '6px 10px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <option value="Todos">Todos os Status</option>
            {Object.keys(STATUS_CONFIG).map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          {/* Desvio */}
          <select
            value={selectedDesvio}
            onChange={e => { setSelectedDesvio(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '6px 10px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <option value="Todos">Todos os Desvios</option>
            <option value="Sem Desvio">Sem Desvio Registrado</option>
            {desviosList.map(d => (
              <option key={d} value={d}>Desvio: {d}</option>
            ))}
          </select>

          {/* Limpar */}
          <button
            onClick={handleClearFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={12} />
            <span>Limpar</span>
          </button>
        </div>

        {/* Linha 2: Filtros Rápidos (Pills) e Contador */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Atalhos:</span>
            <button
              onClick={() => { setQuickFilter('todos'); setCurrentPage(1); }}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                border: '1px solid var(--border-subtle)',
                backgroundColor: quickFilter === 'todos' ? 'var(--primary-accent)' : 'transparent',
                color: quickFilter === 'todos' ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              Todas ({CRONOGRAMA_ITEMS.length})
            </button>
            <button
              onClick={() => { setQuickFilter('concluidas'); setCurrentPage(1); }}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                border: '1px solid rgba(16,185,129,0.3)',
                backgroundColor: quickFilter === 'concluidas' ? '#10b981' : 'transparent',
                color: quickFilter === 'concluidas' ? '#fff' : '#10b981',
                cursor: 'pointer'
              }}
            >
              Concluídas ({stats.concluidos})
            </button>
            <button
              onClick={() => { setQuickFilter('atrasadas'); setCurrentPage(1); }}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                border: '1px solid rgba(245,158,11,0.3)',
                backgroundColor: quickFilter === 'atrasadas' ? '#f59e0b' : 'transparent',
                color: quickFilter === 'atrasadas' ? '#fff' : '#f59e0b',
                cursor: 'pointer'
              }}
            >
              Com Atraso / Reprogramadas ({stats.comAtraso + stats.reprogramadas})
            </button>
            <button
              onClick={() => { setQuickFilter('futuras'); setCurrentPage(1); }}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                border: '1px solid rgba(56,189,248,0.3)',
                backgroundColor: quickFilter === 'futuras' ? '#38bdf8' : 'transparent',
                color: quickFilter === 'futuras' ? '#fff' : '#38bdf8',
                cursor: 'pointer'
              }}
            >
              Ações Futuras ({stats.futuras})
            </button>
          </div>

          <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
            Mostrando <strong style={{ color: 'var(--primary-accent)' }}>{filteredItems.length}</strong> de {CRONOGRAMA_ITEMS.length} tarefas
          </div>
        </div>
      </div>

      {/* 4. CONTEÚDO PRINCIPAL (TABELA / CALENDÁRIO / ESTRUTURAS) */}
      
      {/* MODO TABELA */}
      {viewMode === 'tabela' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border-medium)',
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  <th style={{ padding: '10px 12px', width: '50px' }}>ID</th>
                  <th style={{ padding: '10px 12px' }}>Estrutura</th>
                  <th style={{ padding: '10px 12px' }}>Ação / Tarefa</th>
                  <th style={{ padding: '10px 12px' }}>Data Planejada</th>
                  <th style={{ padding: '10px 12px' }}>Data Realizada</th>
                  <th style={{ padding: '10px 12px', width: '60px' }}>Ciclo</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                  <th style={{ padding: '10px 12px' }}>Desvio</th>
                  <th style={{ padding: '10px 12px' }}>Justificativa</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', width: '60px' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Nenhuma tarefa encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item, idx) => {
                    const stConfig = getCronogramaStatusBadge(item.status);
                    return (
                      <tr
                        key={item.id || idx}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--bg-secondary)'
                        }}
                      >
                        <td style={{ padding: '9px 12px', fontWeight: 700, color: 'var(--primary-accent)' }}>
                          #{item.id}
                        </td>
                        <td style={{ padding: '9px 12px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Building2 size={13} style={{ color: 'var(--text-muted)' }} />
                            <span>{item.estrutura}</span>
                          </div>
                        </td>
                        <td style={{ padding: '9px 12px', color: 'var(--text-main)', fontWeight: 500, minWidth: '220px' }}>
                          {item.acao}
                        </td>
                        <td style={{ padding: '9px 12px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {formatDateBR(item.dataPlanejada)}
                        </td>
                        <td style={{ padding: '9px 12px', whiteSpace: 'nowrap', color: item.dataRealizada ? 'var(--text-main)' : 'var(--text-faint)', fontFamily: 'monospace' }}>
                          {formatDateBR(item.dataRealizada)}
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          {item.ciclo}
                        </td>
                        <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: stConfig.bgColor,
                            color: stConfig.color,
                            border: `1px solid ${stConfig.border}`
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: stConfig.color }} />
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                          {item.desvio ? (
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              backgroundColor: 'rgba(239, 68, 68, 0.12)',
                              color: '#ef4444',
                              border: '1px solid rgba(239, 68, 68, 0.25)'
                            }}>
                              {item.desvio}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '9px 12px', color: 'var(--text-muted)', fontSize: '0.75rem', maxWidth: '240px' }} title={item.justificativa || ''}>
                          {item.justificativa ? (
                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.justificativa}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-faint)' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                          <button
                            onClick={() => setSelectedItemDetail(item)}
                            title="Ver detalhes da tarefa"
                            style={{
                              padding: '4px 8px',
                              backgroundColor: 'var(--bg-surface)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: '6px',
                              color: 'var(--primary-accent)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.72rem'
                            }}
                          >
                            <Eye size={12} />
                            Ver
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', padding: '0.4rem 0' }}>
              <div>
                Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> ({filteredItems.length} registros)
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: currentPage <= 1 ? 'var(--text-faint)' : 'var(--text-main)',
                    cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Anterior
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: currentPage >= totalPages ? 'var(--text-faint)' : 'var(--text-main)',
                    cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODO CALENDÁRIO / LINHA DO TEMPO */}
      {viewMode === 'calendario' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto' }}>
          {calendarGroups.map(([dateStr, itemsGroup]) => (
            <div key={dateStr} style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} style={{ color: 'var(--primary-accent)' }} />
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {formatDateBR(dateStr)}
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    ({itemsGroup[0]?.mes} {itemsGroup[0]?.dia ? `· dia ${itemsGroup[0]?.dia}` : ''})
                  </span>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {itemsGroup.length} tarefa{itemsGroup.length > 1 ? 's' : ''}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.65rem' }}>
                {itemsGroup.map(item => {
                  const stConfig = getCronogramaStatusBadge(item.status);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemDetail(item)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-accent)' }}>
                          #{item.id} · {item.estrutura}
                        </span>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: stConfig.bgColor,
                          color: stConfig.color
                        }}>
                          {item.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: 600, lineHeight: 1.35 }}>
                        {item.acao}
                      </div>

                      {item.desvio && (
                        <div style={{ fontSize: '0.7rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={11} />
                          Desvio: {item.desvio}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODO POR ESTRUTURA */}
      {viewMode === 'estruturas' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {structureGroups.map(([estName, data]) => {
            const hasCoords = ESTRUTURAS_COORDENADAS[estName];
            return (
              <div
                key={estName}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={16} style={{ color: 'var(--primary-accent)' }} />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      {estName}
                    </h3>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-accent)' }}>
                    {data.total} tarefas
                  </span>
                </div>

                {/* Barra de progresso da estrutura */}
                <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${(data.concluidos / data.total) * 100}%`, backgroundColor: '#10b981' }} title={`Concluídos: ${data.concluidos}`} />
                  <div style={{ width: `${(data.atraso / data.total) * 100}%`, backgroundColor: '#f59e0b' }} title={`Com atraso: ${data.atraso}`} />
                  <div style={{ width: `${(data.reprog / data.total) * 100}%`, backgroundColor: '#ef4444' }} title={`Reprogramadas: ${data.reprog}`} />
                  <div style={{ width: `${(data.futuras / data.total) * 100}%`, backgroundColor: '#38bdf8' }} title={`Futuras: ${data.futuras}`} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.74rem' }}>
                  <div style={{ color: '#10b981' }}>✓ Concluídas: <b>{data.concluidos}</b></div>
                  <div style={{ color: '#f59e0b' }}>⚠️ C/ Atraso: <b>{data.atraso}</b></div>
                  <div style={{ color: '#ef4444' }}>↺ Reprog.: <b>{data.reprog}</b></div>
                  <div style={{ color: '#38bdf8' }}>⏱ Futuras: <b>{data.futuras}</b></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: 'auto' }}>
                  <button
                    onClick={() => { setSelectedEstrutura(estName); setViewMode('tabela'); }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--primary-accent)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>Filtrar na Tabela</span>
                    <ChevronRight size={13} />
                  </button>

                  {hasCoords && (
                    <button
                      onClick={() => onNavigateTab && onNavigateTab('mapa')}
                      title={`Ver coordenadas: ${hasCoords.lat}, ${hasCoords.lon}`}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <MapPin size={12} />
                      <span>Ver no Mapa</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. MODAL DE DETALHES COMPLETOS DA TAREFA */}
      {selectedItemDetail && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            padding: '1.5rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} color="var(--primary-accent)" />
                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 800 }}>
                  Tarefa #{selectedItemDetail.id} — {selectedItemDetail.estrutura}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItemDetail(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  Ação Geotécnica Programada
                </div>
                <div style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '0.95rem', marginTop: '2px' }}>
                  {selectedItemDetail.acao}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>Estrutura</div>
                  <div style={{ color: 'var(--text-main)', fontWeight: 700 }}>{selectedItemDetail.estrutura}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>Mês / Dia</div>
                  <div style={{ color: 'var(--text-main)' }}>{selectedItemDetail.mes} {selectedItemDetail.dia ? `· dia ${selectedItemDetail.dia}` : ''}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>Data Planejada</div>
                  <div style={{ color: 'var(--text-main)', fontWeight: 700, fontFamily: 'monospace' }}>
                    {formatDateBR(selectedItemDetail.dataPlanejada)}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>Data Realizada</div>
                  <div style={{ color: selectedItemDetail.dataRealizada ? 'var(--text-main)' : 'var(--text-faint)', fontWeight: 700, fontFamily: 'monospace' }}>
                    {formatDateBR(selectedItemDetail.dataRealizada)}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>Status de Execução</div>
                  <div style={{ marginTop: '2px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: getCronogramaStatusBadge(selectedItemDetail.status).bgColor,
                      color: getCronogramaStatusBadge(selectedItemDetail.status).color
                    }}>
                      {selectedItemDetail.status}
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>Ciclo</div>
                  <div style={{ color: 'var(--text-main)' }}>Ciclo {selectedItemDetail.ciclo}</div>
                </div>
              </div>

              {selectedItemDetail.desvio && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
                  <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Desvio Registrado
                  </div>
                  <div style={{ color: 'var(--text-main)', marginTop: '2px', fontWeight: 600 }}>
                    {selectedItemDetail.desvio}
                  </div>
                </div>
              )}

              {selectedItemDetail.justificativa && (
                <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Justificativa Operacional
                  </div>
                  <div style={{ color: 'var(--text-main)', marginTop: '2px', lineHeight: 1.45 }}>
                    {selectedItemDetail.justificativa}
                  </div>
                </div>
              )}

              {selectedItemDetail.lat && selectedItemDetail.lon && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Coordenadas da Estrutura</div>
                    <div style={{ color: 'var(--text-main)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      LAT: {selectedItemDetail.lat} | LON: {selectedItemDetail.lon}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedItemDetail(null);
                      if (onNavigateTab) onNavigateTab('mapa');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(2, 132, 199, 0.15)',
                      border: '1px solid rgba(2, 132, 199, 0.3)',
                      color: 'var(--primary-accent)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <MapPin size={13} />
                    <span>Ver no Mapa</span>
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              <button
                onClick={() => setSelectedItemDetail(null)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default CronogramaSection;

