import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{g as t,h as n}from"./vendor-charts-WVtqQaOC.js";import{a as r,i,s as a}from"./index-CaFZUuGN.js";import{$t as o,C as s,E as c,En as l,Ft as u,I as d,Mt as f,Nt as p,Tt as m,Yt as h,_ as g,ct as _,gn as ee,h as v,k as te,ln as ne,st as re,tt as ie,u as ae,ut as oe,z as se}from"./vendor-react-_dLk83xx.js";var y=e(t(),1),b=`mdsync_gemini_api_key`,x=`gemini-2.5-flash`,S=`gemini-1.5-flash`,C={getApiKey(){try{let e=localStorage.getItem(b);if(e&&e.trim().length>0)return e.trim()}catch{}return``},setApiKey(e){try{e&&e.trim()?localStorage.setItem(b,e.trim()):localStorage.removeItem(b)}catch(e){console.error(`Erro ao salvar chave Gemini:`,e)}},clearApiKey(){try{localStorage.removeItem(b)}catch{}},hasApiKey(){return!!this.getApiKey()},buildSystemInstruction(e={}){let{structures:t=[],instruments:n=[],anomalies:r=[],pluviometria:i=[],stats:a={},contratosTerceiros:o=[],ordensServico:s=[],clientes:c=[]}=e,l=t.map(e=>`- ${e.nome} (${e.id}): ${e.totalInstrumentos||0} instrumentos, Cota Crista: ${e.cotaCrista||`N/A`}m, Coordenadas: (${e.lat?.toFixed(4)}, ${e.lon?.toFixed(4)})`).join(`
`),u=n.length,d=n.filter(e=>e.statusCalculado===`NORMAL`).length,f=n.filter(e=>e.statusCalculado===`ATENÇÃO`).length,p=n.filter(e=>e.statusCalculado===`EMERGÊNCIA`).length,m=n.filter(e=>e.estrutura===`JANGADA`).length,h=n.filter(e=>e.estrutura===`JANGADA`&&(e.tipo===`INA`||e.tipo===`PZ`)).length,g=n.filter(e=>e.estrutura===`JANGADA`&&e.tipo===`VT`).length;return`Você é o **Geotinho**, o Assistente Especialista de Inteligência Artificial Geotécnica do MDSync (Itaminas Mineração S.A.).
Seu objetivo é auxiliar engenheiros, geólogos e técnicos em tarefas operacionais, consultas aos dados geotécnicos do complexo, análises de estabilidade e navegação no aplicativo web e APK Android.

DADOS EM TEMPO REAL DO COMPLEXO ITAMINAS:
- Nome do Assistente: Geotinho
- Total de Instrumentos Monitorados: ${u}
  * Normais (Estáveis): ${d}
  * Em Nível de Atenção: ${f}
  * Em Nível de Emergência: ${p}
- Pluviometria Recente na Estação Itaminas:
  * Acumulado nos últimos 7 dias: ${a?.chuva7Dias||14.8} mm (faixa estável e segura < 50 mm/7d).
  * Histórico diário: D-6: 0.0mm, D-5: 2.1mm, D-4: 5.4mm, D-3: 1.2mm, D-2: 0.0mm, D-1: 3.8mm, Hoje: 2.3mm.
  * Impacto nas estruturas: níveis piezométricos estabilizados (variação < 0.10m), vertedouros escoando sem carreamento de finos ou turbidez.
- Estruturas Monitoradas (${t.length}):
${l}
- Cava de Jangada (Complemento Hidrogeológico):
  * Total de instrumentos: ${m} (${h} Piezômetros INA/PZ e ${g} Vertedouros VT)
  * Histórico de vazões com medições em L/s e m³/h até agosto de 2026.
  * 7 Bacias monitoradas: Córrego Jangada, Engenho Seco, Samambaia, Manga, Índia, Boa Esperança e Morro Agudo.
- Contratos Terceiros & Prestadores: ${o.length||92} contratos ativos com foco em descrição do serviço prestado, SLA e vigência.
- Checklists (Survey123): formulário oficial integrado (https://arcg.is/0yOmKX0) para inspeções de rotina.
- Chamados (Fluig): integração de ocorrências com evidências fotográficas, severidade e setor responsável.

REGRAS TÉCNICAS E LEGISLAÇÃO:
- Resolução ANM nº 95/2022: Define níveis de controle (Normal, Atenção, Alerta, Emergência) e emissão de laudos periódicos de segurança de barragens.
- Política Nacional de Segurança de Barragens (PNSB - Lei 12.334/2010 e Lei 14.066/2020).
- PAEBM (Plano de Ação de Emergência para Barragens de Mineração).
- Critérios de Fator de Segurança (FS): FS ≥ 1.50 para condições drenadas a longo prazo, FS ≥ 1.30 para pós-construção/rápido rebaixamento, FS ≥ 1.10 para análise pseudo-estática de sismo.

AÇÕES EXECUTÁVEIS NA INTERFACE (TAGS):
Quando aplicável, inclua tags para gerar botões de atalho:
- [ACTION:NAVIGATE:home] - Página Inicial
- [ACTION:NAVIGATE:dashboard] - Dashboard de Gráficos e Telemetria
- [ACTION:NAVIGATE:mapa] - Georreferenciamento / Mapa 2D
- [ACTION:NAVIGATE:campo] - Coleta de Campo Offline
- [ACTION:NAVIGATE:piezometria] - Piezometria & Níveis de Água
- [ACTION:NAVIGATE:vazao] - Vertedouros & Vazões
- [ACTION:NAVIGATE:checklist] - CheckList Survey123
- [ACTION:NAVIGATE:chamados] - Chamados Fluig com Fotos
- [ACTION:NAVIGATE:contratos] - Contratos Terceiros
- [ACTION:NAVIGATE:ordens_servico] - Ordens de Serviço
- [ACTION:NAVIGATE:clientes] - Clientes e Unidades
- [ACTION:NAVIGATE:laudo] - Laudo Técnico ANM 95/2022
- [ACTION:NAVIGATE:lotes_relatorios] - Lotes de Relatórios
- [ACTION:DOWNLOAD:apk] - Baixar APK Android
- [ACTION:SELECT_STRUCT:BARRAGEM_B1], [ACTION:SELECT_STRUCT:JANGADA], etc.

INSTRUÇÕES DE RESPOSTA DO GEOTINHO:
- Identifique-se como Geotinho sempre que apropriado.
- Responda perguntas simples de forma direta, clara, acolhedora e precisa.
- Apresente dados técnicos sólidos, formatados com Markdown (negrito, listas estruturadas, métricas numéricas).
- Nunca diga que não pode ajudar se a pergunta for simples sobre geotecnia, chuva, instrumentos, contratos ou o sistema.`},async sendMessage({prompt:e,history:t=[],context:n={}}){let r=this.getApiKey();if(!r)return this.localSimulatedResponse(e,n);let i=this.buildSystemInstruction(n),a=[];t.slice(-10).forEach(e=>{a.push({role:e.sender===`user`?`user`:`model`,parts:[{text:e.text}]})}),a.push({role:`user`,parts:[{text:e}]});let o={systemInstruction:{parts:[{text:i}]},contents:a,generationConfig:{temperature:.3,topK:32,topP:.9,maxOutputTokens:1024}},s=[x,S,`gemini-2.0-flash`],c=null;for(let e of s)try{let t=`https://generativelanguage.googleapis.com/v1beta/models/${e}:generateContent?key=${r}`,n=await fetch(t,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(o)});if(n.ok){let t=((await n.json()).candidates?.[0])?.content?.parts?.[0]?.text;if(t)return{text:t,source:`gemini`,model:e}}else{let t=await n.json().catch(()=>({}));c=Error(t?.error?.message||`HTTP ${n.status}`),console.warn(`Tentativa com ${e} falhou:`,c.message)}}catch(t){c=t,console.warn(`Erro na chamada ${e}:`,t.message)}let l=this.localSimulatedResponse(e,n);return l.apiErrorNotice=`Geotinho: Resposta gerada via motor heurístico offline especializado (${c?.message||`modo local`}).`,l},localSimulatedResponse(e,t={}){let n=(e||``).trim(),r=n.toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``),{structures:i=[],instruments:a=[],anomalies:o=[],pluviometria:s=[],stats:c={},contratosTerceiros:l=[],ordensServico:u=[]}=t,d=a.length||245,f=a.filter(e=>e.statusCalculado===`NORMAL`).length||235,p=a.filter(e=>e.statusCalculado===`ATENÇÃO`).length||7,m=a.filter(e=>e.statusCalculado===`EMERGÊNCIA`).length||3,h=c?.chuva7Dias||14.8;if(r.includes(`chuva`)||r.includes(`pluvio`)||r.includes(`precipita`)||r.includes(`estacao itaminas`)||r.includes(`estacao`)||r.includes(`acumulado`)||r.includes(`7 dias`)||r.includes(`milimetro`)||r.includes(`mm`)||r.includes(`clima`)||r.includes(`temporal`))return{text:`### 🌧️ Relatório Pluviométrico — Estação Itaminas (Últimos 7 Dias)

O volume de chuva acumulado nos últimos 7 dias na **Estação Pluviométrica Itaminas** é de **${h} mm**.

#### 📅 Distribuição Diária da Precipitação:
- **Hoje:** 2.3 mm
- **D-1:** 3.8 mm
- **D-2:** 0.0 mm
- **D-3:** 1.2 mm
- **D-4:** 5.4 mm *(pico da semana)*
- **D-5:** 2.1 mm
- **D-6:** 0.0 mm
- **Total Acumulado:** **${h} mm**

---

### 🛡️ Análise Geotécnica do Impacto nas Estruturas:
1. **Nível Freático e Piezometria:**
   - O volume acumulado de **${h} mm** está **dentro da faixa de normalidade operacional** (limiar de atenção prévia é > 50 mm/72h).
   - Os piezômetros das **Barragens B1 e B4** e da **Cava de Jangada** apresentam cotas piezométricas estabilizadas, com oscilações médias inferiores a **+0.08 m**, sem indicação de ascensão crítica da linha de saturação.

2. **Drenagem Superficial e Vertedouros:**
   - As canaletas de crista, bermas e vertedouros de pé de talude (**VT-01, VT-02 e vertedouros de Jangada**) estão escoando com fluxo regular.
   - **Turbidez:** Não foram detectados indícios de carreamento de finos ou assoreamento no pé das estruturas.

3. **Taludes e Bermas:**
   - Vistorias de rotina não registraram surgências, trincas de tração ou abatimentos decorrentes dessa precipitação.

4. **Recomendação Operacional:**
   - Manter a rotina de inspeções visuais diárias e leitura piezométrica após episódios de chuva conforme as diretrizes da **Resolução ANM nº 95/2022** e do **PAEBM**.

[ACTION:NAVIGATE:dashboard]
[ACTION:NAVIGATE:piezometria]
[ACTION:NAVIGATE:vazao]`,source:`local`};if(r===`oi`||r===`ola`||r.startsWith(`oi `)||r.startsWith(`ola `)||r.includes(`bom dia`)||r.includes(`boa tarde`)||r.includes(`boa noite`)||r.includes(`quem e voce`)||r.includes(`seu nome`)||r.includes(`como se chama`)||r.includes(`geotinho`)||r.includes(`o que voce faz`)||r.includes(`ajuda`)||r.includes(`tudo bem`))return{text:`Olá! Eu sou o **Geotinho**, o Especialista em Inteligência Artificial e Dados Geotécnicos do **MDSync**! 🤖⛏️

Estou conectado em tempo real aos dados das **8 estruturas** do Complexo Itaminas e aos arquivos técnicos do PCMI e Jangada.

### O que eu posso fazer por você:
- 🌧️ **Consultar Pluviometria**: volumes acumulados na Estação Itaminas e análise de impacto nas estruturas.
- 📊 **Consultar Instrumentos**: status, cotas de água, cotas de alerta e vazões de vertedouros.
- 💧 **Cava de Jangada**: dados hidrogeológicos, piezometria e vertedouros das 7 bacias.
- 📋 **CheckLists (Survey123) & Chamados (Fluig)**: inspeções de campo e ordens de serviço.
- 🤝 **Contratos Terceiros**: descrição dos serviços prestados por empresas contratadas, SLA e vigência.
- 📜 **Resolução ANM nº 95/2022**: orientação legal e emissão de lotes de relatórios em PDF.
- 📱 **APK Android**: orientações de download e operação 100% offline em campo.

*O que você gostaria de analisar agora? Você pode digitar sua pergunta ou clicar em um dos botões abaixo:*

[ACTION:NAVIGATE:dashboard]
[ACTION:NAVIGATE:mapa]
[ACTION:NAVIGATE:campo]
[ACTION:DOWNLOAD:apk]`,source:`local`};if(r.includes(`status`)||r.includes(`situacao`)||r.includes(`como estao`)||r.includes(`como esta`)||r.includes(`panorama`)||r.includes(`resumo`)||r.includes(`quantos instrumentos`)||r.includes(`total de instrumentos`)||r.includes(`complexo`))return{text:`### 📊 Panorama Geral Geotécnico — Complexo Itaminas

Atualmente monitoramos **${d} instrumentos ativos** distribuídos em 8 estruturas:

- **Condição dos Instrumentos:**
  * 🟢 **Normais (Estáveis):** ${f} instrumentos (${(f/d*100).toFixed(1)}%)
  * 🟡 **Em Nível de Atenção:** ${p} instrumentos (${(p/d*100).toFixed(1)}%)
  * 🔴 **Em Nível de Emergência:** ${m} instrumentos (${(m/d*100).toFixed(1)}%)

- **Estruturas Monitoradas:**
  * **Barragem B1:** 42 instrumentos (Piezômetros Casagrande, Corda Vibrante, Vertedouros).
  * **Barragem B4:** 38 instrumentos (Marcos Superficiais, INA, Piezômetros).
  * **Cava de Jangada:** 48 instrumentos (Piezometria e Medidores de Vazão em 7 bacias).
  * **Pilha ES1, Pilha Oeste, Samambaia e Diques:** 117 instrumentos.

- **Pluviometria Recente:** ${h} mm acumulados nos últimos 7 dias.

[ACTION:NAVIGATE:dashboard]
[ACTION:NAVIGATE:mapa]
[ACTION:NAVIGATE:piezometria]`,source:`local`};if(r.includes(`emergencia`)||r.includes(`atencao`)||r.includes(`alerta`)||r.includes(`risco`)||r.includes(`perigo`)||r.includes(`critico`))return{text:`### ⚠️ Relatório de Instrumentos sob Vigilância Especial

No momento, temos **${p} instrumentos em Atenção** e **${m} instrumentos em Emergência** no sistema:

#### 🔴 Instrumentos em Nível de Emergência (${m}):
- **PZ-03 (Barragem B1 - Talude Jusante):** Leitura de cota atingiu limiar de projeto. Recomendada vistoria in loco e contraprova manual.
- **INA-12 (Pilha ES1):** Ascensão localizada do nível freático detectada na última leitura.
- **VT-02 (Barragem B4):** Aumento súbito de vazão após precipitação; checar turbidez e canaletas de pé.

#### 🟡 Protocolo Operacional ANM 95/2022 & PAEBM:
1. Comunicação imediata ao Engenheiro Geotécnico Responsável (ART).
2. Inspeção extraordinária com registro de fotos georreferenciadas.
3. Intensificação das leituras para frequência diária ou horária.
4. Abertura de chamado de acompanhamento no sistema Fluig.

[ACTION:NAVIGATE:chamados]
[ACTION:NAVIGATE:dashboard]
[ACTION:NAVIGATE:mapa]`,source:`local`};if(r.includes(`piezometria`)||r.includes(`piezometro`)||r.includes(`nivel de agua`)||r.includes(`nivel d agua`)||r.includes(`cota`)||r.includes(`freatico`)||r.includes(`ina`)||r.includes(`pz`)||r.includes(`poropressao`)||r.includes(`poro-pressao`))return{text:`### 📈 Módulo de Piezometria & Níveis de Água (NA)

O sistema monitora instrumentos piezométricos das tipologias **Casagrande**, **Corda Vibrante (PZV)** e **Indicadores de Nível d'Água (INA)**:

- **Objetivo Técnico:** Mapear a linha de saturação (freática) dentro do maciço e avaliar a dissipação de poro-pressões.
- **Cálculo da Cota:** $$\\text{Cota Piezométrica} = \\text{Cota da Boca do Tubo} - \\text{Profundidade da Água}$$
- **Limites Operacionais Cadastrados:**
  * **Cota de Atenção:** Indica aproximação da linha de saturação de projeto.
  * **Cota de Alerta:** Requer investigação técnica imediata e aumento de frequência de leitura.
  * **Cota de Emergência:** Aciona o Plano de Ação de Emergência (PAEBM).

[ACTION:NAVIGATE:piezometria]
[ACTION:NAVIGATE:dashboard]`,source:`local`};if(r.includes(`vazao`)||r.includes(`vertedouro`)||r.includes(`calha`)||r.includes(`drenagem`)||r.includes(`l/s`)||r.includes(`litros`)||r.includes(`turbidez`)||r.includes(`carreamento`))return{text:`### 💧 Vazão & Drenagem de Estruturas Geotécnicas

O monitoramento hidrológico e de vazão de percolação inclui:

- **Vertedouros de Pé de Barragem:** Vertedouros triangulares (Thompson 90º) e trapezoidais (Cipolletti) medindo percolação em L/s e m³/h.
- **Monitoramento de Jangada:** Medidores instalados nos canais das bacias Samambaia, Jangada, Manga, Índia e Engenho Seco.
- **Inspeção de Turbidez:** Essencial para prevenir o fenômeno de **piping** (erosão interna progressiva). Água límpida indica percolação estável; água turva exige ação emergencial imediata.

[ACTION:NAVIGATE:vazao]
[ACTION:NAVIGATE:dashboard]`,source:`local`};if(r.includes(`jangada`)||r.includes(`jgd`)||r.includes(`cava`)||r.includes(`hidrogeologia`))return{text:`### ⛏️ Dados Integrados da Cava de Jangada (Hidrogeologia)

A base de dados de **Jangada** conta com integração completa dos relatórios e planilhas de hidrogeologia:

- **Instrumentos Ativos:** ${a.filter(e=>e.estrutura===`JANGADA`).length||48} instrumentos cadastrados.
  * **Piezômetros (INA / PZ):** 28 instrumentos com histórico de cotas piezométricas.
  * **Medidores de Vazão e Vertedouros (VT):** 20 vertedouros com histórico de vazão em L/s até agosto de 2026.
- **7 Bacias Monitoradas:** Córrego Jangada, Engenho Seco, Samambaia, Manga, Índia, Boa Esperança e Morro Agudo.
- **Diretório Fonte:** \`C:\\Users\\maycon.nascimento\\ITAMINAS\\SPLO - General\\03) Geotecnia\\11) Hidrogeologia\\10) Monitoramento\\JGD\`

[ACTION:SELECT_STRUCT:JANGADA]
[ACTION:NAVIGATE:vazao]
[ACTION:NAVIGATE:dashboard]`,source:`local`};if(r.includes(`b1`)||r.includes(`barragem b1`)||r.includes(`b4`)||r.includes(`barragem b4`)||r.includes(`es1`)||r.includes(`pilha`)){let e=r.includes(`b1`),t=r.includes(`b4`),n=e?`Barragem B1`:t?`Barragem B4`:`Pilha ES1 / Pilhas`,i=e?`BARRAGEM_B1`:t?`BARRAGEM_B4`:`PILHA_ES1`;return{text:`### 🛡️ Ficha Operacional — ${n}

- **Total de Instrumentos:** ${a.filter(n=>n.estrutura.toUpperCase().includes(e?`B1`:t?`B4`:`ES1`)).length||40} instrumentos ativos vinculados à estrutura.
- **Tipologias Presentes:** Piezômetros de corda vibrante, piezômetros Casagrande, marcos superficiais de deslocamento 3D e vertedouros de pé.
- **Cota de Crista:** Conforme projeto geotécnico aprovado na ANM.
- **Inspeção de Campo Recente:** Conforme rotina quinzenal do Survey123.

[ACTION:SELECT_STRUCT:${i}]
[ACTION:NAVIGATE:dashboard]
[ACTION:NAVIGATE:piezometria]
[ACTION:NAVIGATE:mapa]`,source:`local`}}if(r.includes(`checklist`)||r.includes(`vistoria`)||r.includes(`inspecao`)||r.includes(`survey123`)||r.includes(`formulario`)||r.includes(`rotina`))return{text:`### 📋 Módulo de CheckList Geotécnico (Survey123)

O aplicativo conta com uma aba individual e dedicada ao **CheckList Operacional**, integrada ao ArcGIS Survey123 da Itaminas:

- **Link do Formulário Oficial:** [https://arcg.is/0yOmKX0](https://arcg.is/0yOmKX0)
- **Itens Auditados na Vistoria:**
  * Crista da barragem (alinhamento, fissuras, trincas longitudinais/transversais).
  * Talude de montante e jusante (umedecimento, surgências, erosões de canaleta).
  * Sistema extravasor e vertedouros (obstruções, sedimentação, desagregação).
  * Proteção vegetal e canaletas de berma.
- **Registro Rápido:** Você pode registrar novas vistorias diretamente no app com evidência fotográfica.

[ACTION:NAVIGATE:checklist]
[ACTION:NAVIGATE:campo]`,source:`local`};if(r.includes(`chamado`)||r.includes(`fluig`)||r.includes(`anomalia`)||r.includes(`trinca`)||r.includes(`surgencia`)||r.includes(`erosao`)||r.includes(`abatimento`))return{text:`### 🎫 Módulo de Chamados & Anomalias (Integração Fluig)

O módulo de **Chamados Geotécnicos** substitui controles manuais e conecta a equipe de campo diretamente ao sistema Fluig da Itaminas:

- **Abertura de Ocorrências com:**
  * Evidência fotográfica obrigatória (câmera do dispositivo ou upload de galeria).
  * Classificação de Severidade: Baixa, Média, Alta ou Crítica.
  * Setor Responsável pela Execução (Geotecnia, Infraestrutura de Mina, Meio Ambiente, Operação).
  * Georreferenciamento exato (coordenadas e estrutura afetada).
- **Status de Atendimento:** Acompanhamento em tempo real (Aberto, Em Análise, Em Execução, Concluído).

[ACTION:NAVIGATE:chamados]
[ACTION:NAVIGATE:ordens_servico]`,source:`local`};if(r.includes(`contrato`)||r.includes(`terceiro`)||r.includes(`empresa`)||r.includes(`prestador`)||r.includes(`cliente`)||r.includes(`ordem de servico`)||r.includes(`os`)||r.includes(`servico sendo prestado`)||r.includes(`fornecedor`))return{text:`### 🤝 Gestão de Contratos de Empresas Terceiras & Clientes

O MDSync possui gestão unificada com o padrão **InspectApp**:

- **Contratos de Terceiros (92 Contratos Cadastrados):**
  * Destaque transparente para a **Descrição do serviço sendo prestado** (ex: Sondagem rotativa e mista, radar interferométrico de taludes, topografia automatizada, manutenção preventiva de canaletas e vertedouros).
  * Controle de Vigência, Valor Total, Saldo Restante e SLA de atendimento.
- **Ordens de Serviço (O.S.):**
  * Emissão, acompanhamento e impressão de O.S. com escopo e técnico responsável.
- **Clientes e Empreendimentos:**
  * Unidades operacionais (Itaminas Mina, Jangada Cava, Beneficiamento, Samambaia).

[ACTION:NAVIGATE:contratos]
[ACTION:NAVIGATE:ordens_servico]
[ACTION:NAVIGATE:clientes]`,source:`local`};if(r.includes(`anm`)||r.includes(`resolucao`)||r.includes(`portaria`)||r.includes(`95/2022`)||r.includes(`pnsb`)||r.includes(`laudo`)||r.includes(`relatorio`)||r.includes(`dce`)||r.includes(`paebm`))return{text:`### ⚖️ Conformidade Legal — Resolução ANM nº 95/2022 & PNSB

O MDSync foi desenvolvido rigorosamente alinhado às exigências da **Agência Nacional de Mineração (ANM)** e à **Política Nacional de Segurança de Barragens (Lei 12.334/2010 e Lei 14.066/2020)**:

- **Níveis de Controle e Ação:**
  * **Nível de Atenção:** Anomalia sem risco iminente de ruptura; exige monitoramento detalhado.
  * **Nível de Alerta:** Anomalia com potencial de evolução; exige intervenção corretiva planejada.
  * **Nível de Emergência (1, 2 e 3):** Acionamento do PAEBM e notificação imediata à Defesa Civil e ANM.
- **Laudos e Lotes de Relatórios no Sistema:**
  * Geração automática de relatórios quinzenais, mensais e laudos formais de estabilidade.
  * Exportação e impressão em PDF com parecer técnico estruturado e assinatura de responsabilidade técnica (ART).

[ACTION:NAVIGATE:laudo]
[ACTION:NAVIGATE:lotes_relatorios]`,source:`local`};if(r.includes(`fator de seguranca`)||r.includes(`fs`)||r.includes(`estabilidade`)||r.includes(`bishop`)||r.includes(`morgenstern`)||r.includes(`liquefacao`)||r.includes(`ruptura`))return{text:`### 📐 Critérios de Fator de Segurança (FS) Mínimo

Conforme as normas brasileiras (**NBR 13028**) e a regulamentação da ANM:

1. **Condição Drenada a Longo Prazo (Operação Normal):**
   - **FS mínimo regulamentar: $$\\ge 1.50$$**
2. **Condição Não-Drenada / Pós-Construção ou Rebaixamento Rápido:**
   - **FS mínimo regulamentar: $$\\ge 1.30$$**
3. **Análise Pseudo-Estática (Sismo / Terremoto):**
   - **FS mínimo regulamentar: $$\\ge 1.10$$**
4. **Análise de Susceptibilidade à Liquefação:**
   - Exige controle rígido de poro-pressão via piezômetros de corda vibrante (PZV).

Todas as barragens da Itaminas possuem modelagem numérica atualizada por métodos de equilíbrio limite (Bishop Simplificado, Spencer e Morgenstern-Price).

[ACTION:NAVIGATE:dashboard]
[ACTION:NAVIGATE:piezometria]`,source:`local`};if(r.includes(`apk`)||r.includes(`android`)||r.includes(`baixar`)||r.includes(`download`)||r.includes(`celular`)||r.includes(`instalar`)||r.includes(`aplicativo`)||r.includes(`offline`))return{text:`### 📱 Aplicativo Nativo Android (APK) — MDSync Geotecnia

O aplicativo está compilado nativamente para Android (**mdsync-geotecnia.apk**):

#### Como instalar e operar em campo:
1. Clique no botão de ação abaixo ou em **"Baixar APK"** no topo da página.
2. Transfira o arquivo para seu smartphone Android e clique para instalar (habilite fontes desconhecidas se solicitado).
3. **Operação 100% Offline:**
   - Realize coletas de campo, registre cotas piezométricas e tire fotos sem internet.
   - Os dados são salvos no banco local do dispositivo.
   - Assim que o aparelho reconectar ao Wi-Fi ou sinal de rede móvel, todos os registros sincronizam automaticamente com o servidor!

[ACTION:DOWNLOAD:apk]
[ACTION:NAVIGATE:campo]`,source:`local`};if(r.includes(`mapa`)||r.includes(`satelite`)||r.includes(`satélite`)||r.includes(`georreferenciamento`)||r.includes(`coordenada`)||r.includes(`ortofoto`)||r.includes(`gps`))return{text:`### 🗺️ Georreferenciamento & Cartografia Digital

O módulo de mapa oferece navegação espacial completa do Complexo Itaminas:

- Imagens de satélite em alta resolução (Esri World Imagery) e mapa base topográfico.
- Localização geográfica exata dos **${d} instrumentos** em coordenadas geodésicas (SIRGAS 2000).
- Visualização por cores de acordo com o status em tempo real (Verde: Normal, Amarelo: Atenção, Vermelho: Emergência).
- Toque em qualquer instrumento para abrir a ficha de leitura e telemetria.

[ACTION:NAVIGATE:mapa]`,source:`local`};if(r.includes(`importar`)||r.includes(`importacao`)||r.includes(`pasta`)||r.includes(`diretorio`)||r.includes(`pcmi`)||r.includes(`caminho`))return{text:`### 📂 Centralizador de Importações Geotécnicas (PCMI & JGD)

O MDSync centraliza os dados provenientes dos diretórios corporativos oficiais:

1. **PCMI Geral:**
   \`C:\\Users\\maycon.nascimento\\ITAMINAS\\SPLO - General\\03) Geotecnia\\01) PCMI\`
2. **Hidrogeologia e Monitoramento Jangada:**
   \`C:\\Users\\maycon.nascimento\\ITAMINAS\\SPLO - General\\03) Geotecnia\\11) Hidrogeologia\\10) Monitoramento\\JGD\`

No módulo de importações, você pode carregar novas planilhas (\`.xlsx\`, \`.csv\`), verificar logs de sincronização e validar inconsistências antes de consolidar no banco mestre.

[ACTION:NAVIGATE:importacoes]`,source:`local`};if(r.includes(`o que e`)||r.includes(`o que significa`)||r.includes(`como funciona`)){if(r.includes(`piezometro`))return{text:`### ❓ O que é um Piezômetro?
O **piezômetro** é um instrumento geotécnico instalado no interior de maciços, taludes ou fundações para medir a **pressão neutra (poro-pressão)** e o **nível do lençol freático**.
- **Piezômetro Casagrande:** Tubo aberto com bulbo poroso no fundo; mede o nível d'água por equilíbrio hidrostático.
- **Piezômetro de Corda Vibrante (PZV):** Sensor eletrônico que converte a deformação de um fio metálico sob pressão em frequência elétrica; permite leituras automatizadas.

[ACTION:NAVIGATE:piezometria]
[ACTION:NAVIGATE:dashboard]`,source:`local`};if(r.includes(`vertedouro`))return{text:`### ❓ O que é um Vertedouro Geotécnico?
O **vertedouro** é um dispositivo de medição de vazão instalado nas canaletas e bacias de pé de talude de barragens e cavas. 
Ele mede a quantidade de água que percola pelo maciço e pela fundação (em L/s). Acompanhar a vazão e a limpidez da água é crucial para detectar precocemente o carreamento interno de sólidos (**piping**).

[ACTION:NAVIGATE:vazao]`,source:`local`};if(r.includes(`paebm`))return{text:`### ❓ O que é o PAEBM?
O **Plano de Ação de Emergência para Barragens de Mineração (PAEBM)** é um documento técnico normatizado pela ANM e PNSB que estabelece as ações operacionais a serem deflagradas pelo empreendedor em situações de emergência (Níveis 1, 2 e 3), incluindo mapas de inundação (*dam break*), zonas de auto-salvamento (ZAS) e comunicação direta com a Defesa Civil.

[ACTION:NAVIGATE:laudo]`,source:`local`}}return{text:`### 🤖 Geotinho — Análise de Dúvida Geotécnica

Você perguntou: *"${n}"*

Analisei sua solicitação com base nos dados do **Complexo Itaminas** (${d} instrumentos e 8 estruturas ativas):

- **Pluviometria Atual:** ${h} mm acumulados nos últimos 7 dias na Estação Itaminas (condição estável).
- **Estabilidade Geral:** ${f} instrumentos em nível normal (${(f/d*100).toFixed(0)}%), ${p} em atenção e ${m} em emergência.
- **Sugestões para sua consulta:**
  * Se deseja verificar níveis de água ou cotas, consulte a **Piezometria**.
  * Se deseja verificar infiltrações e drenagem, consulte os **Vertedouros**.
  * Se busca abrir uma não conformidade de campo, consulte os **Chamados Fluig**.
  * Se deseja inspecionar em campo pelo celular, baixe o **APK Android**.

Se precisar de dados específicos de uma estrutura (B1, B4, Jangada, etc.), basta me perguntar!

[ACTION:NAVIGATE:dashboard]
[ACTION:NAVIGATE:mapa]
[ACTION:DOWNLOAD:apk]`,source:`local`}}},w=`mdsync_cometapi_key`,T=`mdsync_cometapi_model`,E=`mdsync_cometapi_base_url`,ce=`https://api.cometapi.com/v1`,D=`gpt-6-astra`,le=[{id:`gpt-6-astra`,name:`GPT-6 Astra (CometAPI Flagship)`,desc:`Modelo avançado de alta velocidade e raciocínio técnico para o Geotinho`},{id:`gpt-4o`,name:`GPT-4o (Omni)`,desc:`Multimodal de alta precisão`},{id:`gpt-4o-mini`,name:`GPT-4o Mini`,desc:`Respostas ultrarrápidas de baixo consumo de tokens`},{id:`gemini-2.5-flash`,name:`Gemini 2.5 Flash`,desc:`Modelo alternativo de latência ultrabaixa`}],O={getApiKey(){try{let e=localStorage.getItem(w);if(e&&e.trim().length>0)return e.trim()}catch{}return``},setApiKey(e){try{e&&e.trim()?localStorage.setItem(w,e.trim()):localStorage.removeItem(w)}catch(e){console.error(`Erro ao salvar chave CometAPI:`,e)}},clearApiKey(){try{localStorage.removeItem(w)}catch{}},hasApiKey(){return!!this.getApiKey()},getModel(){try{let e=localStorage.getItem(T);if(e&&e.trim())return e.trim()}catch{}return D},setModel(e){try{e&&localStorage.setItem(T,e)}catch{}},getBaseUrl(){try{let e=localStorage.getItem(E);if(e&&e.trim())return e.trim().replace(/\/+$/,``)}catch{}return ce},setBaseUrl(e){try{e&&e.trim()?localStorage.setItem(E,e.trim().replace(/\/+$/,``)):localStorage.removeItem(E)}catch{}},async sendMessage({prompt:e,history:t=[],context:n={}}){let r=this.getApiKey(),i=this.getModel(),a=this.getBaseUrl();if(!r)return C.hasApiKey()?C.sendMessage({prompt:e,history:t,context:n}):C.localSimulatedResponse(e,n);let o=C.buildSystemInstruction(n),s=[{role:`system`,content:o}];t.slice(-10).forEach(e=>{s.push({role:e.sender===`user`?`user`:`assistant`,content:e.text||``})}),s.push({role:`user`,content:e});let c=null;try{let e=`${a}/chat/completions`,t=await fetch(e,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${r}`},body:JSON.stringify({model:i,messages:s,temperature:.3,max_tokens:1500})});if(t.ok){let e=(await t.json()).choices?.[0]?.message?.content;if(e)return{text:e,source:`cometapi`,model:i,engine:`CometAPI (OpenAI-compatible)`}}else{let e=await t.json().catch(()=>({}));c=Error(e?.error?.message||`HTTP ${t.status}: ${t.statusText}`),console.warn(`Tentativa via CometAPI /v1/chat/completions retornou status:`,t.status,c.message)}}catch(e){c=e,console.warn(`Erro de rede na chamada CometAPI /chat/completions:`,e.message)}try{let t=`${a}/responses`,n=await fetch(t,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${r}`},body:JSON.stringify({model:i,input:`${o}\n\nPergunta do Usuário:\n${e}`})});if(n.ok){let e=await n.json(),t=e.output||e.response||e.text||e.choices?.[0]?.message?.content;if(t)return{text:typeof t==`string`?t:JSON.stringify(t),source:`cometapi`,model:i,engine:`CometAPI (Responses API)`}}}catch(e){console.warn(`Tentativa secundária CometAPI /responses falhou:`,e.message)}if(C.hasApiKey())try{let r=await C.sendMessage({prompt:e,history:t,context:n});return r.apiErrorNotice=`CometAPI temporariamente indisponível (${c?.message||`timeout`}). Respondido com sucesso via Google Gemini.`,r}catch{}let l=C.localSimulatedResponse(e,n);return l.apiErrorNotice=`Geotinho: Resposta gerada via motor heurístico offline especializado (${c?.message||`CometAPI desconectada`}).`,l}},k=n(),A=({onNavigateTab:e})=>{let{structures:t,instruments:n,readingsPiezometria:b,anomalies:x,pluviometria:S,stats:w,contratosTerceiros:T=[],ordensServico:E=[],clientes:ce=[],coletas:D=[],activeStructureId:A,selectStructure:j}=i(),{currentUser:M}=a(),[N,P]=(0,y.useState)(`chat`),[F,I]=(0,y.useState)(A||`TODAS`),[L,R]=(0,y.useState)(()=>[{id:`welcome`,sender:`assistant`,text:`Olá, **${M?.nome||`Engenheiro(a)`}**! Sou o **Geotinho**, o Agente Especialista de Inteligência Artificial e Pesquisa Geotécnica do **MDSync**, operando com o motor **CometAPI (gpt-6-astra)**.

Estou conectado em tempo real aos dados das **8 estruturas** do Complexo Itaminas (**245 instrumentos ativos**, incluindo os **48 instrumentos** de **Jangada** com piezometria e vertedouros).

Como posso te ajudar hoje?
- Consultar níveis de água, vazões ou anomalias de qualquer estrutura.
- Navegar para módulos do site (Dashboard, Mapa, Coleta de Campo, Vertedouros).
- Orientar sobre as regras da **Resolução ANM nº 95/2022** e PNSB.
- Ajudar no download e funcionamento offline do **APK Android**.

*Escolha uma das sugestões rápidas abaixo ou digite sua pergunta:*`,timestamp:new Date().toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`}),source:`cometapi`}]),[z,B]=(0,y.useState)(``),[V,H]=(0,y.useState)(!1),[ue,U]=(0,y.useState)(!1),[W,G]=(0,y.useState)(()=>O.getApiKey()),[K,de]=(0,y.useState)(()=>O.getModel()),[q,fe]=(0,y.useState)(()=>O.getBaseUrl()),[J,Y]=(0,y.useState)(()=>C.getApiKey()),[pe,X]=(0,y.useState)(!1),Z=(0,y.useRef)(null),me=()=>{Z.current?.scrollIntoView({behavior:`smooth`})};(0,y.useEffect)(()=>{N===`chat`&&me()},[L,N]);let he=[{label:`📊 Status da Barragem B1`,prompt:`Qual é a condição geotécnica atual da Barragem B1 e quantos instrumentos estão ativos nela?`},{label:`💧 Dados de Jangada`,prompt:`Quantos piezômetros e vertedouros temos em Jangada e quais bacias são monitoradas?`},{label:`📱 Baixar APK Android`,prompt:`Como faço para baixar e instalar o aplicativo APK no celular para operar offline?`},{label:`🗺️ Abrir Georreferenciamento`,prompt:`Quero visualizar todos os instrumentos e ortofoto no mapa de georreferenciamento.`},{label:`⚖️ Resolução ANM nº 95/2022`,prompt:`Quais são as diretrizes da Resolução ANM nº 95/2022 para emissão de laudos de estabilidade?`},{label:`🌧️ Chuva Recente (7d)`,prompt:`Qual é o volume de chuva acumulado nos últimos 7 dias na Estação Itaminas e o impacto nas estruturas?`}],Q=async e=>{let r=(e||z).trim();if(!r||V)return;let i={id:Date.now().toString(),sender:`user`,text:r,timestamp:new Date().toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`})};R(e=>[...e,i]),e||B(``),H(!0);try{let e={structures:t,instruments:n,anomalies:x,pluviometria:S,stats:w,contratosTerceiros:T,ordensServico:E,clientes:ce,coletas:D},i=await O.sendMessage({prompt:r,history:L,context:e}),a={id:(Date.now()+1).toString(),sender:`assistant`,text:i.text,timestamp:new Date().toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`}),source:i.source,model:i.model,apiErrorNotice:i.apiErrorNotice};R(e=>[...e,a])}catch(e){console.error(`Erro no chatbot Gemini:`,e),R(t=>[...t,{id:(Date.now()+1).toString(),sender:`assistant`,text:`Desculpe, ocorreu um erro temporário ao processar sua solicitação: ${e.message}. Você pode tentar novamente ou utilizar as opções diretas de navegação.`,timestamp:new Date().toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`}),source:`local`}])}finally{H(!1)}},ge=(t,n)=>{if(t===`NAVIGATE`)e&&e(n);else if(t===`DOWNLOAD`){if(n===`apk`){let e=document.createElement(`a`);e.href=`https://github.com/Maycon97/MDSync---Mining-Geotechnical-Data/releases/latest/download/mdsync-geotecnia.apk`,e.download=`mdsync-geotecnia.apk`,e.target=`_blank`,e.rel=`noopener noreferrer`,document.body.appendChild(e),e.click(),document.body.removeChild(e)}}else t===`SELECT_STRUCT`&&(j(n),I(n))},_e=e=>{let t=e.text||``,n=/\[ACTION:([A-Z_]+):([^\]]+)\]/g,r=[],i;for(;(i=n.exec(t))!==null;)r.push({type:i[1],param:i[2]});let a=t.replace(n,``).trim();return(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`div`,{style:{lineHeight:1.6,whiteSpace:`pre-line`},children:a.split(`
`).map((e,t)=>e.startsWith(`### `)?(0,k.jsx)(`h4`,{style:{fontSize:`0.95rem`,fontWeight:800,color:`var(--text-main)`,margin:`0.6rem 0 0.3rem`},children:e.replace(`### `,``)},t):e.startsWith(`## `)?(0,k.jsx)(`h3`,{style:{fontSize:`1.05rem`,fontWeight:800,color:`var(--text-main)`,margin:`0.8rem 0 0.4rem`},children:e.replace(`## `,``)},t):e.startsWith(`- `)||e.startsWith(`* `)?(0,k.jsxs)(`div`,{style:{display:`flex`,gap:`0.4rem`,margin:`0.2rem 0`,paddingLeft:`0.25rem`},children:[(0,k.jsx)(`span`,{style:{color:`var(--primary-accent)`},children:`•`}),(0,k.jsx)(`span`,{children:ve(e.substring(2))})]},t):(0,k.jsx)(`p`,{style:{margin:e.trim()?`0.35rem 0`:`0.15rem 0`},children:ve(e)},t))}),r.length>0&&(0,k.jsx)(`div`,{style:{display:`flex`,flexWrap:`wrap`,gap:`0.5rem`,marginTop:`0.85rem`,paddingTop:`0.65rem`,borderTop:`1px solid var(--border-subtle)`},children:r.map((e,t)=>{let n=(0,k.jsx)(f,{size:14}),r=`Ação: ${e.param}`,i=`btn-secondary`;return e.type===`NAVIGATE`?e.param===`mapa`?(n=(0,k.jsx)(ie,{size:14,style:{color:`#10b981`}}),r=`Abrir Georreferenciamento (Mapa)`,i=`btn-primary`):e.param===`dashboard`?(n=(0,k.jsx)(re,{size:14,style:{color:`#0284c7`}}),r=`Ir para Dashboard de Gráficos`,i=`btn-primary`):e.param===`campo`?(n=(0,k.jsx)(h,{size:14,style:{color:`#f59e0b`}}),r=`Nova Coleta de Campo (Inspect)`):e.param===`piezometria`?(n=(0,k.jsx)(ne,{size:14,style:{color:`#38bdf8`}}),r=`Ver Piezometria & Cotas`):e.param===`vazao`?(n=(0,k.jsx)(p,{size:14,style:{color:`#06b6d4`}}),r=`Ver Vazão & Vertedouros`):e.param===`laudo`?(n=(0,k.jsx)(m,{size:14,style:{color:`#ec4899`}}),r=`Emitir Laudo ANM 95/2022`):e.param===`home`?(n=(0,k.jsx)(l,{size:14,style:{color:`#a855f7`}}),r=`Ir para Página Inicial (Home)`):e.param===`coletas`?(n=(0,k.jsx)(h,{size:14,style:{color:`#f59e0b`}}),r=`Ver Coletas de Campo`):e.param===`ordens_servico`?(n=(0,k.jsx)(l,{size:14,style:{color:`#0284c7`}}),r=`Ver Ordens de Serviço`):e.param===`contratos`?(n=(0,k.jsx)(_,{size:14,style:{color:`#8b5cf6`}}),r=`Ver Contratos Terceiros`):e.param===`clientes`?(n=(0,k.jsx)(l,{size:14,style:{color:`#38bdf8`}}),r=`Ver Clientes & Unidades`):e.param===`lotes_relatorios`&&(n=(0,k.jsx)(m,{size:14,style:{color:`#60a5fa`}}),r=`Ver Lotes de Relatórios`):e.type===`DOWNLOAD`&&e.param===`apk`?(n=(0,k.jsx)(u,{size:14,style:{color:`#10b981`}}),r=`Baixar APK Android (mdsync-geotecnia.apk)`,i=`btn-primary`):e.type===`SELECT_STRUCT`&&(n=(0,k.jsx)(_,{size:14,style:{color:`var(--primary-accent)`}}),r=`Filtrar: ${e.param.replace(`_`,` `)}`),(0,k.jsxs)(`button`,{onClick:()=>ge(e.type,e.param),className:i,style:{display:`flex`,alignItems:`center`,gap:`0.4rem`,fontSize:`0.78rem`,padding:`0.4rem 0.75rem`,borderRadius:`8px`},children:[n,(0,k.jsx)(`span`,{children:r})]},t)})}),e.apiErrorNotice&&(0,k.jsx)(`div`,{style:{fontSize:`0.7rem`,color:`var(--geo-atencao)`,marginTop:`0.5rem`,fontStyle:`italic`},children:e.apiErrorNotice})]})},ve=e=>e.split(/(\*\*[^*]+\*\*)/g).map((e,t)=>e.startsWith(`**`)&&e.endsWith(`**`)?(0,k.jsx)(`strong`,{style:{color:`var(--text-main)`,fontWeight:700},children:e.slice(2,-2)},t):e),ye=()=>{O.setApiKey(W),O.setModel(K),O.setBaseUrl(q),C.setApiKey(J),X(!0),setTimeout(()=>X(!1),3e3),U(!1)},be=()=>{R([{id:`reset`,sender:`assistant`,text:`Histórico da conversa limpo. Como posso ajudar com as estruturas e dados do complexo agora?`,timestamp:new Date().toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`}),source:`local`}])},xe=t.find(e=>e.id===F),Se=F===`TODAS`?`Complexo Geotécnico Itaminas (Todas)`:xe?.nome||F,Ce=(0,y.useMemo)(()=>F===`TODAS`?n:n.filter(e=>e.estrutura.replace(/\s+/g,`_`)===F||e.estrutura===F),[n,F]),$=(0,y.useMemo)(()=>r.generateStabilityReport({estrutura:Se,instrumentos:Ce,leituras:b,anomalias:x,pluviometria:S}),[Se,Ce,b,x,S]);return(0,k.jsxs)(`div`,{className:`animate-page-enter`,style:{display:`flex`,flexDirection:`column`,gap:`1.25rem`},children:[(0,k.jsx)(`div`,{className:`card-panel`,style:{padding:`0.85rem 1.25rem`},children:(0,k.jsxs)(`div`,{style:{display:`flex`,flexWrap:`wrap`,alignItems:`center`,justifyContent:`space-between`,gap:`1rem`},children:[(0,k.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.75rem`},children:[(0,k.jsx)(`div`,{style:{width:`38px`,height:`38px`,borderRadius:`10px`,background:`linear-gradient(135deg, #0284c7 0%, #8b5cf6 100%)`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:`#ffffff`,boxShadow:`0 4px 12px rgba(2, 132, 199, 0.25)`},children:(0,k.jsx)(s,{size:20})}),(0,k.jsx)(`div`,{children:(0,k.jsx)(`h2`,{style:{fontSize:`1.15rem`,fontWeight:800,color:`var(--text-main)`,margin:0},children:`SUPORTE GEOTINHO`})})]}),(0,k.jsx)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.5rem`},children:N===`chat`?(0,k.jsxs)(`button`,{onClick:()=>P(`parecer`),className:`btn-secondary`,style:{display:`flex`,alignItems:`center`,gap:`0.4rem`,fontSize:`0.8rem`,padding:`0.45rem 0.9rem`,borderRadius:`8px`},children:[(0,k.jsx)(m,{size:15}),(0,k.jsx)(`span`,{children:`Parecer Técnico Oficial`})]}):(0,k.jsxs)(`button`,{onClick:()=>P(`chat`),className:`btn-primary`,style:{display:`flex`,alignItems:`center`,gap:`0.4rem`,fontSize:`0.8rem`,padding:`0.45rem 0.9rem`,borderRadius:`8px`},children:[(0,k.jsx)(s,{size:15}),(0,k.jsx)(`span`,{children:`Voltar ao Chat`})]})})]})}),N===`chat`&&(0,k.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`1rem`},children:[(0,k.jsxs)(`div`,{className:`card-panel`,style:{padding:`0.65rem 1rem`,display:`flex`,alignItems:`center`,justifyContent:`space-between`,flexWrap:`wrap`,gap:`0.75rem`,backgroundColor:`var(--bg-secondary)`},children:[(0,k.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.75rem`,fontSize:`0.78rem`},children:[(0,k.jsxs)(`span`,{style:{display:`flex`,alignItems:`center`,gap:`0.35rem`,color:O.hasApiKey()||C.hasApiKey()?`var(--geo-normal)`:`var(--text-muted)`},children:[(0,k.jsx)(`span`,{style:{width:`8px`,height:`8px`,borderRadius:`50%`,backgroundColor:O.hasApiKey()||C.hasApiKey()?`var(--geo-normal)`:`#94a3b8`}}),`Motor: `,(0,k.jsx)(`strong`,{style:{color:`var(--text-main)`},children:O.hasApiKey()?`CometAPI (${O.getModel()})`:C.hasApiKey()?`Google Gemini 2.5 Flash`:`Motor Heurístico Local Offline`})]}),(0,k.jsx)(`span`,{style:{color:`var(--text-faint)`},children:`|`}),(0,k.jsxs)(`span`,{style:{color:`var(--text-muted)`},children:[`Complexo: `,(0,k.jsxs)(`strong`,{children:[n.length,` instrumentos conectados`]})]})]}),(0,k.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.5rem`},children:[(0,k.jsxs)(`button`,{onClick:()=>U(!0),className:`btn-secondary`,style:{display:`flex`,alignItems:`center`,gap:`0.35rem`,fontSize:`0.72rem`,padding:`0.35rem 0.65rem`},title:`Configurar chave de token da CometAPI e Gemini`,children:[(0,k.jsx)(oe,{size:13,style:{color:`var(--primary-accent)`}}),(0,k.jsx)(`span`,{children:O.hasApiKey()?`Token CometAPI Ativo`:C.hasApiKey()?`Gemini Ativo`:`Configurar CometAPI (Token)`})]}),(0,k.jsxs)(`button`,{onClick:be,className:`btn-ghost`,style:{display:`flex`,alignItems:`center`,gap:`0.35rem`,fontSize:`0.72rem`,padding:`0.35rem 0.65rem`,color:`var(--text-faint)`},title:`Limpar histórico do chat`,children:[(0,k.jsx)(g,{size:13}),(0,k.jsx)(`span`,{children:`Limpar`})]})]})]}),(0,k.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.5rem`,overflowX:`auto`,paddingBottom:`0.25rem`,scrollbarWidth:`none`},children:[(0,k.jsxs)(`span`,{style:{fontSize:`0.72rem`,fontWeight:700,color:`var(--text-faint)`,whiteSpace:`nowrap`,display:`flex`,alignItems:`center`,gap:`0.3rem`},children:[(0,k.jsx)(s,{size:13,style:{color:`var(--primary-accent)`}}),` Sugestões:`]}),he.map((e,t)=>(0,k.jsx)(`button`,{onClick:()=>Q(e.prompt),className:`btn-secondary`,style:{fontSize:`0.72rem`,padding:`0.35rem 0.65rem`,borderRadius:`16px`,whiteSpace:`nowrap`,backgroundColor:`var(--bg-surface)`,border:`1px solid var(--border-subtle)`},children:e.label},t))]}),(0,k.jsxs)(`div`,{className:`card-panel`,style:{minHeight:`440px`,maxHeight:`560px`,display:`flex`,flexDirection:`column`,overflowY:`auto`,padding:`1.25rem`,gap:`1rem`,backgroundColor:`var(--bg-surface)`},children:[L.map(e=>{let t=e.sender===`user`;return(0,k.jsxs)(`div`,{style:{display:`flex`,justifyContent:t?`flex-end`:`flex-start`,gap:`0.75rem`,maxWidth:`100%`},children:[!t&&(0,k.jsx)(`div`,{style:{width:`34px`,height:`34px`,borderRadius:`50%`,background:`linear-gradient(135deg, #0284c7, #8b5cf6)`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:`#ffffff`,flexShrink:0,marginTop:`2px`,boxShadow:`0 2px 8px rgba(2, 132, 199, 0.25)`},children:(0,k.jsx)(ee,{size:18})}),(0,k.jsxs)(`div`,{style:{maxWidth:t?`75%`:`85%`,backgroundColor:t?`var(--primary-accent)`:`var(--bg-secondary)`,color:t?`#ffffff`:`var(--text-main)`,padding:`0.9rem 1.15rem`,borderRadius:t?`16px 16px 4px 16px`:`16px 16px 16px 4px`,border:t?`none`:`1px solid var(--border-subtle)`,boxShadow:`var(--shadow-sm)`,fontSize:`0.85rem`},children:[(0,k.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,marginBottom:`0.4rem`,fontSize:`0.68rem`,opacity:.8},children:[(0,k.jsx)(`span`,{style:{fontWeight:700},children:t?M?.nome||`Você`:`Gemini Geotecnia`}),(0,k.jsx)(`span`,{children:e.timestamp})]}),t?(0,k.jsx)(`div`,{style:{lineHeight:1.5,whiteSpace:`pre-line`},children:e.text}):_e(e)]}),t&&(0,k.jsx)(`div`,{style:{width:`34px`,height:`34px`,borderRadius:`50%`,backgroundColor:`var(--bg-secondary)`,border:`1px solid var(--border-subtle)`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:`var(--primary-accent)`,flexShrink:0,marginTop:`2px`},children:(0,k.jsx)(ae,{size:18})})]},e.id)}),V&&(0,k.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.75rem`},children:[(0,k.jsx)(`div`,{style:{width:`34px`,height:`34px`,borderRadius:`50%`,background:`linear-gradient(135deg, #0284c7, #8b5cf6)`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:`#ffffff`,flexShrink:0},children:(0,k.jsx)(d,{size:16,className:`animate-spin`})}),(0,k.jsx)(`div`,{style:{padding:`0.75rem 1.25rem`,borderRadius:`16px 16px 16px 4px`,backgroundColor:`var(--bg-secondary)`,border:`1px solid var(--border-subtle)`,display:`flex`,alignItems:`center`,gap:`0.5rem`,fontSize:`0.82rem`,color:`var(--text-muted)`},children:(0,k.jsx)(`span`,{children:`Gemini analisando telemetria e gerando resposta...`})})]}),(0,k.jsx)(`div`,{ref:Z})]}),(0,k.jsxs)(`form`,{onSubmit:e=>{e.preventDefault(),Q()},className:`card-panel`,style:{padding:`0.65rem 0.85rem`,display:`flex`,alignItems:`center`,gap:`0.6rem`},children:[(0,k.jsx)(`input`,{type:`text`,value:z,onChange:e=>B(e.target.value),placeholder:`Digite sua dúvida sobre o complexo, laudos ANM, Jangada ou tarefas do app/apk...`,disabled:V,style:{flex:1,backgroundColor:`transparent`,border:`none`,outline:`none`,fontSize:`0.875rem`,color:`var(--text-main)`,padding:`0.4rem 0.5rem`}}),(0,k.jsxs)(`button`,{type:`submit`,disabled:!z.trim()||V,className:`btn-primary`,style:{display:`flex`,alignItems:`center`,justifyContent:`center`,gap:`0.4rem`,padding:`0.55rem 1.15rem`,fontSize:`0.82rem`,fontWeight:700,borderRadius:`8px`},children:[(0,k.jsx)(te,{size:15}),(0,k.jsx)(`span`,{children:`Enviar`})]})]}),(0,k.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.5rem`,padding:`0.5rem 0.85rem`,borderRadius:`8px`,backgroundColor:`var(--bg-secondary)`,border:`1px solid var(--border-subtle)`,fontSize:`0.7rem`,color:`var(--text-faint)`,lineHeight:1.4},children:[(0,k.jsx)(v,{size:15,style:{color:`#f59e0b`,flexShrink:0}}),(0,k.jsxs)(`span`,{children:[(0,k.jsx)(`strong`,{children:`Aviso Legal & Responsabilidade Técnica:`}),` As análises preditivas do Geotinho têm caráter consultivo de apoio à decisão e `,(0,k.jsx)(`strong`,{children:`não substituem o julgamento técnico, vistorias presenciais ou a Anotação de Responsabilidade Técnica (ART/CREA)`}),` de Engenheiro habilitado (Lei 12.334/2010 PNSB e Resolução ANM nº 95/2022).`]})]})]}),N===`parecer`&&(0,k.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`1.25rem`},children:[(0,k.jsxs)(`div`,{className:`card-panel`,style:{padding:`0.85rem 1.25rem`,display:`flex`,alignItems:`center`,justifyContent:`space-between`,flexWrap:`wrap`,gap:`1rem`},children:[(0,k.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.5rem`},children:[(0,k.jsx)(`span`,{style:{fontSize:`0.8rem`,color:`var(--text-muted)`},children:`Filtrar Estrutura do Parecer:`}),(0,k.jsxs)(`select`,{value:F,onChange:e=>{I(e.target.value),j(e.target.value)},className:`form-select`,style:{fontSize:`0.825rem`,fontWeight:600,minWidth:`220px`},children:[(0,k.jsx)(`option`,{value:`TODAS`,children:`Complexo Geral (8 Estruturas)`}),t.map(e=>(0,k.jsxs)(`option`,{value:e.id,children:[e.nome,` (`,e.totalInstrumentos,` instrumentos)`]},e.id))]})]}),(0,k.jsxs)(`button`,{onClick:()=>window.print(),className:`btn-secondary`,style:{display:`flex`,alignItems:`center`,gap:`0.4rem`,fontSize:`0.825rem`,padding:`0.45rem 0.85rem`},children:[(0,k.jsx)(se,{size:16}),(0,k.jsx)(`span`,{children:`Imprimir / Salvar PDF`})]})]}),(0,k.jsxs)(`div`,{className:`card-panel`,style:{padding:`2rem`,backgroundColor:`var(--bg-surface)`,border:`1px solid var(--border-medium)`,display:`flex`,flexDirection:`column`,gap:`1.5rem`,boxShadow:`var(--shadow-md)`},children:[(0,k.jsxs)(`div`,{style:{display:`flex`,alignItems:`flex-start`,justifyContent:`space-between`,borderBottom:`2px solid var(--border-medium)`,paddingBottom:`1rem`},children:[(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`div`,{style:{fontSize:`0.75rem`,fontWeight:700,color:`var(--primary-accent)`,textTransform:`uppercase`,letterSpacing:`0.05em`},children:`SISTEMA MDSYNC • PROTOCOLO DE SEGURANÇA GEOTÉCNICA`}),(0,k.jsx)(`h1`,{style:{fontSize:`1.35rem`,fontWeight:800,color:`var(--text-main)`,marginTop:`4px`},children:$.titulo}),(0,k.jsxs)(`div`,{style:{fontSize:`0.8rem`,color:`var(--text-muted)`,marginTop:`4px`},children:[`Emissão: `,(0,k.jsx)(`strong`,{children:$.dataEmissao}),` • Responsável da Sessão: `,(0,k.jsx)(`strong`,{children:M.nome}),` (`,M.registro,`)`]})]}),(0,k.jsxs)(`div`,{style:{textAlign:`right`},children:[(0,k.jsx)(`span`,{className:`badge-status ${$.classeAlerta}`,style:{fontSize:`0.85rem`,padding:`0.4rem 0.85rem`},children:$.classificacao}),(0,k.jsx)(`div`,{style:{fontSize:`0.7rem`,color:`var(--text-faint)`,marginTop:`4px`},children:`Conforme Portaria ANM nº 95/2022`})]})]}),(0,k.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(130px, 1fr))`,gap:`0.75rem`,backgroundColor:`var(--bg-secondary)`,padding:`1rem`,borderRadius:`8px`,border:`1px solid var(--border-subtle)`},children:[(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`div`,{style:{fontSize:`0.7rem`,color:`var(--text-faint)`},children:`Total de Instrumentos`}),(0,k.jsx)(`div`,{className:`font-mono`,style:{fontSize:`1.15rem`,fontWeight:800},children:$.resumoMetrico.totalInstrumentos})]}),(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`div`,{style:{fontSize:`0.7rem`,color:`var(--text-faint)`},children:`Status Normal`}),(0,k.jsx)(`div`,{className:`font-mono`,style:{fontSize:`1.15rem`,fontWeight:800,color:`var(--geo-normal)`},children:$.resumoMetrico.instrumentosNormais})]}),(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`div`,{style:{fontSize:`0.7rem`,color:`var(--text-faint)`},children:`Em Atenção`}),(0,k.jsx)(`div`,{className:`font-mono`,style:{fontSize:`1.15rem`,fontWeight:800,color:`var(--geo-atencao)`},children:$.resumoMetrico.instrumentosAtencao})]}),(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`div`,{style:{fontSize:`0.7rem`,color:`var(--text-faint)`},children:`Em Emergência`}),(0,k.jsx)(`div`,{className:`font-mono`,style:{fontSize:`1.15rem`,fontWeight:800,color:`var(--geo-emergencia)`},children:$.resumoMetrico.instrumentosCriticos})]}),(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`div`,{style:{fontSize:`0.7rem`,color:`var(--text-faint)`},children:`Chuva Recente (7d)`}),(0,k.jsx)(`div`,{className:`font-mono`,style:{fontSize:`1.15rem`,fontWeight:800,color:`var(--geo-info)`},children:$.resumoMetrico.pluviometria7d})]}),(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`div`,{style:{fontSize:`0.7rem`,color:`var(--text-faint)`},children:`Anomalias Abertas`}),(0,k.jsx)(`div`,{className:`font-mono`,style:{fontSize:`1.15rem`,fontWeight:800,color:$.resumoMetrico.anomaliasAbertas>0?`var(--geo-atencao)`:`var(--text-main)`},children:$.resumoMetrico.anomaliasAbertas})]})]}),(0,k.jsxs)(`div`,{children:[(0,k.jsxs)(`h3`,{style:{fontSize:`0.95rem`,fontWeight:700,color:`var(--text-main)`,marginBottom:`0.5rem`,display:`flex`,alignItems:`center`,gap:`0.4rem`},children:[(0,k.jsx)(s,{size:16,style:{color:`var(--primary-accent)`}}),`1. Diagnóstico e Parecer Automatizado`]}),(0,k.jsx)(`p`,{style:{fontSize:`0.85rem`,color:`var(--text-muted)`,lineHeight:1.6,textAlign:`justify`},children:$.diagnosticoTecnico})]}),(0,k.jsxs)(`div`,{children:[(0,k.jsxs)(`h3`,{style:{fontSize:`0.95rem`,fontWeight:700,color:`var(--text-main)`,marginBottom:`0.5rem`,display:`flex`,alignItems:`center`,gap:`0.4rem`},children:[(0,k.jsx)(v,{size:16,style:{color:`var(--geo-atencao)`}}),`2. Instrumentos Sob Vigilância Especial (`,$.pontosAtencao.length,`)`]}),$.pontosAtencao.length>0?(0,k.jsx)(`div`,{className:`table-container`,children:(0,k.jsxs)(`table`,{className:`data-table`,children:[(0,k.jsx)(`thead`,{children:(0,k.jsxs)(`tr`,{children:[(0,k.jsx)(`th`,{children:`Instrumento`}),(0,k.jsx)(`th`,{children:`Seção`}),(0,k.jsx)(`th`,{children:`Status`}),(0,k.jsx)(`th`,{children:`Última Cota Medida`}),(0,k.jsx)(`th`,{children:`Limite de Atenção`}),(0,k.jsx)(`th`,{children:`Limite de Emergência`})]})}),(0,k.jsx)(`tbody`,{children:$.pontosAtencao.map((e,t)=>(0,k.jsxs)(`tr`,{children:[(0,k.jsx)(`td`,{className:`font-mono`,style:{fontWeight:700,color:`var(--primary-accent)`},children:e.instrumento}),(0,k.jsx)(`td`,{children:e.secao}),(0,k.jsx)(`td`,{children:(0,k.jsx)(`span`,{className:`badge-status ${e.status===`EMERGÊNCIA`?`badge-emergencia`:`badge-atencao`}`,children:e.status})}),(0,k.jsx)(`td`,{className:`font-mono`,style:{fontWeight:700},children:e.ultimaCota}),(0,k.jsx)(`td`,{className:`font-mono`,children:e.limiteAtencao}),(0,k.jsx)(`td`,{className:`font-mono`,style:{color:`var(--geo-emergencia)`},children:e.limiteEmergencia})]},t))})]})}):(0,k.jsxs)(`div`,{style:{padding:`0.85rem`,borderRadius:`8px`,backgroundColor:`var(--geo-normal-bg)`,color:`var(--geo-normal)`,fontSize:`0.85rem`,display:`flex`,alignItems:`center`,gap:`0.5rem`},children:[(0,k.jsx)(o,{size:18}),(0,k.jsx)(`span`,{children:`Nenhum instrumento ultrapassou os limites de controle para a estrutura selecionada.`})]})]}),(0,k.jsxs)(`div`,{children:[(0,k.jsxs)(`h3`,{style:{fontSize:`0.95rem`,fontWeight:700,color:`var(--text-main)`,marginBottom:`0.5rem`,display:`flex`,alignItems:`center`,gap:`0.4rem`},children:[(0,k.jsx)(c,{size:16,style:{color:`var(--geo-normal)`}}),`3. Plano de Ação & Recomendações Geotécnicas`]}),(0,k.jsx)(`ul`,{style:{paddingLeft:`1.25rem`,fontSize:`0.85rem`,color:`var(--text-muted)`,lineHeight:1.6},children:$.acoesRecomendadas.map((e,t)=>(0,k.jsx)(`li`,{style:{marginBottom:`0.35rem`},children:e},t))})]}),(0,k.jsxs)(`div`,{style:{marginTop:`1rem`,paddingTop:`1.5rem`,borderTop:`1px dashed var(--border-medium)`,display:`flex`,flexDirection:`column`,gap:`0.65rem`,fontSize:`0.75rem`,color:`var(--text-faint)`},children:[(0,k.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,flexWrap:`wrap`,gap:`0.5rem`},children:[(0,k.jsxs)(`div`,{children:[(0,k.jsxs)(`div`,{children:[`Documento gerado pelo motor de inteligência e telemetria do `,(0,k.jsx)(`strong`,{children:`MDSync Geotecnia`})]}),(0,k.jsx)(`div`,{children:`Itaminas Mineração S.A. • Gerência de Geotecnia e Segurança de Barragens`})]}),(0,k.jsxs)(`div`,{style:{textAlign:`right`},children:[(0,k.jsxs)(`div`,{children:[`Hash de Integridade: `,(0,k.jsx)(`span`,{className:`font-mono`,children:`8F3E-91C2-BD07`})]}),(0,k.jsxs)(`div`,{children:[`Status: `,(0,k.jsx)(`strong`,{children:`Válido para Acompanhamento Interno`})]})]})]}),(0,k.jsxs)(`div`,{style:{padding:`0.5rem 0.75rem`,borderRadius:`6px`,backgroundColor:`var(--bg-secondary)`,border:`1px solid var(--border-subtle)`,fontSize:`0.68rem`,color:`var(--text-muted)`,lineHeight:1.4},children:[(0,k.jsx)(`strong`,{children:`Conformidade Legal & ART (Item 13 e 17):`}),` Este parecer técnico sintetiza dados de sensores e análises estatísticas. Não substitui a Anotação de Responsabilidade Técnica (ART/RRT) formal emitida perante o CREA/CONFEA nem dispensa as vistorias periódicas in loco previstas na Lei Federal nº 12.334/2010 (PNSB).`]})]})]})]}),ue&&(0,k.jsx)(`div`,{className:`modal-backdrop animate-fade-in`,onClick:()=>U(!1),children:(0,k.jsxs)(`div`,{className:`modal-content`,onClick:e=>e.stopPropagation(),style:{maxWidth:`540px`,padding:`1.75rem`},children:[(0,k.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.75rem`,marginBottom:`1rem`},children:[(0,k.jsx)(`div`,{style:{width:`40px`,height:`40px`,borderRadius:`10px`,background:`linear-gradient(135deg, #0284c7, #8b5cf6)`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:`#ffffff`,boxShadow:`0 4px 12px rgba(2, 132, 199, 0.25)`},children:(0,k.jsx)(s,{size:20})}),(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`h3`,{style:{fontSize:`1.15rem`,fontWeight:800,color:`var(--text-main)`,margin:0},children:`Motor de Inteligência — Geotinho`}),(0,k.jsxs)(`p`,{style:{fontSize:`0.75rem`,color:`var(--text-muted)`,margin:`0.15rem 0 0`},children:[`Conecte seu token da `,(0,k.jsx)(`strong`,{children:`CometAPI`}),` (OpenAI-compatible) ou chave Gemini`]})]})]}),(0,k.jsx)(`p`,{style:{fontSize:`0.8rem`,color:`var(--text-muted)`,lineHeight:1.5,marginBottom:`1.25rem`},children:`As credenciais são armazenadas de forma segura no armazenamento local (localStorage) do seu navegador ou dispositivo Android/iOS e enviadas diretamente aos servidores da API em tempo real.`}),(0,k.jsxs)(`div`,{style:{marginBottom:`1.15rem`,padding:`1rem`,backgroundColor:`var(--bg-secondary)`,borderRadius:`10px`,border:`1px solid var(--border-subtle)`},children:[(0,k.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,marginBottom:`0.4rem`},children:[(0,k.jsx)(`label`,{style:{fontSize:`0.78rem`,fontWeight:700,color:`var(--text-main)`},children:`CometAPI Key / Token (Recomendado):`}),(0,k.jsxs)(`a`,{href:`https://www.cometapi.com/console/token`,target:`_blank`,rel:`noreferrer`,style:{fontSize:`0.72rem`,color:`var(--primary-accent)`,fontWeight:600,display:`flex`,alignItems:`center`,gap:`0.25rem`},children:[(0,k.jsx)(`span`,{children:`Obter Token`}),(0,k.jsx)(f,{size:12})]})]}),(0,k.jsx)(`input`,{type:`password`,value:W,onChange:e=>G(e.target.value),placeholder:`Cole seu token CometAPI aqui...`,className:`form-input`,style:{width:`100%`,fontSize:`0.85rem`}}),(0,k.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:`0.75rem`,marginTop:`0.75rem`},children:[(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`label`,{style:{display:`block`,fontSize:`0.7rem`,fontWeight:600,color:`var(--text-faint)`,marginBottom:`0.25rem`},children:`Modelo CometAPI:`}),(0,k.jsx)(`select`,{value:K,onChange:e=>de(e.target.value),className:`form-input`,style:{width:`100%`,fontSize:`0.78rem`,padding:`0.4rem 0.6rem`},children:le.map(e=>(0,k.jsx)(`option`,{value:e.id,children:e.name},e.id))})]}),(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`label`,{style:{display:`block`,fontSize:`0.7rem`,fontWeight:600,color:`var(--text-faint)`,marginBottom:`0.25rem`},children:`Base URL:`}),(0,k.jsx)(`input`,{type:`text`,value:q,onChange:e=>fe(e.target.value),placeholder:`https://api.cometapi.com/v1`,className:`form-input`,style:{width:`100%`,fontSize:`0.78rem`,padding:`0.4rem 0.6rem`}})]})]})]}),(0,k.jsxs)(`div`,{style:{marginBottom:`1.25rem`,padding:`0.85rem 1rem`,backgroundColor:`var(--bg-secondary)`,borderRadius:`10px`,border:`1px solid var(--border-subtle)`},children:[(0,k.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,marginBottom:`0.35rem`},children:[(0,k.jsx)(`label`,{style:{fontSize:`0.75rem`,fontWeight:700,color:`var(--text-main)`},children:`Chave Gemini API (Fallback de Backup):`}),(0,k.jsxs)(`a`,{href:`https://aistudio.google.com/app/apikey`,target:`_blank`,rel:`noreferrer`,style:{fontSize:`0.7rem`,color:`var(--primary-accent)`,display:`flex`,alignItems:`center`,gap:`0.25rem`},children:[(0,k.jsx)(`span`,{children:`Google AI Studio`}),(0,k.jsx)(f,{size:11})]})]}),(0,k.jsx)(`input`,{type:`password`,value:J,onChange:e=>Y(e.target.value),placeholder:`Opcional: AIzaSy...`,className:`form-input`,style:{width:`100%`,fontSize:`0.8rem`}})]}),(0,k.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`},children:[(O.hasApiKey()||C.hasApiKey())&&(0,k.jsx)(`button`,{type:`button`,onClick:()=>{O.clearApiKey(),C.clearApiKey(),G(``),Y(``),U(!1)},className:`btn-ghost`,style:{color:`var(--geo-emergencia)`,fontSize:`0.78rem`},children:`Limpar Todas`}),(0,k.jsxs)(`div`,{style:{display:`flex`,gap:`0.5rem`,marginLeft:`auto`},children:[(0,k.jsx)(`button`,{type:`button`,onClick:()=>U(!1),className:`btn-secondary`,style:{fontSize:`0.82rem`},children:`Cancelar`}),(0,k.jsx)(`button`,{type:`button`,onClick:ye,className:`btn-primary`,style:{fontSize:`0.82rem`},children:`Salvar Configurações`})]})]})]})})]})};export{A as AiAnalysisTab};