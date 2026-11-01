// ============================================================================
// MDSync — Carregador do Modelo de Blocos (gerado por scripts/convert_dm_block_model.py)
//
//   public/data/block-model/<ID>/meta.json
//   public/data/block-model/<ID>/overview.bin.gz   (células agregadas 40x40x20 m)
//   public/data/block-model/<ID>/bench_<cota>.bin.gz (células-pai 10x10x10 m por bancada)
//
// Arquivos binários são colunares (struct-of-arrays) e comprimidos com gzip.
// ============================================================================

const cache = new Map();

function baseUrl(id) {
  const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || './';
  return `${base}data/block-model/${id}`;
}

export async function gunzip(buffer) {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('Este navegador não suporta DecompressionStream (necessário para abrir o modelo de blocos).');
  }
  const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).arrayBuffer();
}

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao carregar ${url} (HTTP ${res.status})`);
  return res.arrayBuffer();
}

function once(key, factory) {
  if (!cache.has(key)) {
    const p = factory().catch((err) => {
      cache.delete(key);
      throw err;
    });
    cache.set(key, p);
  }
  return cache.get(key);
}

// Decodifica colunas "nome:tipo" (u8 | u16) a partir de um buffer já descompactado.
export function decodeColumns(buffer, layout, n) {
  const cols = {};
  let off = 0;
  for (const spec of layout) {
    const [name, type] = spec.split(':');
    if (type === 'u16') {
      cols[name] = new Uint16Array(buffer.slice(off, off + n * 2));
      off += n * 2;
    } else if (type === 'u8') {
      cols[name] = new Uint8Array(buffer.slice(off, off + n));
      off += n;
    } else {
      throw new Error(`Tipo de coluna desconhecido: ${type}`);
    }
  }
  if (off !== buffer.byteLength) {
    throw new Error(`Layout do arquivo binário inconsistente (${off} != ${buffer.byteLength})`);
  }
  return cols;
}

const NULL16 = 65535;

function dequantize(raw, scale) {
  const out = new Float32Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    out[i] = raw[i] === NULL16 ? NaN : raw[i] / scale;
  }
  return out;
}

// Converte colunas brutas no formato usado pela interface
export function shapeCells(cols, meta, gradeVars, n, extra = {}) {
  const cat = {};
  meta.colunasCat.forEach((d) => {
    cat[d] = cols[d];
  });
  const g = {};
  gradeVars.forEach((v) => {
    g[v] = dequantize(cols[v], meta.escalaGrade[v]);
  });
  const dens = new Float32Array(n);
  for (let i = 0; i < n; i++) dens[i] = cols.dens50[i] / 50;
  return { n, cat, g, vol: cols.vol, dens, ...extra };
}

export function loadMeta(id) {
  return once(`${id}:meta`, async () => {
    const res = await fetch(`${baseUrl(id)}/meta.json`);
    if (!res.ok) throw new Error(`Modelo de blocos ${id} não encontrado (HTTP ${res.status})`);
    return res.json();
  });
}

export function loadBench(id, meta, k) {
  return once(`${id}:bench:${k}`, async () => {
    const info = meta.bancadas.find((b) => b.k === k);
    if (!info) throw new Error(`Bancada k=${k} inexistente`);
    const buf = await gunzip(await fetchBuffer(`${baseUrl(id)}/${info.file}`));
    const cols = decodeColumns(buf, meta.layoutBench, info.n);
    return shapeCells(cols, meta, meta.colunasGrade, info.n, {
      i: cols.i,
      j: cols.j,
      k,
      z0: info.z0,
      kind: 'detail'
    });
  });
}

export function loadOverview(id, meta) {
  return once(`${id}:overview`, async () => {
    const ov = meta.overview;
    const layout = [
      'ci:u16', 'cj:u16', 'ck:u16',
      ...meta.colunasCat.map((d) => `${d}:u8`),
      'vol:u16', 'dens50:u8',
      ...ov.colunasGrade.map((v) => `${v}:u16`)
    ];
    const buf = await gunzip(await fetchBuffer(`${baseUrl(id)}/${ov.arquivo}`));
    const cols = decodeColumns(buf, layout, ov.n);
    return shapeCells(cols, meta, ov.colunasGrade, ov.n, {
      i: cols.ci,
      j: cols.cj,
      k: cols.ck,
      kind: 'overview'
    });
  });
}

// Une várias bancadas (células-pai 10 m) em um único conjunto de dados
export function mergeBenches(benches) {
  if (benches.length === 1) {
    const b = benches[0];
    return { ...b, kk: new Uint8Array(b.n).fill(b.k) };
  }
  const n = benches.reduce((s, b) => s + b.n, 0);
  const first = benches[0];
  const out = {
    n,
    kind: 'detail',
    i: new Uint16Array(n),
    j: new Uint16Array(n),
    kk: new Uint8Array(n),
    vol: new Uint16Array(n),
    dens: new Float32Array(n),
    cat: {},
    g: {}
  };
  Object.keys(first.cat).forEach((d) => {
    out.cat[d] = new Uint8Array(n);
  });
  Object.keys(first.g).forEach((v) => {
    out.g[v] = new Float32Array(n);
  });
  let off = 0;
  benches.forEach((b) => {
    out.i.set(b.i, off);
    out.j.set(b.j, off);
    out.kk.fill(b.k, off, off + b.n);
    out.vol.set(b.vol, off);
    out.dens.set(b.dens, off);
    Object.keys(b.cat).forEach((d) => out.cat[d].set(b.cat[d], off));
    Object.keys(b.g).forEach((v) => out.g[v].set(b.g[v], off));
    off += b.n;
  });
  return out;
}

// Geometria (centro e tamanho em metros) de cada célula
export function cellGeometry(meta, data, index) {
  const { origem, tamanhoPai } = meta;
  if (data.kind === 'overview') {
    const { lx, ly, lz } = meta.overview;
    const sx = lx * tamanhoPai.x, sy = ly * tamanhoPai.y, sz = lz * tamanhoPai.z;
    return {
      e: origem.x + data.i[index] * sx + sx / 2,
      n: origem.y + data.j[index] * sy + sy / 2,
      z: origem.z + data.k[index] * sz + sz / 2,
      sx, sy, sz
    };
  }
  return {
    e: origem.x + data.i[index] * tamanhoPai.x + tamanhoPai.x / 2,
    n: origem.y + data.j[index] * tamanhoPai.y + tamanhoPai.y / 2,
    z: origem.z + data.kk[index] * tamanhoPai.z + tamanhoPai.z / 2,
    sx: tamanhoPai.x, sy: tamanhoPai.y, sz: tamanhoPai.z
  };
}
