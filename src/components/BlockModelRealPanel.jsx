import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, Box, Database, FileCode, Grid, Layers, Loader2, Sliders, Table2
} from 'lucide-react';
import {
  loadMeta, loadLod, loadBench, loadTerrain, loadGeoAssets, mergeBenches
} from '../services/blockModelService';
import { loadSatelliteMosaic, maxTextureSize } from '../services/satelliteTiles';
import {
  buildAxisLabels, buildInstrumentMarkers, buildStructureLabels, buildSurface, mosaicBounds, pickZoom
} from '../utils/blockModelGeo';
import {
  buildGeometry, buildLegend, cellInfo, computeColors, computeStats, computeVisible
} from '../utils/blockModelView';
import {
  CODE_HINTS, GRADE_META, categoryColor, categoryLabel, formatGrade, fmtBytes, fmtDec, fmtInt, fmtMt,
  INSTRUMENT_TYPES, gradeTitle, latLonToUtm23S, rampCss, statusColor
} from '../utils/blockModelFormat';
import { ENGENHO_SECO_SECTORS } from '../data/engenhoSecoBlockModelData';
import { BlockModel3D } from './BlockModel3D';
import { BlockModelPlan } from './BlockModelPlan';

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------
const labelStyle = { fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' };
const selectStyle = {
  padding: '0.3rem 0.5rem', fontSize: '0.74rem', borderRadius: '6px', backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)', color: 'var(--text-main)', maxWidth: '230px'
};
const pill = (active, color = 'var(--primary-accent)') => ({
  padding: '0.22rem 0.55rem', fontSize: '0.72rem', fontWeight: 600, borderRadius: '5px', border: 'none', cursor: 'pointer',
  backgroundColor: active ? color : 'transparent', color: active ? '#ffffff' : 'var(--text-muted)'
});
const group = { display: 'flex', gap: '2px', backgroundColor: 'var(--bg-surface)', borderRadius: '6px', padding: '2px', flexWrap: 'wrap' };
const card = { padding: '0.75rem 1rem', borderRadius: '10px' };

const FIELD_DESC = {
  IJK: 'Índice da célula-pai: (i·NY + j)·NZ + k',
  XC: 'Centroide E do (sub)bloco — UTM SIRGAS 2000 23S (m)',
  YC: 'Centroide N do (sub)bloco — UTM SIRGAS 2000 23S (m)',
  ZC: 'Centroide da cota do (sub)bloco (m)',
  XINC: 'Dimensão do (sub)bloco em X (m)',
  YINC: 'Dimensão do (sub)bloco em Y (m)',
  ZINC: 'Dimensão do (sub)bloco em Z (m)',
  XMORIG: 'Origem do modelo em E (constante do cabeçalho)',
  YMORIG: 'Origem do modelo em N (constante do cabeçalho)',
  ZMORIG: 'Origem do modelo na cota (constante do cabeçalho)',
  NX: 'Nº de células-pai em X (constante do cabeçalho)',
  NY: 'Nº de células-pai em Y (constante do cabeçalho)',
  NZ: 'Nº de células-pai em Z (constante do cabeçalho)',
  DENS: 'Densidade (t/m³)',
  DM: 'Processo / direito minerário (ex.: DNPM_5960)',
  CITY: 'Município',
  LITOLOGY: 'Código de litologia',
  TIPO: 'Tipo de material (minério, estéril, pilha, barragem...)',
  DESTINO: 'Destino do material (ROM Especial, ROM Comum, estéril...)',
  RISCO: 'Classe de risco do bloco (alto / médio / baixo / nc)',
  F_GRA: 'Campo F_GRA (valor constante 100 no arquivo)',
  FQGL: 'Campo FQGL (definição não consta no arquivo)'
};
function describeField(name) {
  if (FIELD_DESC[name]) return FIELD_DESC[name];
  if (/^G(1|23|4)$/.test(name)) return `Fração ${name} (% da massa)`;
  const m = /^(FE|SI|P|AL|MN|PF)(GL|1|23|4)$/.exec(name);
  if (m) {
    const el = { FE: 'Fe', SI: 'SiO₂', P: 'P', AL: 'Al₂O₃', MN: 'Mn', PF: 'PF (perda ao fogo)' }[m[1]];
    return m[2] === 'GL' ? `Teor global de ${el} (%)` : `Teor de ${el} na fração G${m[2]} (%)`;
  }
  return '—';
}

// ---------------------------------------------------------------------------
// Componentes auxiliares
// ---------------------------------------------------------------------------
const Chip = ({ active, color, label, onClick, title }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '0.18rem 0.5rem', fontSize: '0.7rem', fontWeight: 600,
      borderRadius: '999px', cursor: 'pointer', border: `1px solid ${active ? color : 'var(--border-subtle)'}`,
      backgroundColor: active ? `${color}22` : 'transparent', color: active ? 'var(--text-main)' : 'var(--text-muted)',
      opacity: active ? 1 : 0.55
    }}
  >
    <span style={{ width: 9, height: 9, borderRadius: 3, backgroundColor: color, opacity: active ? 1 : 0.4 }} />
    {label}
  </button>
);

const Legend = ({ legend }) => {
  if (!legend) return null;
  if (legend.type === 'ramp') {
    const stops = [0, 0.25, 0.5, 0.75, 1].map((t) => rampCss(t)).join(', ');
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        <strong style={{ color: 'var(--text-main)' }}>{legend.title}</strong>
        <span>{fmtDec(legend.min, legend.max < 1 ? 2 : 0)}</span>
        <div style={{ width: 160, height: 10, borderRadius: 5, background: `linear-gradient(90deg, ${stops})` }} />
        <span>{fmtDec(legend.max, legend.max < 1 ? 2 : 0)}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: '#383f4d' }} /> sem valor
        </span>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
      {legend.items.map((it) => (
        <span key={it.key} title={CODE_HINTS[it.key] || it.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
};

const GradeTable = ({ info, vars }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem' }}>
    <tbody>
      {vars.map((v) => (
        <tr key={v} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <td style={{ padding: '2px 0', color: 'var(--text-muted)' }}>{gradeTitle(v)}</td>
          <td style={{ padding: '2px 0', textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>{formatGrade(v, info.g[v])}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const InstrumentCard = ({ ins, terrainZ }) => {
  if (!ins) return null;
  const tp = INSTRUMENT_TYPES[ins.tipo];
  const row = (k, v, color) => (
    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '2px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ color: 'var(--text-muted)' }}>{k}</span>
      <strong style={{ color: color || 'var(--text-main)', textAlign: 'right' }}>{v}</strong>
    </div>
  );
  const num = (v, d = 2) => (Number.isFinite(Number(v)) && v !== null ? fmtDec(Number(v), d) : '—');
  return (
    <div style={{ fontSize: '0.72rem', padding: '0.65rem 0.8rem' }}>
      <div style={{ fontWeight: 800, color: tp?.color || 'var(--primary-accent)', marginBottom: 4 }}>
        Instrumento {ins.id} — {tp?.label || ins.tipo}
      </div>
      {row('Estrutura', ins.estrutura)}
      {row('Seção', ins.secao || '—')}
      {row('Status', ins.statusCalculado || '—', statusColor(ins.statusCalculado))}
      {row('Situação', ins.situacao || '—')}
      {row('UTM E', fmtInt(ins.coordenadaEW))}
      {row('UTM N', fmtInt(ins.coordenadaNS))}
      {row('Cota do topo', `${num(ins.cotaTopo)} m`)}
      {row('Cota da base', `${num(ins.cotaBase)} m`)}
      {row('Cota do fundo', `${num(ins.cotaFundo)} m`)}
      {terrainZ != null && row('Topo do modelo no ponto', `${fmtDec(terrainZ, 1)} m (Δ ${fmtDec(Number(ins.cotaTopo) - terrainZ, 1)} m)`)}
      {row('Profundidade instalada', `${num(ins.profundidadeInstalacao)} m`)}
      {row('Instalação', ins.dataInstalacao || '—')}
      {row('Última leitura', `${num(ins.ultimaLeitura)} (${ins.ultimaData || '—'})`)}
      {row('Última cota', `${num(ins.ultimaCota)} m`)}
      <div style={{ marginTop: 8, fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Limites de controle</div>
      {row('Normal', num(ins.limiteNormal))}
      {row('Atenção', num(ins.limiteAtencao))}
      {row('Alerta', num(ins.limiteAlerta))}
      {row('Emergência', num(ins.limiteEmergencia))}
      <div style={{ marginTop: 8, fontSize: '0.67rem', color: 'var(--text-muted)' }}>
        Dados do banco geotécnico do MDSync, georreferenciados sobre o modelo de blocos (SIRGAS 2000 / UTM 23S).
      </div>
    </div>
  );
};

const Inspector = ({ info, meta, onFocusBench }) => {
  if (!info) {
    return (
      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', padding: '0.75rem' }}>
        Clique em um bloco para ver a ficha completa (litologia, tipo, destino, risco, processo, município, massa e todos os teores do arquivo).
      </div>
    );
  }
  const vars = Object.keys(info.g);
  const section = (title, list) => {
    const present = list.filter((v) => vars.includes(v));
    if (!present.length) return null;
    return (
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>{title}</div>
        <GradeTable info={info} vars={present} />
      </div>
    );
  };
  const row = (k, v, color) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '2px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ color: 'var(--text-muted)' }}>{k}</span>
      <strong style={{ color: color || 'var(--text-main)', textAlign: 'right' }}>{v}</strong>
    </div>
  );
  return (
    <div style={{ fontSize: '0.72rem', padding: '0.65rem 0.8rem' }}>
      <div style={{ fontWeight: 800, color: 'var(--primary-accent)', marginBottom: 4 }}>
        {info.kind === 'overview' ? 'Célula agregada' : 'Célula-pai'} {info.sx}×{info.sy}×{info.sz} m
      </div>
      {row('UTM E', fmtInt(info.e))}
      {row('UTM N', fmtInt(info.n))}
      {row('Cota', `${fmtInt(info.zMin)}–${fmtInt(info.zMax)} m`)}
      {row('Litologia', categoryLabel('lito', info.cat.lito), categoryColor('lito', info.cat.lito, meta.categorias.lito.indexOf(info.cat.lito)))}
      {row('Tipo', categoryLabel('tipo', info.cat.tipo))}
      {row('Destino', categoryLabel('destino', info.cat.destino))}
      {row('Risco', categoryLabel('risco', info.cat.risco))}
      {row('Processo (DM)', categoryLabel('dm', info.cat.dm))}
      {row('Município', categoryLabel('city', info.cat.city))}
      {row('Volume', `${fmtInt(info.vol)} m³`)}
      {row('Densidade', `${fmtDec(info.dens, 2)} t/m³`)}
      {row('Massa', `${fmtInt(info.massa)} t`)}
      {section('Teores globais', ['FEGL', 'SIGL', 'PGL', 'ALGL', 'MNGL', 'PFGL', 'FQGL'])}
      {section('Fração G1', ['G1', 'FE1', 'SI1', 'P1', 'AL1', 'MN1', 'PF1'])}
      {section('Fração G23', ['G23', 'FE23', 'SI23', 'P23', 'AL23', 'MN23', 'PF23'])}
      {section('Fração G4', ['G4', 'FE4', 'SI4', 'P4', 'AL4', 'MN4', 'PF4'])}
      {info.kind === 'overview' && (
        <>
          <div style={{ marginTop: 8, fontSize: '0.67rem', color: 'var(--text-muted)' }}>
            Célula de baixa resolução (agrega blocos-pai de 10 m). Teores completos por fração no modo Detalhe.
          </div>
          <button
            onClick={() => onFocusBench(info.zMin)}
            className="btn-subtle"
            style={{ marginTop: 6, padding: '0.3rem 0.6rem', fontSize: '0.72rem', borderRadius: 6, width: '100%' }}
          >
            Abrir esta região em detalhe (10 m)
          </button>
        </>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Painel principal
// ---------------------------------------------------------------------------
export const BlockModelRealPanel = ({ modelId }) => {
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('3d');
  const [colorMode, setColorMode] = useState('lito');

  const [tipoOff, setTipoOff] = useState(() => new Set(['esteril']));
  const [destinoOff, setDestinoOff] = useState(() => new Set());
  const [riscoOff, setRiscoOff] = useState(() => new Set());
  const [litoOff, setLitoOff] = useState(() => new Set());
  const [dm, setDm] = useState('');
  const [city, setCity] = useState('');
  const [sectorId, setSectorId] = useState('ALL');

  const [res, setRes] = useState('lod20'); // 'overview' (40 m) | 'lod20' (20 m) | 'detail' (10 m)
  const [zFrom, setZFrom] = useState(null);
  const [zTo, setZTo] = useState(null);
  const [vExag, setVExag] = useState(1.5);
  const [overview, setOverview] = useState(null);
  const [lod20, setLod20] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [sel3d, setSel3d] = useState(-1);
  const [fitKey, setFitKey] = useState(0);

  // camadas geoespaciais, seções e teor de corte
  const [satMode, setSatMode] = useState('off'); // 'off' | 'flat' | 'dem'
  const [satOpacity, setSatOpacity] = useState(0.9);
  const [showInstr, setShowInstr] = useState(false);
  const [showStruct, setShowStruct] = useState(false);
  const [showAxes, setShowAxes] = useState(true);
  const [terrain, setTerrain] = useState(null);
  const [geoAssets, setGeoAssets] = useState(null);
  const [mosaic, setMosaic] = useState(null);
  const [satMsg, setSatMsg] = useState('');
  const [selMarker, setSelMarker] = useState(-1);
  const [secE, setSecE] = useState(null);
  const [secN, setSecN] = useState(null);
  const [valMin, setValMin] = useState('');
  const [valMax, setValMax] = useState('');

  const [planZ, setPlanZ] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [selPlan, setSelPlan] = useState(-1);

  const [sumDim, setSumDim] = useState('lito');
  const MAX_SPAN = 6; // nº máximo de bancadas no modo detalhe

  // ---- carga do meta -------------------------------------------------------
  useEffect(() => {
    let alive = true;
    setMeta(null); setError(null);
    loadMeta(modelId).then((m) => {
      if (!alive) return;
      setMeta(m);
      const zs = m.bancadas.map((b) => b.z0);
      setZFrom(Math.min(...zs));
      setZTo(Math.max(...zs));
      setSecE([m.extensao.xmin, m.extensao.xmax]);
      setSecN([m.extensao.ymin, m.extensao.ymax]);
      if (!m.lod20) setRes('overview');
      // bancada padrão da planta: a de maior massa de minério
      const rows = (m.resumos.bench_tipo || []).filter((r) => r.tipo === 'minerio');
      let best = rows.sort((a, b) => b.massa - a.massa)[0];
      setPlanZ(best ? m.origem.z + best.bench * m.tamanhoPai.z : zs[0]);
    }).catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [modelId]);

  // ---- células agregadas (LOD) -------------------------------------------
  useEffect(() => {
    if (!meta || res === 'detail') return;
    const which = res === 'lod20' && meta.lod20 ? 'lod20' : 'overview';
    if ((which === 'lod20' && lod20) || (which === 'overview' && overview)) return;
    let alive = true;
    setLoadingMsg(which === 'lod20' ? 'Carregando modelo 3D (20 m)...' : 'Carregando modelo 3D...');
    loadLod(modelId, meta, which).then((d) => {
      if (!alive) return;
      if (which === 'lod20') setLod20(d); else setOverview(d);
      setLoadingMsg('');
    }).catch((e) => alive && (setError(e.message), setLoadingMsg('')));
    return () => { alive = false; };
  }, [meta, modelId, res, lod20, overview]);

  // ---- terreno, ativos geoespaciais e satélite ----------------------------
  useEffect(() => {
    if (!meta || !meta.terreno || terrain || !(satMode === 'dem' || showStruct || showInstr)) return;
    let alive = true;
    loadTerrain(modelId, meta).then((t) => alive && setTerrain(t)).catch(() => {});
    return () => { alive = false; };
  }, [meta, modelId, satMode, showStruct, showInstr, terrain]);

  useEffect(() => {
    if (!(showInstr || showStruct) || geoAssets) return;
    let alive = true;
    loadGeoAssets().then((g) => alive && setGeoAssets(g)).catch(() => alive && setSatMsg('Dados geoespaciais do MDSync indisponíveis'));
    return () => { alive = false; };
  }, [showInstr, showStruct, geoAssets]);

  const satBounds = useMemo(
    () => (meta && satMode !== 'off' ? mosaicBounds(meta, pickZoom(meta, maxTextureSize())) : null),
    [meta, satMode]
  );
  useEffect(() => {
    if (!satBounds) return undefined;
    let alive = true;
    setSatMsg('Carregando imagem de satélite...');
    loadSatelliteMosaic(satBounds, {
      onProgress: (d, t) => alive && setSatMsg(`Carregando imagem de satélite ${d}/${t}...`)
    }).then((r) => {
      if (!alive) return;
      setMosaic(r.ok > 0 ? r : null);
      setSatMsg(r.ok === 0 ? 'Imagem de satélite indisponível (sem rede ou bloqueada)' : r.failed ? `${r.failed} de ${r.total} tiles de satélite indisponíveis` : '');
    });
    return () => { alive = false; };
  }, [satBounds]);

  // ---- detalhe (bancadas selecionadas) -----------------------------------
  const benchList = useMemo(() => (meta ? meta.bancadas.map((b) => b.z0) : []), [meta]);
  useEffect(() => {
    if (!meta || res !== 'detail' || zFrom == null) return;
    const ks = meta.bancadas.filter((b) => b.z0 >= zFrom && b.z0 <= zTo).map((b) => b.k);
    if (!ks.length) return;
    let alive = true;
    setLoadingMsg(`Carregando ${ks.length} bancada(s)...`);
    Promise.all(ks.map((k) => loadBench(modelId, meta, k))).then((list) => {
      if (!alive) return;
      setDetail(mergeBenches(list));
      setLoadingMsg('');
      setSel3d(-1);
    }).catch((e) => alive && (setError(e.message), setLoadingMsg('')));
    return () => { alive = false; };
  }, [meta, modelId, res, zFrom, zTo]);

  // ---- bancada da planta ---------------------------------------------------
  useEffect(() => {
    if (!meta || planZ == null) return;
    const info = meta.bancadas.find((b) => b.z0 === planZ);
    if (!info) return;
    let alive = true;
    loadBench(modelId, meta, info.k).then((b) => { if (alive) { setPlanData(mergeBenches([b])); setSelPlan(-1); } })
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [meta, modelId, planZ]);

  // ---- derivados 3D ------------------------------------------------------
  const sectorPoly = useMemo(() => {
    const s = ENGENHO_SECO_SECTORS.find((x) => x.id === sectorId);
    if (!s) return null;
    return s.coordinates.map(([lat, lon]) => {
      const u = latLonToUtm23S(lat, lon);
      return [u.easting, u.northing];
    });
  }, [sectorId]);

  const filters = useMemo(() => ({ tipoOff, destinoOff, riscoOff, litoOff, dm, city, sectorPoly }), [tipoOff, destinoOff, riscoOff, litoOff, dm, city, sectorPoly]);
  const data3d = res === 'detail' ? detail : res === 'lod20' && meta?.lod20 ? lod20 : overview;
  const modes3d = data3d ? Object.keys(data3d.g) : [];
  const mode3d = ['lito', 'tipo', 'destino', 'risco', 'dm', 'city', 'cota', 'dens'].includes(colorMode) || modes3d.includes(colorMode) ? colorMode : 'lito';
  const numericMode = modes3d.includes(mode3d);
  const vMinNum = valMin === '' ? NaN : Number(String(valMin).replace(',', '.'));
  const vMaxNum = valMax === '' ? NaN : Number(String(valMax).replace(',', '.'));
  const ext = meta?.extensao;
  const secActive = !!(meta && secE && secN && (secE[0] > ext.xmin || secE[1] < ext.xmax || secN[0] > ext.ymin || secN[1] < ext.ymax));
  const filters3d = useMemo(() => ({
    ...filters,
    zMin: zFrom ?? undefined,
    zMax: zTo != null ? zTo + 10 : undefined,
    eMin: secE && secActive ? secE[0] : undefined,
    eMax: secE && secActive ? secE[1] : undefined,
    nMin: secN && secActive ? secN[0] : undefined,
    nMax: secN && secActive ? secN[1] : undefined,
    valueVar: numericMode ? mode3d : undefined,
    valueMin: vMinNum,
    valueMax: vMaxNum
  }), [filters, zFrom, zTo, secE, secN, secActive, numericMode, mode3d, vMinNum, vMaxNum]);

  const geom3d = useMemo(() => (meta && data3d ? buildGeometry(meta, data3d) : null), [meta, data3d]);
  const visible3d = useMemo(() => (geom3d ? computeVisible(meta, data3d, geom3d, filters3d) : null), [meta, data3d, geom3d, filters3d]);
  const colors3d = useMemo(() => (geom3d ? computeColors(meta, data3d, geom3d, mode3d) : null), [meta, data3d, geom3d, mode3d]);
  const stats3d = useMemo(() => (data3d && visible3d ? computeStats(data3d, visible3d) : null), [data3d, visible3d]);
  const legend = useMemo(() => (meta && data3d ? buildLegend(meta, mode3d) : null), [meta, data3d, mode3d]);

  // ---- derivados geoespaciais ---------------------------------------------
  const surface = useMemo(() => {
    if (!meta || satMode === 'off' || !satBounds) return null;
    if (satMode === 'dem') {
      if (!terrain) return null;
      return { ...buildSurface(meta, terrain, satBounds, { mode: 'dem', stride: 2 }), offset: 1.2 };
    }
    return { ...buildSurface(meta, null, satBounds, { mode: 'flat', flatZ: meta.extensao.zmin }), offset: -1 };
  }, [meta, satMode, satBounds, terrain]);
  const markers = useMemo(() => (meta && showInstr && geoAssets ? buildInstrumentMarkers(geoAssets, meta, { colorBy: 'status' }) : null), [meta, showInstr, geoAssets]);
  const structs = useMemo(() => (meta && showStruct && geoAssets ? buildStructureLabels(geoAssets, meta, terrain) : null), [meta, showStruct, geoAssets, terrain]);
  const labels3d = useMemo(() => {
    if (!meta) return null;
    const list = [...(showAxes ? buildAxisLabels(meta) : []), ...(structs ? structs.labels : [])];
    return list.length ? list : null;
  }, [meta, showAxes, structs]);
  const markerInfo = markers && selMarker >= 0 && selMarker < markers.n ? markers.items[selMarker] : null;
  const markerTerrainZ = useMemo(() => {
    if (!markerInfo || !terrain || !meta) return null;
    const i = Math.floor((Number(markerInfo.coordenadaEW) - meta.origem.x) / meta.tamanhoPai.x);
    const j = Math.floor((Number(markerInfo.coordenadaNS) - meta.origem.y) / meta.tamanhoPai.y);
    const t = terrain.elev[i * terrain.ny + j];
    return Number.isNaN(t) || t === undefined ? null : t;
  }, [markerInfo, terrain, meta]);

  // ---- derivados planta ----------------------------------------------------
  const geomPlan = useMemo(() => (meta && planData ? buildGeometry(meta, planData) : null), [meta, planData]);
  const visiblePlan = useMemo(() => (geomPlan ? computeVisible(meta, planData, geomPlan, filters) : null), [meta, planData, geomPlan, filters]);
  const modePlan = ['lito', 'tipo', 'destino', 'risco', 'dm', 'city', 'cota', 'dens'].includes(colorMode) || (planData && planData.g[colorMode]) ? colorMode : 'lito';
  const colorsPlan = useMemo(() => (geomPlan ? computeColors(meta, planData, geomPlan, modePlan) : null), [meta, planData, geomPlan, modePlan]);
  const statsPlan = useMemo(() => (planData && visiblePlan ? computeStats(planData, visiblePlan) : null), [planData, visiblePlan]);
  const legendPlan = useMemo(() => (meta && planData ? buildLegend(meta, modePlan) : null), [meta, planData, modePlan]);

  const info3d = useMemo(() => (meta && data3d && sel3d >= 0 && sel3d < data3d.n ? cellInfo(meta, data3d, sel3d) : null), [meta, data3d, sel3d]);
  const infoPlan = useMemo(() => (meta && planData && selPlan >= 0 && selPlan < planData.n ? cellInfo(meta, planData, selPlan) : null), [meta, planData, selPlan]);

  // ---- helpers -------------------------------------------------------------
  const toggle = (setter) => (name) => setter((prev) => {
    const next = new Set(prev);
    if (next.has(name)) next.delete(name); else next.add(name);
    return next;
  });
  const focusBench = (z) => {
    const base = Math.floor(z / 10) * 10;
    const from = Math.max(Math.min(...benchList), base - 20);
    const to = Math.min(Math.max(...benchList), base + 20);
    setRes('detail'); setZFrom(from); setZTo(to); setFitKey((k) => k + 1);
  };
  const changeFrom = (v) => {
    const z = Number(v);
    setZFrom(z);
    if (res === 'detail' && zTo - z > (MAX_SPAN - 1) * 10) setZTo(z + (MAX_SPAN - 1) * 10);
    if (zTo < z) setZTo(z);
  };
  const changeTo = (v) => {
    const z = Number(v);
    setZTo(z);
    if (res === 'detail' && z - zFrom > (MAX_SPAN - 1) * 10) setZFrom(z - (MAX_SPAN - 1) * 10);
    if (zFrom > z) setZFrom(z);
  };
  const switchRes = (r) => {
    setRes(r);
    if (r === 'detail' && zTo - zFrom > (MAX_SPAN - 1) * 10) {
      const c = Math.round((zFrom + zTo) / 20) * 10;
      setZFrom(Math.max(benchList[0], c - 20));
      setZTo(Math.min(benchList[benchList.length - 1], c + 20));
    }
    setFitKey((k) => k + 1);
  };

  if (error) {
    return (
      <div className="glass-panel" style={{ ...card, border: '1px solid #ef4444', color: '#f87171', display: 'flex', gap: 8, alignItems: 'center' }}>
        <AlertTriangle size={18} /> {error}
      </div>
    );
  }
  if (!meta) {
    return (
      <div className="glass-panel" style={{ ...card, display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)' }}>
        <Loader2 size={16} className="spin-animation" /> Carregando ficha do modelo de blocos...
      </div>
    );
  }

  const destRow = (name) => (meta.resumos.destino || []).find((r) => r.destino === name);
  const esp = destRow('Especial'), com = destRow('Comum'), est = destRow('Esteril'), wov = destRow('WOV'), out = destRow('OUT');
  const rem = esp && com && est ? est.massa / (esp.massa + com.massa) : null;
  const dmOptions = meta.categorias.dm;
  const cityOptions = meta.categorias.city;
  const gradeOptions = (tab === 'planta' ? (planData ? Object.keys(planData.g) : []) : modes3d);

  const kpi = (title, color, big, lines) => (
    <div className="glass-panel" style={{ ...card, borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>{big}</div>
      <div style={{ fontSize: '0.72rem', color, fontWeight: 700, marginTop: 3, display: 'flex', gap: 8, flexWrap: 'wrap' }}>{lines}</div>
    </div>
  );
  const gl = (r, v) => (r && r.g[v] != null ? formatGrade(v, r.g[v]) : '—');

  const tabs = [
    ['3d', 'Modelo 3D', Box], ['planta', 'Planta por bancada', Grid], ['resumo', 'Resumo & teores', Table2], ['arquivo', 'Arquivo & campos', FileCode]
  ];

  // --------------------------------------------------------------------------
  return (
    <>
      {/* Cards de resumo (modelo completo) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.75rem' }}>
        {kpi('ROM Especial (modelo completo)', '#ef4444', <>{fmtInt(esp?.massa)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>t</span></>, <>
          <span>Fe: {gl(esp, 'FEGL')}%</span><span>SiO₂: {gl(esp, 'SIGL')}%</span><span>P: {gl(esp, 'PGL')}%</span></>)}
        {kpi('ROM Comum (modelo completo)', '#38bdf8', <>{fmtInt(com?.massa)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>t</span></>, <>
          <span>Fe: {gl(com, 'FEGL')}%</span><span>SiO₂: {gl(com, 'SIGL')}%</span><span>P: {gl(com, 'PGL')}%</span></>)}
        {kpi('Estéril & Relação REM', '#f59e0b', <>{fmtInt(est?.massa)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>t</span></>, <>
          <span title="REM = massa de destino Estéril ÷ (ROM Especial + ROM Comum)">REM: {rem != null ? fmtDec(rem, 2) : '—'} t/t</span>
          <span>Vol: {fmtInt(est?.vol)} m³</span>
          {wov && <span title={CODE_HINTS.WOV}>WOV: {fmtMt(wov.massa)}</span>}
          {out && <span title={CODE_HINTS.OUT}>OUT: {fmtMt(out.massa)}</span>}</>)}
        {kpi('Arquivo Datamine (.dm)', '#10b981', <span style={{ fontSize: '0.86rem', wordBreak: 'break-all' }}>{meta.arquivo}</span>, <>
          <span>{fmtBytes(meta.tamanhoBytes)}</span>
          <span>{fmtDec(meta.registros / 1e6, 2)} mi registros</span>
          <span>Bloco: {meta.tamanhoPai.x}×{meta.tamanhoPai.y}×{meta.tamanhoPai.z} m</span></>)}
      </div>

      {/* Filtros globais */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1rem', borderRadius: 10, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-medium)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Layers size={14} style={{ color: '#f59e0b' }} />
          <span style={labelStyle}>Setor / Cava:</span>
          <select value={sectorId} onChange={(e) => setSectorId(e.target.value)} style={selectStyle}>
            <option value="ALL">Toda a mina (modelo completo)</option>
            {ENGENHO_SECO_SECTORS.map((s) => <option key={s.id} value={s.id}>{s.nome} — polígono aproximado</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={labelStyle}>Processo (DM):</span>
          <select value={dm} onChange={(e) => setDm(e.target.value)} style={selectStyle}>
            <option value="">Todos</option>
            {dmOptions.map((o) => <option key={o} value={o}>{categoryLabel('dm', o)}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={labelStyle}>Município:</span>
          <select value={city} onChange={(e) => setCity(e.target.value)} style={selectStyle}>
            <option value="">Todos</option>
            {cityOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sliders size={14} style={{ color: '#8b5cf6' }} />
          <span style={labelStyle}>Coloração:</span>
          <select value={tab === 'planta' ? modePlan : mode3d} onChange={(e) => setColorMode(e.target.value)} style={selectStyle}>
            <optgroup label="Categorias">
              <option value="lito">Litologia</option>
              <option value="tipo">Tipo</option>
              <option value="destino">Destino</option>
              <option value="risco">Risco</option>
              <option value="dm">Processo minerário (DM)</option>
              <option value="city">Município</option>
            </optgroup>
            <optgroup label="Geometria / física">
              <option value="cota">Cota (m)</option>
              <option value="dens">Densidade</option>
            </optgroup>
            <optgroup label="Teores">
              {gradeOptions.map((v) => <option key={v} value={v}>{gradeTitle(v)}</option>)}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Abas */}
      <div style={{ ...group, alignSelf: 'flex-start' }}>
        {tabs.map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)} style={{ ...pill(tab === id), display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ===================== ABA 3D ===================== */}
      {tab === '3d' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
            <div style={group}>
              <button style={pill(res === 'overview', '#0284c7')} onClick={() => switchRes('overview')} title="Células agregadas de 40×40×20 m — mina inteira (leve)">Mina 40 m</button>
              {meta.lod20 && <button style={pill(res === 'lod20', '#0284c7')} onClick={() => switchRes('lod20')} title="Células agregadas de 20×20×10 m — mina inteira, refinado">Mina 20 m</button>}
              <button style={pill(res === 'detail', '#0284c7')} onClick={() => switchRes('detail')} title="Células-pai de 10×10×10 m (até 6 bancadas)">Detalhe 10 m</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={labelStyle}>Bancadas de</span>
              <select value={zFrom ?? ''} onChange={(e) => changeFrom(e.target.value)} style={selectStyle}>
                {benchList.map((z) => <option key={z} value={z}>{z} m</option>)}
              </select>
              <span style={labelStyle}>até</span>
              <select value={zTo ?? ''} onChange={(e) => changeTo(e.target.value)} style={selectStyle}>
                {benchList.map((z) => <option key={z} value={z}>{z + 10} m</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={labelStyle}>Exagero vertical</span>
              <input type="range" min="1" max="4" step="0.25" value={vExag} onChange={(e) => setVExag(Number(e.target.value))} />
              <span style={{ ...labelStyle, minWidth: 28 }}>{vExag}×</span>
            </div>
            {loadingMsg && <span style={{ ...labelStyle, display: 'inline-flex', alignItems: 'center', gap: 5 }}><Loader2 size={13} className="spin-animation" /> {loadingMsg}</span>}
          </div>

          {/* Camadas geoespaciais */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem 0.9rem', padding: '0.45rem 0.7rem', borderRadius: 8, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ ...labelStyle, color: 'var(--text-main)' }}>🌎 Camadas geoespaciais</span>
            <div style={group}>
              <button style={pill(satMode === 'off', '#475569')} onClick={() => setSatMode('off')}>Sem imagem</button>
              <button style={pill(satMode === 'flat', '#0d9488')} onClick={() => { setSatMode('flat'); setSatOpacity(0.9); }} title="Imagem de satélite como base plana sob o modelo">Satélite (base)</button>
              {meta.terreno && <button style={pill(satMode === 'dem', '#0d9488')} onClick={() => { setSatMode('dem'); setSatOpacity(0.6); }} title="Imagem de satélite sobre a superfície do terreno derivada do modelo de blocos">Satélite sobre o terreno</button>}
            </div>
            {satMode !== 'off' && (
              <label style={{ ...labelStyle, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                Opacidade
                <input type="range" min="0.1" max="1" step="0.05" value={satOpacity} onChange={(e) => setSatOpacity(Number(e.target.value))} />
              </label>
            )}
            <label style={{ ...labelStyle, display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <input type="checkbox" checked={showInstr} onChange={(e) => { setShowInstr(e.target.checked); if (!e.target.checked) setSelMarker(-1); }} />
              Instrumentos MDSync{markers ? ` (${markers.n} na área)` : ''}
            </label>
            <label style={{ ...labelStyle, display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <input type="checkbox" checked={showStruct} onChange={(e) => setShowStruct(e.target.checked)} />
              Estruturas{structs ? ` (${structs.items.length} na área)` : ''}
            </label>
            <label style={{ ...labelStyle, display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <input type="checkbox" checked={showAxes} onChange={(e) => setShowAxes(e.target.checked)} />
              Coordenadas UTM / cotas
            </label>
            {satMsg && <span style={{ ...labelStyle, color: '#f59e0b' }}>{satMsg}</span>}
          </div>

          {/* Seções e teor de corte */}
          {secE && secN && (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem 0.9rem', padding: '0.45rem 0.7rem', borderRadius: 8, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ ...labelStyle, color: 'var(--text-main)' }}>✂️ Seção</span>
              <label style={{ ...labelStyle, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Leste (E)
                <input type="range" style={{ width: 100 }} min={meta.extensao.xmin} max={meta.extensao.xmax} step="10" value={secE[0]} onChange={(e) => setSecE([Math.min(Number(e.target.value), secE[1] - 10), secE[1]])} />
                <input type="range" style={{ width: 100 }} min={meta.extensao.xmin} max={meta.extensao.xmax} step="10" value={secE[1]} onChange={(e) => setSecE([secE[0], Math.max(Number(e.target.value), secE[0] + 10)])} />
                <span style={{ minWidth: 118 }}>{fmtInt(secE[0])}–{fmtInt(secE[1])}</span>
              </label>
              <label style={{ ...labelStyle, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Norte (N)
                <input type="range" style={{ width: 100 }} min={meta.extensao.ymin} max={meta.extensao.ymax} step="10" value={secN[0]} onChange={(e) => setSecN([Math.min(Number(e.target.value), secN[1] - 10), secN[1]])} />
                <input type="range" style={{ width: 100 }} min={meta.extensao.ymin} max={meta.extensao.ymax} step="10" value={secN[1]} onChange={(e) => setSecN([secN[0], Math.max(Number(e.target.value), secN[0] + 10)])} />
                <span style={{ minWidth: 134 }}>{fmtInt(secN[0])}–{fmtInt(secN[1])}</span>
              </label>
              {numericMode && (
                <label style={{ ...labelStyle, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Teor de corte ({gradeTitle(mode3d)})
                  <input type="number" step="any" placeholder="mín" value={valMin} onChange={(e) => setValMin(e.target.value)} style={{ ...selectStyle, width: 64 }} />
                  <input type="number" step="any" placeholder="máx" value={valMax} onChange={(e) => setValMax(e.target.value)} style={{ ...selectStyle, width: 64 }} />
                </label>
              )}
              {(secActive || valMin !== '' || valMax !== '') && (
                <button
                  className="btn-subtle"
                  style={{ padding: '2px 8px', fontSize: '0.7rem', borderRadius: 6 }}
                  onClick={() => { setSecE([meta.extensao.xmin, meta.extensao.xmax]); setSecN([meta.extensao.ymin, meta.extensao.ymax]); setValMin(''); setValMax(''); }}
                >
                  Limpar seção/teor
                </button>
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1.2rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={labelStyle}>Tipo:</span>
              {meta.categorias.tipo.map((n, id) => <Chip key={n} active={!tipoOff.has(n)} color={categoryColor('tipo', n, id)} label={categoryLabel('tipo', n)} title={CODE_HINTS[n]} onClick={() => toggle(setTipoOff)(n)} />)}
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={labelStyle}>Destino:</span>
              {meta.categorias.destino.map((n, id) => <Chip key={n} active={!destinoOff.has(n)} color={categoryColor('destino', n, id)} label={categoryLabel('destino', n)} title={CODE_HINTS[n]} onClick={() => toggle(setDestinoOff)(n)} />)}
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={labelStyle}>Risco:</span>
              {meta.categorias.risco.map((n, id) => <Chip key={n} active={!riscoOff.has(n)} color={categoryColor('risco', n, id)} label={categoryLabel('risco', n)} title={CODE_HINTS[n]} onClick={() => toggle(setRiscoOff)(n)} />)}
            </div>
          </div>
          <details>
            <summary style={{ ...labelStyle, cursor: 'pointer' }}>Litologias ({meta.categorias.lito.length - litoOff.size} de {meta.categorias.lito.length} ativas)</summary>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
              <button className="btn-subtle" style={{ padding: '2px 8px', fontSize: '0.68rem', borderRadius: 999 }} onClick={() => setLitoOff(new Set())}>Todas</button>
              <button className="btn-subtle" style={{ padding: '2px 8px', fontSize: '0.68rem', borderRadius: 999 }} onClick={() => setLitoOff(new Set(meta.categorias.lito))}>Nenhuma</button>
              {meta.categorias.lito.map((n, id) => <Chip key={n} active={!litoOff.has(n)} color={categoryColor('lito', n, id)} label={categoryLabel('lito', n)} onClick={() => toggle(setLitoOff)(n)} />)}
            </div>
          </details>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'stretch' }}>
            <div style={{ flex: '1 1 640px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '4px 14px' }}>
                {stats3d && (
                  <>
                    <strong style={{ color: 'var(--text-main)' }}>{fmtInt(stats3d.n)} células</strong>
                    <span>{fmtMt(stats3d.mass)}</span>
                    <span>Fe: <strong style={{ color: '#ef4444' }}>{stats3d.g.FEGL != null ? fmtDec(stats3d.g.FEGL, 2) : '—'}%</strong></span>
                    <span>SiO₂: <strong style={{ color: '#f59e0b' }}>{stats3d.g.SIGL != null ? fmtDec(stats3d.g.SIGL, 2) : '—'}%</strong></span>
                    <span>P: {stats3d.g.PGL != null ? fmtDec(stats3d.g.PGL, 3) : '—'}%</span>
                    <span>Al₂O₃: {stats3d.g.ALGL != null ? fmtDec(stats3d.g.ALGL, 2) : '—'}%</span>
                  </>
                )}
              </div>
              <BlockModel3D
                cells={geom3d}
                colors={colors3d}
                visible={visible3d}
                vExag={vExag}
                selected={sel3d}
                onPick={(i) => { setSel3d(i); setSelMarker(-1); }}
                fitKey={fitKey}
                height={540}
                surface={surface}
                surfaceTexture={mosaic ? mosaic.canvas : null}
                surfaceOpacity={satOpacity}
                markers={markers}
                selectedMarker={selMarker}
                onPickMarker={(k) => { setSelMarker(k); setSel3d(-1); }}
                labels={labels3d}
              />
              <Legend legend={legend} />
              <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>
                Arraste para girar • botão direito/dois dedos para mover • roda para zoom • clique para inspecionar. Norte para o fundo da cena (bússola no canto).
                {res !== 'detail' && ' Estéril oculto por padrão; ative em “Tipo”.'}
              </div>
            </div>
            <div className="glass-panel" style={{ flex: '0 1 300px', minWidth: 260, borderRadius: 10, maxHeight: 640, overflowY: 'auto' }}>
              {markerInfo ? <InstrumentCard ins={markerInfo} terrainZ={markerTerrainZ} /> : <Inspector info={info3d} meta={meta} onFocusBench={focusBench} />}
            </div>
          </div>
        </div>
      )}

      {/* ===================== ABA PLANTA ===================== */}
      {tab === 'planta' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem' }}>
            <Grid size={14} style={{ color: '#10b981' }} />
            <span style={labelStyle}>Cota / Bancada:</span>
            <button className="btn-subtle" style={{ padding: '2px 8px', borderRadius: 6 }} onClick={() => { const i = benchList.indexOf(planZ); if (i > 0) setPlanZ(benchList[i - 1]); }}>◀</button>
            <select value={planZ ?? ''} onChange={(e) => setPlanZ(Number(e.target.value))} style={selectStyle}>
              {benchList.map((z) => <option key={z} value={z}>{z}–{z + 10} m</option>)}
            </select>
            <button className="btn-subtle" style={{ padding: '2px 8px', borderRadius: 6 }} onClick={() => { const i = benchList.indexOf(planZ); if (i < benchList.length - 1) setPlanZ(benchList[i + 1]); }}>▶</button>
            {statsPlan && (
              <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                {fmtInt(statsPlan.n)} blocos • {fmtMt(statsPlan.mass)} • Fe <strong style={{ color: '#ef4444' }}>{statsPlan.g.FEGL != null ? fmtDec(statsPlan.g.FEGL, 2) : '—'}%</strong> • SiO₂ <strong style={{ color: '#f59e0b' }}>{statsPlan.g.SIGL != null ? fmtDec(statsPlan.g.SIGL, 2) : '—'}%</strong>
              </span>
            )}
            <span style={{ ...labelStyle, opacity: 0.8 }}>(filtros de Tipo/Destino/Risco/Litologia da aba 3D também valem aqui)</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'stretch' }}>
            <div style={{ flex: '1 1 640px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {geomPlan ? (
                <BlockModelPlan
                  data={planData}
                  meta={meta}
                  colors={colorsPlan}
                  visible={visiblePlan}
                  selected={selPlan}
                  onPick={setSelPlan}
                  tipFor={(idx) => {
                    const ci = cellInfo(meta, planData, idx);
                    return (
                      <div>
                        <strong>{categoryLabel('lito', ci.cat.lito)}</strong> • {categoryLabel('tipo', ci.cat.tipo)} • {categoryLabel('destino', ci.cat.destino)}
                        <div style={{ color: '#94a3b8' }}>Fe {formatGrade('FEGL', ci.g.FEGL)}% • SiO₂ {formatGrade('SIGL', ci.g.SIGL)}% • {fmtInt(ci.massa)} t</div>
                      </div>
                    );
                  }}
                  height={540}
                />
              ) : (
                <div style={{ height: 540, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><Loader2 size={16} className="spin-animation" /></div>
              )}
              <Legend legend={legendPlan} />
            </div>
            <div className="glass-panel" style={{ flex: '0 1 300px', minWidth: 260, borderRadius: 10, maxHeight: 640, overflowY: 'auto' }}>
              <Inspector info={infoPlan} meta={meta} onFocusBench={focusBench} />
            </div>
          </div>
        </div>
      )}

      {/* ===================== ABA RESUMO ===================== */}
      {tab === 'resumo' && <SummaryTab meta={meta} dim={sumDim} setDim={setSumDim} />}

      {/* ===================== ABA ARQUIVO ===================== */}
      {tab === 'arquivo' && <FileTab meta={meta} />}
    </>
  );
};

// ---------------------------------------------------------------------------
// Aba Resumo
// ---------------------------------------------------------------------------
const SUM_DIMS = [
  ['lito', 'Litologia'], ['tipo', 'Tipo'], ['destino', 'Destino'], ['risco', 'Risco'], ['dm', 'Processo (DM)'],
  ['city', 'Município'], ['bench', 'Bancada'], ['tipo_destino', 'Tipo × Destino'], ['lito_tipo', 'Litologia × Tipo']
];
const SUM_COLS = ['FEGL', 'SIGL', 'PGL', 'ALGL', 'MNGL', 'PFGL', 'G1', 'G23', 'G4'];
const colLabel = (v) => `${GRADE_META[v].label} (%)`;

const SummaryTab = ({ meta, dim, setDim }) => {
  const total = meta.resumo.massa;
  const th = { padding: '4px 8px', textAlign: 'right', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border-medium)' };
  const td = { padding: '3px 8px', textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-main)', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border-subtle)' };

  let content;
  if (dim === 'bench') {
    const map = {};
    (meta.resumos.bench_tipo || []).forEach((r) => {
      const b = (map[r.bench] = map[r.bench] || { bench: r.bench, total: 0, min: 0, est: 0, fe: null, si: null });
      b.total += r.massa;
      if (r.tipo === 'minerio') { b.min += r.massa; b.fe = r.g.FEGL ?? null; b.si = r.g.SIGL ?? null; }
      if (r.tipo === 'esteril') b.est += r.massa;
    });
    const rows = Object.values(map).sort((a, b) => b.bench - a.bench);
    const max = Math.max(...rows.map((r) => r.total));
    content = (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>
          <th style={{ ...th, textAlign: 'left' }}>Bancada (cota)</th><th style={th}>Massa total (Mt)</th><th style={th}>Minério (Mt)</th>
          <th style={th}>Estéril (Mt)</th><th style={th}>Fe minério (%)</th><th style={th}>SiO₂ minério (%)</th><th style={{ ...th, textAlign: 'left', minWidth: 160 }}>Massa</th>
        </tr></thead>
        <tbody>
          {rows.map((r) => {
            const z0 = meta.origem.z + r.bench * meta.tamanhoPai.z;
            return (
              <tr key={r.bench}>
                <td style={{ ...td, textAlign: 'left', fontWeight: 700 }}>{z0}–{z0 + 10} m</td>
                <td style={td}>{fmtDec(r.total / 1e6, 2)}</td><td style={td}>{fmtDec(r.min / 1e6, 2)}</td><td style={td}>{fmtDec(r.est / 1e6, 2)}</td>
                <td style={td}>{r.fe != null ? fmtDec(r.fe, 2) : '—'}</td><td style={td}>{r.si != null ? fmtDec(r.si, 2) : '—'}</td>
                <td style={{ ...td, textAlign: 'left' }}><div style={{ height: 8, borderRadius: 4, width: `${(r.total / max) * 100}%`, background: 'var(--primary-accent)', minWidth: 2 }} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  } else {
    const rows = meta.resumos[dim] || [];
    const single = ['lito', 'tipo', 'destino', 'risco', 'dm', 'city'].includes(dim);
    const label = (r) => {
      if (single) return categoryLabel(dim, r[dim]);
      const [a, b] = dim.split('_');
      return `${categoryLabel(a, r[a])} ${dim === 'tipo_destino' ? '→' : '·'} ${categoryLabel(b, r[b])}`;
    };
    const color = (r) => (single ? categoryColor(dim, r[dim], meta.categorias[dim].indexOf(r[dim])) : null);
    content = (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>
          <th style={{ ...th, textAlign: 'left' }}>{SUM_DIMS.find((d) => d[0] === dim)[1]}</th>
          <th style={th}>Massa (Mt)</th><th style={th}>% massa</th><th style={th}>Vol (Mm³)</th><th style={th}>Dens.</th>
          {SUM_COLS.map((v) => <th key={v} style={th} title={gradeTitle(v)}>{colLabel(v)}</th>)}
          <th style={{ ...th, textAlign: 'left', minWidth: 120 }}>Massa</th>
        </tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={{ ...td, textAlign: 'left', fontWeight: 700 }} title={CODE_HINTS[r[dim]] || ''}>
                {color(r) && <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 3, backgroundColor: color(r), marginRight: 6 }} />}
                {label(r)}
              </td>
              <td style={td}>{fmtDec(r.massa / 1e6, 2)}</td>
              <td style={td}>{fmtDec((r.massa / total) * 100, 2)}</td>
              <td style={td}>{fmtDec(r.vol / 1e6, 2)}</td>
              <td style={td}>{r.dens != null ? fmtDec(r.dens, 2) : '—'}</td>
              {SUM_COLS.map((v) => <td key={v} style={td}>{r.g[v] != null ? formatGrade(v, r.g[v]) : '—'}</td>)}
              <td style={{ ...td, textAlign: 'left' }}><div style={{ height: 8, borderRadius: 4, width: `${Math.max((r.massa / rows[0].massa) * 100, 1)}%`, background: color(r) || 'var(--primary-accent)', minWidth: 2 }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="glass-panel" style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem' }}>
        <Table2 size={14} style={{ color: 'var(--primary-accent)' }} />
        <span style={labelStyle}>Agrupar por:</span>
        <div style={group}>
          {SUM_DIMS.map(([id, lb]) => <button key={id} style={pill(dim === id)} onClick={() => setDim(id)}>{lb}</button>)}
        </div>
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        Total do modelo: <strong style={{ color: 'var(--text-main)' }}>{fmtDec(meta.resumo.massa / 1e9, 3)} Gt</strong> • {fmtDec(meta.resumo.vol / 1e6, 1)} Mm³ •
        teores médios ponderados pela massa, considerando apenas blocos com valor válido (valores vazios, negativos ou &gt; 100% foram descartados).
      </div>
      <div style={{ overflowX: 'auto' }}>{content}</div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Aba Arquivo & campos
// ---------------------------------------------------------------------------
const FileTab = ({ meta }) => {
  const q = meta.qualidade?.camposIdenticos || {};
  const alerts = [];
  Object.entries(q).forEach(([k, v]) => {
    if (v.ambos > 0 && v.iguais / v.ambos > 0.99) {
      const [a, b] = k.split('=');
      alerts.push(`${a} é idêntico a ${b} em ${fmtDec((v.iguais / v.ambos) * 100, 1)}% dos blocos (${fmtInt(v.iguais)} registros). Verifique se a coluna ${a} foi preenchida corretamente no modelo.`);
    }
  });
  const over = meta.campos.filter((f) => f.estat && f.estat.acimaLimite > 0);
  if (over.length) {
    alerts.push(`Valores acima de 100% (ou 200% para FQGL) descartados nos cálculos: ${over.map((f) => `${f.nome} (${fmtInt(f.estat.acimaLimite)})`).join(', ')}.`);
  }
  const neg = meta.campos.filter((f) => f.estat && f.estat.negativos > 0);
  if (neg.length) alerts.push(`Valores negativos descartados: ${neg.map((f) => `${f.nome} (${fmtInt(f.estat.negativos)})`).join(', ')}.`);
  if (meta.densidadeZero) alerts.push(`${fmtInt(meta.densidadeZero)} registros (${fmtDec((meta.densidadeZero / meta.registros) * 100, 1)}%) com densidade zero: entram no volume, mas têm massa zero.`);
  alerts.push('Os valores sentinela (−1E+30, “sem valor”) foram tratados como vazios. Teores só existem para parte dos blocos (principalmente minério).');

  const th = { padding: '4px 8px', textAlign: 'left', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, borderBottom: '1px solid var(--border-medium)', whiteSpace: 'nowrap' };
  const td = { padding: '3px 8px', fontSize: '0.71rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-subtle)' };
  const fact = (k, v) => (
    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '3px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.74rem' }}>
      <span style={{ color: 'var(--text-muted)' }}>{k}</span><strong style={{ color: 'var(--text-main)', textAlign: 'right' }}>{v}</strong>
    </div>
  );
  const ext = meta.extensao;
  const subTotalVol = meta.subBlocos.reduce((s, x) => s + x.volM3, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
        <div className="glass-panel" style={card}>
          <div style={{ fontWeight: 800, fontSize: '0.78rem', marginBottom: 6, display: 'flex', gap: 6, alignItems: 'center' }}><Database size={14} /> Ficha do arquivo</div>
          {fact('Arquivo', meta.arquivo)}
          {fact('Tamanho', fmtBytes(meta.tamanhoBytes))}
          {fact('Gerado por', meta.criadoPor)}
          {fact('Registros (sub-blocos)', fmtInt(meta.registros))}
          {fact('Células-pai com dados', fmtInt(meta.celulasPai))}
          {fact('Campos', `${meta.campos.length} (${meta.palavrasPorRegistro} palavras = ${meta.bytesPorRegistro} bytes por registro)`)}
          {fact('Sistema de coordenadas', meta.crs)}
        </div>
        <div className="glass-panel" style={card}>
          <div style={{ fontWeight: 800, fontSize: '0.78rem', marginBottom: 6, display: 'flex', gap: 6, alignItems: 'center' }}><Box size={14} /> Geometria do modelo</div>
          {fact('Origem (E / N / cota)', `${fmtInt(meta.origem.x)} / ${fmtInt(meta.origem.y)} / ${fmtInt(meta.origem.z)}`)}
          {fact('Células-pai (NX × NY × NZ)', `${meta.dimensao.nx} × ${meta.dimensao.ny} × ${meta.dimensao.nz}`)}
          {fact('Bloco-pai', `${meta.tamanhoPai.x} × ${meta.tamanhoPai.y} × ${meta.tamanhoPai.z} m`)}
          {fact('Extensão com dados — E', `${fmtInt(ext.xmin)} – ${fmtInt(ext.xmax)}`)}
          {fact('Extensão com dados — N', `${fmtInt(ext.ymin)} – ${fmtInt(ext.ymax)}`)}
          {fact('Extensão com dados — cota', `${fmtInt(ext.zmin)} – ${fmtInt(ext.zmax)} m`)}
          {meta.subBlocos.map((s) => fact(`Sub-blocos ${s.tamanho} m`, `${fmtInt(s.n)} (${fmtDec((s.n / meta.registros) * 100, 1)}% dos registros • ${fmtDec((s.volM3 / subTotalVol) * 100, 1)}% do volume)`))}
        </div>
      </div>

      <div className="glass-panel" style={{ ...card, border: '1px solid rgba(245,158,11,0.5)' }}>
        <div style={{ fontWeight: 800, fontSize: '0.78rem', marginBottom: 6, display: 'flex', gap: 6, alignItems: 'center', color: '#f59e0b' }}>
          <AlertTriangle size={14} /> Qualidade dos dados detectada na leitura do arquivo
        </div>
        <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.73rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {alerts.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </div>

      <div className="glass-panel" style={{ ...card, overflowX: 'auto' }}>
        <div style={{ fontWeight: 800, fontSize: '0.78rem', marginBottom: 6 }}>Dicionário de campos ({meta.campos.length})</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={th}>Campo</th><th style={th}>Tipo</th><th style={th}>Descrição</th>
            <th style={{ ...th, textAlign: 'right' }}>Válidos</th><th style={{ ...th, textAlign: 'right' }}>Mín</th>
            <th style={{ ...th, textAlign: 'right' }}>Média</th><th style={{ ...th, textAlign: 'right' }}>Máx</th>
          </tr></thead>
          <tbody>
            {meta.campos.map((f) => {
              const e = f.estat;
              const r = { textAlign: 'right' };
              return (
                <tr key={f.nome}>
                  <td style={{ ...td, fontFamily: 'var(--font-mono, monospace)', fontWeight: 700 }}>{f.nome}</td>
                  <td style={td}>{f.constante ? 'constante' : f.tipo === 'A' ? `alfa (${f.comprimento})` : 'numérico'}</td>
                  <td style={td}>{describeField(f.nome)}{f.constante ? ` = ${fmtDec(f.valor, 0)}` : ''}</td>
                  <td style={{ ...td, ...r }}>{e ? `${fmtDec((e.validos / e.n) * 100, 1)}%` : f.tipo === 'A' ? `${meta.categorias[{ LITOLOGY: 'lito', TIPO: 'tipo', DESTINO: 'destino', RISCO: 'risco', DM: 'dm', CITY: 'city' }[f.nome]]?.length ?? '—'} valores` : '—'}</td>
                  <td style={{ ...td, ...r }}>{e && e.min != null ? fmtDec(e.min, Math.abs(e.min) < 1 ? 3 : 2) : '—'}</td>
                  <td style={{ ...td, ...r }}>{e && e.media != null ? fmtDec(e.media, Math.abs(e.media) < 1 ? 3 : 2) : '—'}</td>
                  <td style={{ ...td, ...r }}>{e && e.max != null ? fmtDec(e.max, Math.abs(e.max) < 1 ? 3 : 2) : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ marginTop: 6, fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          Estatísticas calculadas sobre os {fmtInt(meta.registros)} registros, ignorando valores vazios. As descrições dos campos são interpretações pelo nome da coluna: o .dm não traz dicionário de dados.
        </div>
      </div>
    </div>
  );
};

export default BlockModelRealPanel;
