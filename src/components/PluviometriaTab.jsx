import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from '../utils/leafletCompat';
import { 
  PLUVIOMETRIA_DATA, 
  MONTH_LABELS, 
  STATION_NAMES, 
  getStationName, 
  formatNumber 
} from '../data/pluviometriaData';
import { 
  CloudRain, 
  Calendar, 
  Filter, 
  RotateCcw, 
  Download, 
  TrendingUp, 
  MapPin, 
  BarChart3, 
  Layers, 
  Activity, 
  ChevronRight, 
  Info, 
  ExternalLink, 
  ShieldAlert, 
  CheckCircle2,
  Droplets,
  Table,
  Sliders,
  Map as MapIcon
} from 'lucide-react';

export const PluviometriaTab = ({ onNavigateTab }) => {
  const latestYear = useMemo(() => {
    return String(PLUVIOMETRIA_DATA.anos[PLUVIOMETRIA_DATA.anos.length - 1] || '2026');
  }, []);

  const [selectedYear, setSelectedYear] = useState(latestYear);
  const [selectedMonth, setSelectedMonth] = useState('Todos');
  const [activeTabSubView, setActiveTabSubView] = useState('dashboard'); // 'dashboard' | 'tabela'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const mapContainerRef = useRef(null);
  const leafletInstanceRef = useRef(null);
  const markerLayerRef = useRef(null);

  // Filtragem diária
  const dailyFiltered = useMemo(() => {
    return PLUVIOMETRIA_DATA.daily.filter(x => {
      const matchAno = selectedYear === 'Todos' || x.d.slice(0, 4) === selectedYear;
      const matchMes = selectedMonth === 'Todos' || x.d.slice(5, 7) === selectedMonth;
      return matchAno && matchMes;
    });
  }, [selectedYear, selectedMonth]);

  // Filtragem agregada mensal/estação
  const staggFiltered = useMemo(() => {
    return PLUVIOMETRIA_DATA.stagg.filter(r => {
      const matchAno = selectedYear === 'Todos' || String(r.ano) === selectedYear;
      const matchMes = selectedMonth === 'Todos' || String(r.mes).padStart(2, '0') === selectedMonth;
      return matchAno && matchMes;
    });
  }, [selectedYear, selectedMonth]);

  // Métricas Consolidadas
  const stats = useMemo(() => {
    const totalAcumulado = dailyFiltered.reduce((s, x) => s + (x.v || 0), 0);
    const dias = dailyFiltered.length;
    const mediaDiaria = dias > 0 ? totalAcumulado / dias : 0;

    let maxVal = 0;
    let maxDate = null;
    dailyFiltered.forEach(x => {
      if (x.v > maxVal) {
        maxVal = x.v;
        maxDate = x.d;
      }
    });

    // Por estação
    const byLoc = {};
    staggFiltered.forEach(r => {
      if (!byLoc[r.loc]) {
        byLoc[r.loc] = { sum: 0, n: 0 };
      }
      byLoc[r.loc].sum += r.sum || 0;
      byLoc[r.loc].n += r.n || 0;
    });

    const estAtivas = Object.keys(byLoc).length;
    const avgByStation = Object.entries(byLoc)
      .map(([k, o]) => [k, o.n > 0 ? o.sum / o.n : 0])
      .sort((a, b) => b[1] - a[1]);

    const sumByStation = Object.entries(byLoc)
      .map(([k, o]) => [k, o.sum])
      .sort((a, b) => b[1] - a[1]);

    const estacaoLider = sumByStation[0] || null;

    let periodoLabel = '';
    if (selectedYear === 'Todos') {
      periodoLabel = selectedMonth === 'Todos' 
        ? 'Todos os Anos (2018–2026)' 
        : `${MONTH_LABELS[+selectedMonth - 1]} / 2018–2026`;
    } else {
      periodoLabel = selectedMonth === 'Todos' 
        ? `Ano ${selectedYear}` 
        : `${MONTH_LABELS[+selectedMonth - 1]} / ${selectedYear}`;
    }

    return {
      totalAcumulado,
      dias,
      mediaDiaria,
      maxVal,
      maxDate,
      byLoc,
      estAtivas,
      avgByStation,
      sumByStation,
      estacaoLider,
      periodoLabel
    };
  }, [dailyFiltered, staggFiltered, selectedYear, selectedMonth]);

  // Dados para a Curva SVG de Evolução
  const chartSeries = useMemo(() => {
    if (selectedYear !== 'Todos' && selectedMonth !== 'Todos') {
      const sortedDays = [...dailyFiltered].sort((a, b) => (a.d < b.d ? -1 : 1));
      return {
        labels: sortedDays.map(x => String(+x.d.slice(8, 10))),
        fullDates: sortedDays.map(x => x.d),
        values: sortedDays.map(x => x.v),
        mode: 'dia',
        hint: 'chuva diária (mm)'
      };
    }

    if (selectedYear !== 'Todos') {
      const monthTotals = Array(12).fill(0);
      dailyFiltered.forEach(x => {
        const mIdx = +x.d.slice(5, 7) - 1;
        if (mIdx >= 0 && mIdx < 12) {
          monthTotals[mIdx] += x.v;
        }
      });
      return {
        labels: MONTH_LABELS,
        fullDates: MONTH_LABELS.map((m, idx) => `${m}/${selectedYear}`),
        values: monthTotals,
        mode: 'mes',
        hint: 'acumulado mensal (mm)'
      };
    }

    // Todos os anos
    const yearMap = {};
    PLUVIOMETRIA_DATA.daily.forEach(x => {
      const y = x.d.slice(0, 4);
      if (selectedMonth === 'Todos' || x.d.slice(5, 7) === selectedMonth) {
        yearMap[y] = (yearMap[y] || 0) + x.v;
      }
    });

    const labels = Object.keys(yearMap).sort();
    return {
      labels,
      fullDates: labels.map(y => `Ano ${y}`),
      values: labels.map(y => yearMap[y]),
      mode: 'ano',
      hint: 'acumulado anual (mm)'
    };
  }, [dailyFiltered, selectedYear, selectedMonth]);

  // Inicialização do Mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (leafletInstanceRef.current) {
      leafletInstanceRef.current.remove();
      leafletInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Esri Satellite'
    }).addTo(map);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      opacity: 0.85
    }).addTo(map);

    const markerLayer = L.layerGroup().addTo(map);
    leafletInstanceRef.current = map;
    markerLayerRef.current = markerLayer;

    const bounds = L.latLngBounds(PLUVIOMETRIA_DATA.locs.map(l => [l.lat, l.lon]));
    map.fitBounds(bounds.pad(0.35));

    const timeoutId = setTimeout(() => {
      if (map) map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timeoutId);
      if (leafletInstanceRef.current) {
        leafletInstanceRef.current.remove();
        leafletInstanceRef.current = null;
      }
    };
  }, []);

  // Atualização dos Marcadores no Mapa Leaflet
  useEffect(() => {
    if (!markerLayerRef.current || !leafletInstanceRef.current) return;
    markerLayerRef.current.clearLayers();

    const sums = Object.values(stats.byLoc).map(o => o.sum || 0);
    const mx = Math.max(1, ...sums);

    PLUVIOMETRIA_DATA.locs.forEach(station => {
      const o = stats.byLoc[station.loc] || { sum: 0, n: 0 };
      const rad = 7 + Math.sqrt(o.sum / mx) * 18;
      const media = o.n > 0 ? o.sum / o.n : 0;
      const stationName = getStationName(station.loc);

      const marker = L.circleMarker([station.lat, station.lon], {
        radius: rad,
        color: '#ffffff',
        weight: 1.8,
        fillColor: '#38bdf8',
        fillOpacity: 0.76
      });

      marker.bindPopup(`
        <div style="font-family: system-ui, -apple-system, sans-serif; color: #0f172a; min-width: 175px;">
          <div style="font-weight: 800; font-size: 13px; color: #0284c7; margin-bottom: 4px;">
            ${stationName}
          </div>
          <div style="font-size: 10px; color: #64748b; margin-bottom: 6px;">
            Lat: ${station.lat.toFixed(6)} · Lon: ${station.lon.toFixed(6)}
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 4px; font-size: 11px;">
            <span>Chuva acumulada:</span>
            <strong style="color: #0284c7;">${formatNumber(o.sum)} mm</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 2px;">
            <span>Média no período:</span>
            <strong>${formatNumber(media)} mm/dia</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 2px;">
            <span>Dias registrados:</span>
            <strong>${o.n} dias</strong>
          </div>
        </div>
      `);

      marker.addTo(markerLayerRef.current);
    });
  }, [stats.byLoc]);

  // Redimensionamento de mapa
  const handleInvalidateMap = () => {
    if (leafletInstanceRef.current) {
      setTimeout(() => {
        leafletInstanceRef.current.invalidateSize();
      }, 100);
    }
  };

  // Reset de Filtros
  const handleResetFilters = () => {
    setSelectedYear(latestYear);
    setSelectedMonth('Todos');
  };

  // Exportar dados filtrados em CSV
  const handleExportCSV = () => {
    const headers = ['Data', 'Ano', 'Mes', 'Dia', 'Precipitacao_mm'];
    const rows = dailyFiltered.map(x => [
      x.d,
      x.d.slice(0, 4),
      x.d.slice(5, 7),
      x.d.slice(8, 10),
      x.v.toFixed(1).replace('.', ',')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pluviometria_Itaminas_${selectedYear}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render SVG Chart Path & Coordinates
  const chartProps = useMemo(() => {
    const W = 720;
    const H = 220;
    const pad = { l: 45, r: 15, t: 15, b: 28 };
    const vals = chartSeries.values;
    const labs = chartSeries.labels;
    const dates = chartSeries.fullDates;

    const maxVal = Math.max(1, ...vals) * 1.15;

    const getX = (i) => pad.l + (vals.length <= 1 ? 0 : (i / (vals.length - 1)) * (W - pad.l - pad.r));
    const getY = (v) => pad.t + (1 - v / maxVal) * (H - pad.t - pad.b);

    // Grid lines (5 ticks)
    const gridTicks = [];
    const step = maxVal / 4;
    for (let k = 0; k <= 4; k++) {
      const val = step * k;
      const y = getY(val);
      gridTicks.push({ val: Math.round(val), y });
    }

    // Line and Area path
    let linePath = '';
    vals.forEach((v, i) => {
      linePath += (i === 0 ? 'M ' : 'L ') + getX(i).toFixed(1) + ' ' + getY(v).toFixed(1) + ' ';
    });

    const areaPath = vals.length > 0 
      ? linePath + `L ${getX(vals.length - 1).toFixed(1)} ${getY(0).toFixed(1)} L ${getX(0).toFixed(1)} ${getY(0).toFixed(1)} Z`
      : '';

    // Decimação de labels no eixo X
    const n = labs.length;
    const every = n > 16 ? Math.ceil(n / 12) : 1;

    const dataPoints = vals.map((v, i) => ({
      x: getX(i),
      y: getY(v),
      val: v,
      label: labs[i],
      date: dates[i] || labs[i]
    }));

    return {
      W,
      H,
      pad,
      gridTicks,
      linePath,
      areaPath,
      dataPoints,
      every,
      labs
    };
  }, [chartSeries]);

  return (
    <div style={{
      position: 'relative',
      minHeight: 'calc(100vh - 84px)',
      background: 'radial-gradient(circle at 85% 5%, #11284a 0%, #071224 55%, #050b17 100%)',
      color: '#eaf2fb',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Topo SVG Background decorativo (topografia) */}
      <svg 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.08,
          pointerEvents: 'none',
          zIndex: 0,
          width: '100%',
          height: '100%'
        }} 
        preserveAspectRatio="xMidYMid slice" 
        viewBox="0 0 1600 900" 
        xmlns="http://www.w3.org/2000/svg" 
        aria-hidden="true"
      >
        <g fill="none" stroke="#38bdf8" strokeWidth="1.2">
          <polyline points="1485,120 1487,126 1485,131 1480,137 1474,141 1468,145 1461,149 1454,152 1446,154 1437,154 1428,153 1420,150 1413,148 1406,148 1398,149 1388,150 1376,151 1365,149 1357,144 1354,138 1356,131 1361,125 1365,120 1369,116 1370,111 1371,107 1373,102 1377,98 1383,94 1389,91 1396,88 1403,85 1411,81 1420,78 1430,77 1440,79 1448,83 1453,90 1454,96 1456,102 1458,105 1464,108 1471,111 1479,115 1485,120" />
          <polyline points="1540,120 1537,130 1529,139 1520,147 1511,155 1501,162 1490,168 1476,173 1461,174 1446,173 1432,171 1420,170 1408,172 1392,176 1374,180 1354,182 1335,179 1323,170 1318,159 1321,147 1326,137 1330,128 1332,120 1331,112 1329,104 1331,96 1336,88 1344,81 1354,74 1364,68 1375,60 1387,53 1403,47 1420,45 1437,49 1451,56 1460,67 1466,77 1472,84 1480,89 1493,92 1510,95 1525,101 1536,110 1540,120" />
          <polyline points="1586,120 1577,134 1567,146 1558,158 1547,169 1532,178 1514,185 1493,188 1472,189 1454,189 1437,192 1420,199 1399,208 1373,216 1345,218 1320,213 1303,201 1296,184 1297,168 1300,153 1300,141 1297,131 1290,120 1284,108 1283,96 1288,84 1298,73 1309,62 1320,51 1333,39 1350,27 1371,19 1395,17 1420,22 1441,32 1456,46 1468,57 1480,64 1497,67 1520,68 1546,72 1569,79 1584,91 1590,105 1586,120" />
          <polyline points="1621,120 1613,137 1605,153 1594,168 1579,181 1557,191 1532,197 1507,201 1486,206 1466,215 1446,228 1420,243 1388,255 1353,257 1321,250 1299,233 1288,211 1285,190 1283,173 1276,159 1264,148 1249,135 1237,120 1233,104 1237,88 1245,72 1256,57 1267,40 1280,23 1299,7 1326,-3 1358,-6 1391,0 1420,13 1442,26 1461,36 1481,40 1507,39 1540,37 1575,39 1606,48 1625,64 1632,83 1629,102 1621,120" />
          <polyline points="1691,120 1687,143 1672,164 1649,183 1622,198 1599,213 1581,231 1565,255 1545,284 1513,310 1469,326 1420,328 1374,313 1338,288 1313,261 1294,238 1273,222 1244,211 1210,201 1176,187 1150,168 1136,145 1131,120 1132,95 1135,70 1140,43 1151,16 1176,-7 1214,-23 1262,-27 1312,-22 1355,-12 1390,-6 1420,-8 1453,-19 1496,-34 1546,-45 1597,-45 1639,-32 1667,-9 1681,19 1685,47 1687,73 1690,97 1691,120" />
        </g>
      </svg>

      {/* CABEÇALHO EXECUTIVO */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '0.85rem 1.25rem',
        border: '1px solid rgba(56, 189, 248, 0.22)',
        borderRadius: '12px',
        background: 'linear-gradient(180deg, rgba(16, 40, 78, 0.85), rgba(11, 28, 56, 0.85))',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(56, 189, 248, 0.4)'
          }}>
            <CloudRain size={24} />
          </div>

          <div style={{ width: '1px', height: '36px', backgroundColor: 'rgba(56, 189, 248, 0.2)' }} />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                color: '#ffffff',
                fontFamily: "'Montserrat', sans-serif"
              }}>
                Painel Executivo · Gerência de Geotecnia · Pluviometria
              </h1>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.4)'
              }}>
                ITAMINAS
              </span>
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: '#94a3b8',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginTop: '0.2rem'
            }}>
              Monitoramento pluviométrico · chuva (mm) por estação · 2018–2026
            </div>
          </div>
        </div>

        {/* Indicadores do Header & Atalhos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Chuva acumulada no período</div>
            <div style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              color: '#38bdf8',
              fontFamily: "'Montserrat', sans-serif"
            }}>
              {formatNumber(stats.totalAcumulado)} mm
            </div>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '999px',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 800,
            fontSize: '0.8rem',
            letterSpacing: '0.04em',
            border: '1px solid #0284c7',
            background: 'rgba(2, 132, 199, 0.18)',
            color: '#38bdf8'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#38bdf8',
              boxShadow: '0 0 8px #38bdf8'
            }} />
            <span>{stats.periodoLabel}</span>
          </div>

          {/* Botões de Ação Rápida */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('mapa')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.8rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  color: '#eaf2fb',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Ver estações no Mapa Geral GIS"
              >
                <MapIcon size={14} style={{ color: '#38bdf8' }} />
                <span>Ver no Mapa GIS</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.8rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Baixar planilha CSV com os dados filtrados"
            >
              <Download size={14} />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.85rem',
        padding: '0.65rem 1rem',
        borderRadius: '10px',
        backgroundColor: 'rgba(11, 28, 56, 0.65)',
        border: '1px solid rgba(56, 189, 248, 0.18)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#38bdf8',
          textTransform: 'uppercase',
          letterSpacing: '0.06em'
        }}>
          <Filter size={15} />
          <span>Filtros Executivos:</span>
        </div>

        {/* Seleção de Ano */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          style={{
            fontFamily: 'inherit',
            background: '#0e2244',
            color: '#eaf2fb',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '6px',
            padding: '0.4rem 0.75rem',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          <option value="Todos">Todos os anos (2018–2026)</option>
          {PLUVIOMETRIA_DATA.anos.map(a => (
            <option key={a} value={String(a)}>{a}</option>
          ))}
        </select>

        {/* Seleção de Mês */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            fontFamily: 'inherit',
            background: '#0e2244',
            color: '#eaf2fb',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '6px',
            padding: '0.4rem 0.75rem',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          <option value="Todos">Todos os meses</option>
          {MONTH_LABELS.map((mesNome, idx) => {
            const mesCode = String(idx + 1).padStart(2, '0');
            return (
              <option key={mesCode} value={mesCode}>
                {mesNome} ({mesCode})
              </option>
            );
          })}
        </select>

        <button
          type="button"
          onClick={handleResetFilters}
          style={{
            fontFamily: 'inherit',
            background: 'transparent',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            color: '#94a3b8',
            borderRadius: '6px',
            padding: '0.4rem 0.75rem',
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            transition: 'all 0.15s ease'
          }}
        >
          <RotateCcw size={13} />
          <span>Restaurar Padrão</span>
        </button>

        {/* Alternador de Visão (Gráficos vs Tabela Analítica) */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            borderRadius: '6px',
            overflow: 'hidden',
            border: '1px solid rgba(56, 189, 248, 0.3)'
          }}>
            <button
              type="button"
              onClick={() => { setActiveTabSubView('dashboard'); handleInvalidateMap(); }}
              style={{
                padding: '0.35rem 0.7rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTabSubView === 'dashboard' ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
                color: activeTabSubView === 'dashboard' ? '#ffffff' : '#94a3b8'
              }}
            >
              Painel Gráfico & Mapa
            </button>
            <button
              type="button"
              onClick={() => setActiveTabSubView('tabela')}
              style={{
                padding: '0.35rem 0.7rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTabSubView === 'tabela' ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
                color: activeTabSubView === 'tabela' ? '#ffffff' : '#94a3b8'
              }}
            >
              Tabela de Leituras ({dailyFiltered.length})
            </button>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            <b style={{ color: '#38bdf8', fontFamily: "'Montserrat', sans-serif" }}>
              {stats.dias}
            </b> dias monitorados
          </div>
        </div>
      </div>

      {/* 6 KPIS EXECUTIVOS */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '0.85rem'
      }}>
        {/* KPI 1: Chuva Acumulada */}
        <div style={{
          position: 'relative',
          padding: '0.85rem 1rem',
          borderRadius: '10px',
          background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.8), rgba(11, 30, 59, 0.8))',
          border: '1px solid rgba(56, 189, 248, 0.22)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: '#38bdf8' }} />
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', fontWeight: 700 }}>
            Chuva Acumulada
          </div>
          <div style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            color: '#38bdf8',
            fontFamily: "'Montserrat', sans-serif",
            marginTop: '0.35rem',
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.3rem'
          }}>
            {formatNumber(stats.totalAcumulado)}
            <small style={{ fontSize: '0.85rem', color: '#94a3b8' }}>mm</small>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {stats.periodoLabel}
          </div>
        </div>

        {/* KPI 2: Média Diária */}
        <div style={{
          position: 'relative',
          padding: '0.85rem 1rem',
          borderRadius: '10px',
          background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.8), rgba(11, 30, 59, 0.8))',
          border: '1px solid rgba(56, 189, 248, 0.22)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: '#0284c7' }} />
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', fontWeight: 700 }}>
            Média Diária
          </div>
          <div style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            color: '#ffffff',
            fontFamily: "'Montserrat', sans-serif",
            marginTop: '0.35rem',
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.3rem'
          }}>
            {formatNumber(stats.mediaDiaria)}
            <small style={{ fontSize: '0.85rem', color: '#94a3b8' }}>mm/dia</small>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
            {stats.dias} leituras registradas
          </div>
        </div>

        {/* KPI 3: Máxima Diária */}
        <div style={{
          position: 'relative',
          padding: '0.85rem 1rem',
          borderRadius: '10px',
          background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.8), rgba(11, 30, 59, 0.8))',
          border: '1px solid rgba(56, 189, 248, 0.22)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: '#a855f7' }} />
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', fontWeight: 700 }}>
            Máxima Diária
          </div>
          <div style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            color: '#c084fc',
            fontFamily: "'Montserrat', sans-serif",
            marginTop: '0.35rem',
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.3rem'
          }}>
            {formatNumber(stats.maxVal)}
            <small style={{ fontSize: '0.85rem', color: '#94a3b8' }}>mm</small>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            {stats.maxDate ? `em ${stats.maxDate.split('-').reverse().join('/')}` : 'Sem registros'}
          </div>
        </div>

        {/* KPI 4: Dias Monitorados */}
        <div style={{
          position: 'relative',
          padding: '0.85rem 1rem',
          borderRadius: '10px',
          background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.8), rgba(11, 30, 59, 0.8))',
          border: '1px solid rgba(56, 189, 248, 0.22)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: '#38bdf8' }} />
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', fontWeight: 700 }}>
            Dias Monitorados
          </div>
          <div style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            color: '#ffffff',
            fontFamily: "'Montserrat', sans-serif",
            marginTop: '0.35rem'
          }}>
            {stats.dias}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
            Série histórica contínua
          </div>
        </div>

        {/* KPI 5: Estações Pluviométricas */}
        <div style={{
          position: 'relative',
          padding: '0.85rem 1rem',
          borderRadius: '10px',
          background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.8), rgba(11, 30, 59, 0.8))',
          border: '1px solid rgba(56, 189, 248, 0.22)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: '#0284c7' }} />
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', fontWeight: 700 }}>
            Estações Ativas
          </div>
          <div style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            color: '#ffffff',
            fontFamily: "'Montserrat', sans-serif",
            marginTop: '0.35rem'
          }}>
            {stats.estAtivas} <small style={{ fontSize: '0.9rem', color: '#64748b' }}>/ {PLUVIOMETRIA_DATA.nstations}</small>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
            Pluviômetros instalados
          </div>
        </div>

        {/* KPI 6: Estação + Chuvosa */}
        <div style={{
          position: 'relative',
          padding: '0.85rem 1rem',
          borderRadius: '10px',
          background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.8), rgba(11, 30, 59, 0.8))',
          border: '1px solid rgba(56, 189, 248, 0.22)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: '#eab308' }} />
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', fontWeight: 700 }}>
            Estação + Chuvosa
          </div>
          <div style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            color: '#facc15',
            fontFamily: "'Montserrat', sans-serif",
            marginTop: '0.35rem',
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.3rem'
          }}>
            {stats.estacaoLider ? formatNumber(stats.estacaoLider[1]) : '—'}
            <small style={{ fontSize: '0.85rem', color: '#94a3b8' }}>mm</small>
          </div>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#e2e8f0',
            marginTop: '0.25rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {stats.estacaoLider ? getStationName(stats.estacaoLider[0]) : '—'}
          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL (DASHBOARD OU TABELA) */}
      {activeTabSubView === 'dashboard' ? (
        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)',
          gap: '1rem'
        }}>
          {/* COLUNA ESQUERDA: GRÁFICO DE EVOLUÇÃO + RANKINGS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* PAINEL 1: EVOLUÇÃO DA CHUVA (SVG CHART) */}
            <div style={{
              borderRadius: '12px',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              background: 'linear-gradient(180deg, rgba(16, 40, 78, 0.8), rgba(11, 28, 56, 0.8))',
              padding: '1rem 1.25rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem'
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#38bdf8',
                  fontFamily: "'Montserrat', sans-serif"
                }}>
                  Evolução da Chuva (mm)
                </h2>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {chartSeries.hint}
                </span>
              </div>

              {/* ÁREA SVG DO GRÁFICO */}
              <div style={{ position: 'relative', width: '100%', height: '220px' }}>
                <svg
                  viewBox={`0 0 ${chartProps.W} ${chartProps.H}`}
                  preserveAspectRatio="none"
                  style={{ width: '100%', height: '100%', overflow: 'visible' }}
                >
                  <defs>
                    <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.55" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {chartProps.gridTicks.map((t, idx) => (
                    <g key={idx}>
                      <line
                        x1={chartProps.pad.l}
                        y1={t.y}
                        x2={chartProps.W - chartProps.pad.r}
                        y2={t.y}
                        stroke="rgba(255, 255, 255, 0.08)"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={chartProps.pad.l - 6}
                        y={t.y + 3}
                        textAnchor="end"
                        fontSize="9"
                        fill="#94a3b8"
                        fontFamily="'Montserrat', sans-serif"
                      >
                        {t.val}
                      </text>
                    </g>
                  ))}

                  {/* Área Preenchida com Gradiente */}
                  {chartProps.areaPath && (
                    <path d={chartProps.areaPath} fill="url(#rainGradient)" />
                  )}

                  {/* Linha Contínua */}
                  {chartProps.linePath && (
                    <path
                      d={chartProps.linePath}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.4"
                    />
                  )}

                  {/* Labels Eixo X */}
                  {chartProps.dataPoints.map((pt, i) => {
                    if (i % chartProps.every === 0 || i === chartProps.dataPoints.length - 1) {
                      return (
                        <text
                          key={i}
                          x={pt.x}
                          y={chartProps.H - 8}
                          textAnchor="middle"
                          fontSize="9"
                          fill="#94a3b8"
                          fontFamily="'Montserrat', sans-serif"
                        >
                          {pt.label}
                        </text>
                      );
                    }
                    return null;
                  })}

                  {/* Ponto Final Ativo */}
                  {chartProps.dataPoints.length > 0 && (
                    <circle
                      cx={chartProps.dataPoints[chartProps.dataPoints.length - 1].x}
                      cy={chartProps.dataPoints[chartProps.dataPoints.length - 1].y}
                      r="4"
                      fill="#38bdf8"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Pontos Interativos no Hover */}
                  {chartProps.dataPoints.map((pt, i) => (
                    <circle
                      key={`hit-${i}`}
                      cx={pt.x}
                      cy={pt.y}
                      r="7"
                      fill="transparent"
                      cursor="pointer"
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}
                </svg>

                {/* Tooltip Dinâmico */}
                {hoveredPoint && (
                  <div style={{
                    position: 'absolute',
                    top: Math.max(0, hoveredPoint.y - 45),
                    left: Math.min(window.innerWidth * 0.45, hoveredPoint.x - 40),
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid #38bdf8',
                    borderRadius: '6px',
                    padding: '0.35rem 0.6rem',
                    fontSize: '0.75rem',
                    pointerEvents: 'none',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                    zIndex: 10
                  }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{hoveredPoint.date}</div>
                    <div style={{ color: '#38bdf8', fontWeight: 800 }}>
                      {formatNumber(hoveredPoint.val)} mm
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* PAINEL 2: RANKINGS POR ESTAÇÃO (2 COLUNAS) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem'
            }}>
              {/* Ranking 1: Chuva Média por Estação */}
              <div style={{
                borderRadius: '12px',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                background: 'linear-gradient(180deg, rgba(16, 40, 78, 0.8), rgba(11, 28, 56, 0.8))',
                padding: '1rem 1.25rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
              }}>
                <h3 style={{
                  margin: '0 0 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#38bdf8',
                  fontFamily: "'Montserrat', sans-serif",
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Chuva média por estação</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'none', fontWeight: 500 }}>
                    mm / dia
                  </span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {(() => {
                    const maxAvg = Math.max(1, ...stats.avgByStation.map(e => e[1]));
                    return stats.avgByStation.map(([locCode, avgVal]) => (
                      <div key={locCode} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                          width: '130px',
                          fontSize: '0.78rem',
                          color: '#e2e8f0',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }} title={getStationName(locCode)}>
                          {getStationName(locCode)}
                        </div>

                        <div style={{
                          flex: 1,
                          height: '10px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.min(100, (avgVal / maxAvg) * 100)}%`,
                            background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
                            borderRadius: '4px',
                            transition: 'width 0.4s ease'
                          }} />
                        </div>

                        <div style={{
                          width: '55px',
                          textAlign: 'right',
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          color: '#ffffff'
                        }}>
                          {formatNumber(avgVal, 1)}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Ranking 2: Acumulado por Estação */}
              <div style={{
                borderRadius: '12px',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                background: 'linear-gradient(180deg, rgba(16, 40, 78, 0.8), rgba(11, 28, 56, 0.8))',
                padding: '1rem 1.25rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
              }}>
                <h3 style={{
                  margin: '0 0 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#38bdf8',
                  fontFamily: "'Montserrat', sans-serif",
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Acumulado por estação</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'none', fontWeight: 500 }}>
                    mm no período
                  </span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {(() => {
                    const maxSum = Math.max(1, ...stats.sumByStation.map(e => e[1]));
                    return stats.sumByStation.map(([locCode, sumVal]) => (
                      <div key={locCode} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                          width: '130px',
                          fontSize: '0.78rem',
                          color: '#e2e8f0',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }} title={getStationName(locCode)}>
                          {getStationName(locCode)}
                        </div>

                        <div style={{
                          flex: 1,
                          height: '10px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.min(100, (sumVal / maxSum) * 100)}%`,
                            background: 'linear-gradient(90deg, #2563eb, #60a5fa)',
                            borderRadius: '4px',
                            transition: 'width 0.4s ease'
                          }} />
                        </div>

                        <div style={{
                          width: '65px',
                          textAlign: 'right',
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          color: '#38bdf8'
                        }}>
                          {formatNumber(sumVal, 1)}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: MAPA LEAFLET DE ESTAÇÕES PLUVIOMÉTRICAS */}
          <div style={{
            borderRadius: '12px',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            background: 'linear-gradient(180deg, rgba(16, 40, 78, 0.8), rgba(11, 28, 56, 0.8))',
            padding: '1rem 1.25rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '440px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '0.9rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#38bdf8',
                fontFamily: "'Montserrat', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <MapPin size={16} />
                <span>Estações Pluviométricas</span>
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {stats.estAtivas} estações ativas
              </span>
            </div>

            {/* Container do Mapa Leaflet */}
            <div
              ref={mapContainerRef}
              style={{
                flex: 1,
                minHeight: '340px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.4)'
              }}
            />

            {/* Legenda do Mapa */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '0.65rem',
              fontSize: '0.72rem',
              color: '#94a3b8'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#38bdf8',
                  border: '1px solid #ffffff'
                }} />
                <span>Tamanho do círculo ∝ chuva acumulada</span>
              </div>
              <span style={{ color: '#64748b' }}>Esri World Imagery</span>
            </div>
          </div>
        </div>
      ) : (
        /* VISÃO ANALÍTICA: TABELA DE LEITURAS DIÁRIAS */
        <div style={{
          position: 'relative',
          zIndex: 1,
          borderRadius: '12px',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          background: 'linear-gradient(180deg, rgba(16, 40, 78, 0.8), rgba(11, 28, 56, 0.8))',
          padding: '1.25rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '0.95rem',
              fontWeight: 800,
              color: '#38bdf8',
              fontFamily: "'Montserrat', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Table size={16} />
              <span>Série Histórica Detalhada ({dailyFiltered.length} registros diários)</span>
            </h2>

            <button
              type="button"
              onClick={handleExportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              <Download size={14} />
              <span>Exportar Tabela</span>
            </button>
          </div>

          <div style={{
            maxHeight: '480px',
            overflowY: 'auto',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '8px'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.8rem'
            }}>
              <thead>
                <tr style={{
                  backgroundColor: '#0e2244',
                  color: '#38bdf8',
                  borderBottom: '2px solid rgba(56, 189, 248, 0.3)',
                  position: 'sticky',
                  top: 0
                }}>
                  <th style={{ padding: '0.65rem 1rem' }}>Data do Registro</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Ano</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Mês</th>
                  <th style={{ padding: '0.65rem 1rem' }}>Dia</th>
                  <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Precipitação Diária (mm)</th>
                  <th style={{ padding: '0.65rem 1rem', textAlign: 'center' }}>Condição Hidrológica</th>
                </tr>
              </thead>
              <tbody>
                {dailyFiltered.slice(0, 500).map((row, idx) => {
                  const val = row.v || 0;
                  const isChuvaForte = val >= 30;
                  const isChuvaModerada = val >= 10 && val < 30;
                  const isChuvaLeve = val > 0 && val < 10;

                  return (
                    <tr
                      key={row.d || idx}
                      style={{
                        backgroundColor: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '0.55rem 1rem', fontWeight: 600, color: '#e2e8f0' }}>
                        {row.d.split('-').reverse().join('/')}
                      </td>
                      <td style={{ padding: '0.55rem 1rem', color: '#94a3b8' }}>
                        {row.d.slice(0, 4)}
                      </td>
                      <td style={{ padding: '0.55rem 1rem', color: '#94a3b8' }}>
                        {MONTH_LABELS[+row.d.slice(5, 7) - 1]} ({row.d.slice(5, 7)})
                      </td>
                      <td style={{ padding: '0.55rem 1rem', color: '#94a3b8' }}>
                        {row.d.slice(8, 10)}
                      </td>
                      <td style={{
                        padding: '0.55rem 1rem',
                        textAlign: 'right',
                        fontWeight: 800,
                        color: val > 0 ? '#38bdf8' : '#64748b',
                        fontFamily: "'Montserrat', sans-serif"
                      }}>
                        {formatNumber(val, 1)} mm
                      </td>
                      <td style={{ padding: '0.55rem 1rem', textAlign: 'center' }}>
                        {isChuvaForte ? (
                          <span style={{
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            color: '#f87171',
                            fontSize: '0.7rem',
                            fontWeight: 700
                          }}>
                            Chuva Intensa (Alerta)
                          </span>
                        ) : isChuvaModerada ? (
                          <span style={{
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(234, 179, 8, 0.2)',
                            color: '#facc15',
                            fontSize: '0.7rem',
                            fontWeight: 700
                          }}>
                            Chuva Moderada
                          </span>
                        ) : isChuvaLeve ? (
                          <span style={{
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(56, 189, 248, 0.15)',
                            color: '#38bdf8',
                            fontSize: '0.7rem'
                          }}>
                            Chuva Leve
                          </span>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '0.7rem' }}>
                            Sem chuva
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {dailyFiltered.length > 500 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: '#94a3b8', textAlign: 'right' }}>
              Exibindo primeiras 500 linhas. Use "Exportar Tabela" para baixar todos os {dailyFiltered.length} registros.
            </div>
          )}
        </div>
      )}

      {/* RODAPÉ DO PAINEL */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        fontSize: '0.75rem',
        color: '#64748b',
        padding: '0.5rem 0.5rem 0',
        borderTop: '1px solid rgba(56, 189, 248, 0.15)'
      }}>
        <div>
          Fonte: <strong style={{ color: '#94a3b8' }}>Painel Executivo de Pluviometria · Gerência de Geotecnia Itaminas</strong>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span>Estações: <b>{PLUVIOMETRIA_DATA.nstations}</b></span>
          <span>Período Histórico: <b>2018–2026</b></span>
          <span>Atualizado: <b>25/08/2026</b></span>
        </div>
      </div>
    </div>
  );
};

export default PluviometriaTab;
