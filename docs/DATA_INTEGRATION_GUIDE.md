# Guia de Integração de Dados Corporativos — MDSync Geotecnia v2.0

Este documento orienta a equipe de Tecnologia da Informação (TI), Hidrogeologia e Engenharia Geotécnica sobre como integrar as bases de dados corporativas (bancos SQL, dataloggers IoT, planilhas PCMI e chamados Fluig) com a plataforma **MDSync Geotecnia** (Web, APK Android e iOS).

---

## 1. Visão Geral da Arquitetura de Dados

O MDSync opera com arquitetura híbrida **Offline-First**:
- **Offline / Campo:** Leituras coletadas no piu manual ou vistorias de campo são persistidas localmente no `localStorage` / SQLite do dispositivo e enfileiradas na **Fila de Sincronização Offline**.
- **Online / Nuvem Central:** Quando restabelecida a conexão, os dados são enviados e reconciliados com a base corporativa.

```
[ Dataloggers IoT / SCADA ] ──┐
[ Planilhas Excel / PCMI  ] ──┼──► [ dataIntegrationService ] ──► [ MDSync Context / Master Data ]
[ Totvs Fluig (Chamados)  ] ──┤                                            │
[ Coletas de Campo (App)  ] ──┘                                            ▼
                                                             [ SUPORTE GEOTINHO (CometAPI) ]
```

---

## 2. Padrões de Schemas de Dados

### 2.1. Estruturas Monitoradas (`estruturas`)
Representa barragens, diques, cavas e pilhas de estéril/rejeito.
```json
{
  "id": "BARRAGEM_B1",
  "nome": "Barragem B1 (Principal)",
  "tipo": "BARRAGEM",
  "status": "ESTÁVEL",
  "cotaCrista": 915.50,
  "nivelAlerta": 912.00,
  "nivelEmergencia": 914.00,
  "lat": -20.123456,
  "lon": -44.123456,
  "bacia": "Rio das Velhas",
  "responsavel": "Equipe Geotecnia Itaminas"
}
```

### 2.2. Instrumentação Geotécnica (`instrumentos`)
Piezômetros (INA, PZ), vertedouros (VT), marcos superficiais e drenos.
```json
{
  "id": "INA-01",
  "uid": "BARRAGEM_B1_INA-01",
  "estrutura": "BARRAGEM_B1",
  "tipo": "INA",
  "cotaBoca": 915.20,
  "cotaFundo": 875.00,
  "profundidadeTotal": 40.20,
  "limiteAtencao": 905.00,
  "limiteEmergencia": 910.00,
  "secao": "Seção Eixo 01",
  "lat": -20.123500,
  "lon": -44.123600,
  "statusCalculado": "NORMAL",
  "frequenciaLeitura": "DIARIA"
}
```

### 2.3. Séries Temporais de Leituras (`leiturasPiezometricas` e `leiturasVazao`)
```json
{
  "id": "INA-01",
  "estrutura": "BARRAGEM_B1",
  "data": "2026-09-18",
  "hora": "08:30",
  "leituraPiu": 12.45,
  "cotaCalculada": 902.75,
  "status": "NORMAL",
  "origem": "PIU_CAMPO",
  "responsavel": "Técnico Geotécnico"
}
```

---

## 3. Métodos de Integração Suportados

### Método A: Arquivo Mestre Unificado (`public/data/geotech_master.json`)
Ideal para cargas de homologação e atualizações semanais em lote. Pode ser gerado automaticamente pelo script ETL Python localizado em [`scripts/etl_extract_geotech.py`](file:///c:/Users/maycon.nascimento/Documents/antigravity/mdsync-geotecnia/scripts/etl_extract_geotech.py).

### Método B: API REST Corporativa (Oracle / PostgreSQL / SQL Server)
A camada [`dataIntegrationService.js`](file:///c:/Users/maycon.nascimento/Documents/antigravity/mdsync-geotecnia/src/services/dataIntegrationService.js) permite configurar a URL base (`VITE_COMPANY_API_URL`) e autenticação Bearer Token para consumir:
- `GET /api/v1/geotecnia/estruturas`
- `GET /api/v1/geotecnia/instrumentos`
- `GET /api/v1/geotecnia/leituras/recentes`
- `POST /api/v1/geotecnia/coletas/sync` (envio das coletas de campo realizadas no app)

### Método C: Sincronização de Pastas de Rede (PCMI e JGD Hidrogeologia)
Diretórios locais mapeados da rede Itaminas:
- **PCMI:** `C:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\01) PCMI`
- **JGD Hidrogeologia:** `C:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\11) Hidrogeologia\10) Monitoramento\JGD`

---

## 4. Integração com o Agente GEOTINHO (CometAPI `gpt-6-astra`)

O agente de IA **GEOTINHO** tem acesso em tempo real a todo o contexto carregado no MDSync. Toda vez que uma nova estrutura, leitura ou anomalia é inserida na base, ela é automaticamente contextualizada no prompt de sistema da **CometAPI**, permitindo:
- Diagnóstico automático de segurança de barragens conforme a **Resolução ANM nº 95/2022**.
- Respostas precisas sobre cotas, vazões e limiares de atenção/emergência.
- Auditoria preditiva de estabilidade.
