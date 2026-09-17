import json
from datetime import datetime

def seed_inspectapp_data():
    master_path = 'public/data/geotech_master.json'
    with open(master_path, 'r', encoding='utf-8') as f:
        master = json.load(f)

    # 1. Clientes
    clientes = [
        {
            "id": "CLI-001",
            "nome": "Itaminas Mineração S/A",
            "razaoSocial": "Itaminas Comércio de Minérios S.A.",
            "cnpj": "17.214.398/0001-92",
            "unidade": "Mina do Engenho - Sarzedo/MG",
            "contato": "Gerência de Geotecnia e Barragens",
            "email": "geotecnia@itaminas.com.br",
            "telefone": "(31) 3529-5000",
            "estruturasAtendidas": ["Barragem B1", "Barragem B4", "Cava Jangada", "PDE Mangaba", "PDE Jacó", "PDE Engenho Seco I", "PDE Engenho Seco II"],
            "status": "ATIVO"
        },
        {
            "id": "CLI-002",
            "nome": "Complexo Minerário Jangada",
            "razaoSocial": "Mineração Jangada e Cavas Operacionais",
            "cnpj": "21.450.112/0001-44",
            "unidade": "Cava Jangada & Encostas - Ibirité/Sarzedo",
            "contato": "Supervisão de Mina e Hidrogeologia",
            "email": "operacao.jangada@itaminas.com.br",
            "telefone": "(31) 3529-5120",
            "estruturasAtendidas": ["Cava Jangada", "Cava Antena", "Cava Índia", "Cava Samambaia"],
            "status": "ATIVO"
        },
        {
            "id": "CLI-003",
            "nome": "Terminal Ferroviário e Pilhas Sarzedo",
            "razaoSocial": "Logística e Beneficiamento Itaminas",
            "cnpj": "17.214.398/0004-35",
            "unidade": "Pátio de Estocagem e Pilhas de Rejeito",
            "contato": "Coordenação de Infraestrutura",
            "email": "patio.pilhas@itaminas.com.br",
            "telefone": "(31) 3529-5300",
            "estruturasAtendidas": ["Pilha de Produto/Sub-Produto", "Pilha de Rejeito", "Contrapilhamento Carrapato"],
            "status": "ATIVO"
        }
    ]

    # 2. Contratos de Empresas Terceiras (com descrição do serviço sendo prestado)
    contratos_terceiros = [
        {
            "id": "CTR-2026-092",
            "numeroContrato": "CT-ITM-2026/041",
            "empresaTerceirizada": "Geosonda Engenharia e Perfurações Ltda.",
            "cnpj": "04.582.190/0001-33",
            "clienteId": "CLI-001",
            "clienteNome": "Itaminas Mineração S/A",
            "descricaoServico": "Execução de ensaios geotécnicos de permeabilidade, instalação e recuperação de piezômetros tipo Casagrande (PZ) e corda vibrante (INA) nos taludes e bermas da Barragem B1 e Barragem B4.",
            "setorExecutor": "Sondagens & Instrumentação Especializada",
            "responsavelTecnico": "Eng. Roberto Vasconcelos (CREA 42.190/D-MG)",
            "dataInicio": "2026-01-15",
            "dataFim": "2026-12-31",
            "valorGlobal": "R$ 1.840.000,00",
            "status": "VIGENTE",
            "badgeClass": "badge-normal",
            "slaAtendimento": "24 horas para reparos emergenciais em instrumentação"
        },
        {
            "id": "CTR-2026-088",
            "numeroContrato": "CT-ITM-2026/018",
            "empresaTerceirizada": "Topogeo Agrimensura & Drones S/S",
            "cnpj": "12.774.201/0001-80",
            "clienteId": "CLI-001",
            "clienteNome": "Itaminas Mineração S/A",
            "descricaoServico": "Levantamento topográfico de precisão semanal dos marcos superficiais (MCD), prismas ópticos, monitoramento batimétrico do reservatório e voos fotogramétricos com drone para cálculo de volume e nuvem de pontos dos taludes da Cava Jangada e Barragens.",
            "setorExecutor": "Topografia de Precisão & Geodésia",
            "responsavelTecnico": "Agrimensor Marcos Tadeu (CREA 65.402/MG)",
            "dataInicio": "2026-02-01",
            "dataFim": "2027-01-31",
            "valorGlobal": "R$ 960.000,00",
            "status": "VIGENTE",
            "badgeClass": "badge-normal",
            "slaAtendimento": "Entrega de planilhas de deslocamento em até 12 horas pós-leitura"
        },
        {
            "id": "CTR-2026-074",
            "numeroContrato": "CT-ITM-2025/112",
            "empresaTerceirizada": "Hidromina Manutenção de Bombas & Drenagens",
            "cnpj": "33.910.450/0001-19",
            "clienteId": "CLI-002",
            "clienteNome": "Complexo Minerário Jangada",
            "descricaoServico": "Manutenção mecânica e elétrica preventiva e corretiva nos vertedouros de bacia, drenos sub-horizontais profundos (DHP), calhas Parshall e sistemas de bombeamento do Sump e rebaixamento freático da Jangada.",
            "setorExecutor": "Infraestrutura Hidrogeológica & Bombas",
            "responsavelTecnico": "Eng. Mecânico Fernando Paiva",
            "dataInicio": "2025-08-10",
            "dataFim": "2026-10-10",
            "valorGlobal": "R$ 1.250.000,00",
            "status": "VIGENTE",
            "badgeClass": "badge-normal",
            "slaAtendimento": "4 horas para chamados em vertedouros e bacias"
        },
        {
            "id": "CTR-2026-061",
            "numeroContrato": "CT-ITM-2025/087",
            "empresaTerceirizada": "BioVerde Soluções Ambientais & Hidrossemeadura",
            "cnpj": "08.314.901/0001-52",
            "clienteId": "CLI-001",
            "clienteNome": "Itaminas Mineração S/A",
            "descricaoServico": "Aplicação de hidrossemeadura com biomantas vegetais, controle de voçorocas, recomposição de cobertura vegetal nos taludes de jusante das pilhas de estéril e bacias de amortecimento do PDE Mangaba e Jacó.",
            "setorExecutor": "Recuperação de Áreas Degradadas (PRAD)",
            "responsavelTecnico": "Bióloga Camila Duarte",
            "dataInicio": "2025-06-01",
            "dataFim": "2026-06-01",
            "valorGlobal": "R$ 720.000,00",
            "status": "EM_RENOVACAO",
            "badgeClass": "badge-atencao",
            "slaAtendimento": "Recomposição em até 5 dias úteis"
        },
        {
            "id": "CTR-2026-055",
            "numeroContrato": "CT-ITM-2024/099",
            "empresaTerceirizada": "Consórcio Civil Minas Obras Geotécnicas",
            "cnpj": "29.118.300/0001-71",
            "clienteId": "CLI-001",
            "clienteNome": "Itaminas Mineração S/A",
            "descricaoServico": "Construção e reforma de canaletas trapezoidais de concreto armado, descidas d'água em escada, bacias de dissipação de energia e enrocamento de proteção de berma nas barragens e diques.",
            "setorExecutor": "Engenharia Civil Pesada",
            "responsavelTecnico": "Eng. Civil Marcelo Duarte",
            "dataInicio": "2024-11-01",
            "dataFim": "2026-03-30",
            "valorGlobal": "R$ 3.400.000,00",
            "status": "ENCERRADO",
            "badgeClass": "badge-muted",
            "slaAtendimento": "Concluído com termo de aceite"
        }
    ]

    # 3. Ordens de Serviço (O.S.)
    ordens_servico = [
        {
            "id": "OS-2026-0182",
            "numeroOS": "OS-0182/2026",
            "descricao": "Inspeção e desobstrução preventiva de calhas e canaletas de berma antes do início das chuvas",
            "clienteId": "CLI-001",
            "clienteNome": "Itaminas Mineração S/A",
            "estrutura": "Barragem B1",
            "estruturaId": "BARRAGEM_B1",
            "setorExecutor": "Manutenção Civil & Obras Geotécnicas",
            "responsavel": "Encarregado Carlos Eduardo (Matrícula 4092)",
            "solicitante": "Eng. Marcelo N. Siqueira",
            "dataAbertura": "2026-09-14 08:30",
            "prazoSla": "2026-09-21",
            "status": "EM_ANDAMENTO",
            "statusLabel": "Em Andamento",
            "badgeClass": "badge-atencao",
            "prioridade": "Alta",
            "observacoes": "Equipe de 4 colaboradores com EPI completo atuando na Berma 2."
        },
        {
            "id": "OS-2026-0179",
            "numeroOS": "OS-0179/2026",
            "descricao": "Campanha semanal de medição manual de nível d'água nos 27 piezômetros da Jangada com pio elétrico",
            "clienteId": "CLI-002",
            "clienteNome": "Complexo Minerário Jangada",
            "estrutura": "Cava Jangada",
            "estruturaId": "CAVA_JANGADA",
            "setorExecutor": "Equipe de Coleta de Campo (MDSync Inspect)",
            "responsavel": "Técnico Lucas Ferreira",
            "solicitante": "Geólogo Thiago V. Amaral",
            "dataAbertura": "2026-09-15 07:00",
            "prazoSla": "2026-09-16",
            "status": "CONCLUIDA",
            "statusLabel": "Concluída",
            "badgeClass": "badge-normal",
            "prioridade": "Média",
            "observacoes": "Todas as 27 leituras integradas ao banco e curvas piezométricas atualizadas."
        },
        {
            "id": "OS-2026-0185",
            "numeroOS": "OS-0185/2026",
            "descricao": "Reconformação de crista e berma da bancada 890m com motoniveladora",
            "clienteId": "CLI-002",
            "clienteNome": "Complexo Minerário Jangada",
            "estrutura": "Cava Jangada",
            "estruturaId": "CAVA_JANGADA",
            "setorExecutor": "Operação de Mina & Equipamentos Pesados",
            "responsavel": "Supervisão Turno A",
            "solicitante": "Geólogo Thiago V. Amaral",
            "dataAbertura": "2026-09-15 14:30",
            "prazoSla": "2026-09-18",
            "status": "ABERTA",
            "statusLabel": "Aberta",
            "badgeClass": "badge-alerta",
            "prioridade": "Crítica",
            "observacoes": "Vincular à OS Chamado Fluig FLUIG-08419 para acompanhamento integrado."
        },
        {
            "id": "OS-2026-0175",
            "numeroOS": "OS-0175/2026",
            "descricao": "Limpeza de bacia e desassoreamento da calha do Vertedouro VT-02",
            "clienteId": "CLI-001",
            "clienteNome": "Itaminas Mineração S/A",
            "estrutura": "Barragem B4",
            "estruturaId": "BARRAGEM_B4",
            "setorExecutor": "Infraestrutura Hídrica & Hidromina",
            "responsavel": "Equipe Hidrogeologia",
            "solicitante": "Eng. Marcelo N. Siqueira",
            "dataAbertura": "2026-09-12 10:00",
            "prazoSla": "2026-09-17",
            "status": "CONCLUIDA",
            "statusLabel": "Concluída",
            "badgeClass": "badge-normal",
            "prioridade": "Média",
            "observacoes": "Lâmina vertente desobstruída com vazão normalizada em 3.42 L/s."
        }
    ]

    # 4. Coletas de Campo (com sub-abas: Concluídas, Em Preenchimento, Fila de Integração)
    coletas = [
        {
            "id": "COL-202609-082",
            "codigoColeta": "COL-082",
            "titulo": "Campanha Semanal de Piezometria - Barragem B1",
            "estrutura": "Barragem B1",
            "estruturaId": "BARRAGEM_B1",
            "status": "CONCLUIDA",
            "statusLabel": "Concluída",
            "badgeClass": "badge-normal",
            "dataHora": "2026-09-16 09:30",
            "usuario": "Carlos Eduardo Mendes",
            "usuarioCargo": "Técnico de Campo",
            "totalInstrumentosLidos": 18,
            "fotosCount": 4,
            "anomaliasDetectadas": 0,
            "tempoColetaMin": 45,
            "observacoes": "Leituras estáveis. Tubos íntegros com tampas trancadas."
        },
        {
            "id": "COL-202609-081",
            "codigoColeta": "COL-081",
            "titulo": "Vistoria Semanal de Vertedouros e Drenagem - B1 e B4",
            "estrutura": "Barragem B4",
            "estruturaId": "BARRAGEM_B4",
            "status": "CONCLUIDA",
            "statusLabel": "Concluída",
            "badgeClass": "badge-normal",
            "dataHora": "2026-09-15 14:15",
            "usuario": "Carlos Eduardo Mendes",
            "usuarioCargo": "Técnico de Campo",
            "totalInstrumentosLidos": 12,
            "fotosCount": 3,
            "anomaliasDetectadas": 0,
            "tempoColetaMin": 30,
            "observacoes": "Fluxos límpidos sem carreamento de finos."
        },
        {
            "id": "COL-202609-083",
            "codigoColeta": "COL-083",
            "titulo": "Coleta em Andamento - Piezômetros da Cava Jangada",
            "estrutura": "Cava Jangada",
            "estruturaId": "CAVA_JANGADA",
            "status": "EM_PREENCHIMENTO",
            "statusLabel": "Em Preenchimento (Rascunho)",
            "badgeClass": "badge-atencao",
            "dataHora": "2026-09-16 11:20",
            "usuario": "Mateus Rocha",
            "usuarioCargo": "Técnico de Campo",
            "totalInstrumentosLidos": 14,
            "totalEsperado": 27,
            "fotosCount": 2,
            "anomaliasDetectadas": 1,
            "tempoColetaMin": 25,
            "observacoes": "Restam 13 piezômetros na bancada 870m para leitura."
        },
        {
            "id": "COL-202609-084",
            "codigoColeta": "COL-084",
            "titulo": "Inspeção Visual da Crista e Encostas - PDE Mangaba",
            "estrutura": "PDE Mangaba",
            "estruturaId": "PDE_MANGABA",
            "status": "EM_PREENCHIMENTO",
            "statusLabel": "Em Preenchimento (Rascunho)",
            "badgeClass": "badge-atencao",
            "dataHora": "2026-09-16 12:40",
            "usuario": "Dra. Vanessa Albuquerque",
            "usuarioCargo": "Engenheira Geotécnica",
            "totalInstrumentosLidos": 6,
            "totalEsperado": 10,
            "fotosCount": 3,
            "anomaliasDetectadas": 0,
            "tempoColetaMin": 15,
            "observacoes": "Verificação das canaletas da banqueta intermediária."
        },
        {
            "id": "COL-202609-080",
            "codigoColeta": "COL-080",
            "titulo": "Inspeção de Campo Offline - Drenos de Fundo B1",
            "estrutura": "Barragem B1",
            "estruturaId": "BARRAGEM_B1",
            "status": "FILA_INTEGRACAO",
            "statusLabel": "Aguardando Envio (Fila Offline)",
            "badgeClass": "badge-alerta",
            "dataHora": "2026-09-16 10:15",
            "usuario": "Carlos Eduardo Mendes",
            "usuarioCargo": "Técnico de Campo",
            "totalInstrumentosLidos": 8,
            "fotosCount": 2,
            "anomaliasDetectadas": 0,
            "tempoColetaMin": 20,
            "observacoes": "Coletado em área de sombra de sinal no pé da barragem. Pronto para sincronizar."
        }
    ]

    # 5. Lotes de Relatórios
    lotes_relatorios = [
        {
            "id": "LOTE-2026-W37",
            "codigoLote": "LOTE-W37/2026",
            "titulo": "Boletim Semanal Integrado de Segurança Geotécnica - Semana 37",
            "periodo": "08/09/2026 a 15/09/2026",
            "dataGeracao": "2026-09-15 18:00",
            "tipo": "Boletim Semanal",
            "estruturasIncluidas": ["Barragem B1", "Barragem B4", "Cava Jangada", "PDE Mangaba"],
            "totalInstrumentosAuditados": 245,
            "totalLaudos": 4,
            "status": "EMITIDO",
            "responsavel": "Eng. Marcelo N. Siqueira (CREA 85.120/D-MG)",
            "arquivo": "/relatorios/Lote_Semanal_W37_2026.pdf",
            "tamanho": "4.2 MB"
        },
        {
            "id": "LOTE-2026-ANM-AGO",
            "codigoLote": "LOTE-ANM-AGO/2026",
            "titulo": "Conjunto de Declarações de Condição de Estabilidade (DCE) - ANM 95/2022",
            "periodo": "Agosto/2026",
            "dataGeracao": "2026-09-01 10:30",
            "tipo": "Regulatório ANM / PNSB",
            "estruturasIncluidas": ["Barragem B1", "Barragem B4"],
            "totalInstrumentosAuditados": 168,
            "totalLaudos": 2,
            "status": "EMITIDO",
            "responsavel": "Eng. Marcelo N. Siqueira",
            "arquivo": "/relatorios/Lote_ANM_AGO_2026.pdf",
            "tamanho": "8.7 MB"
        },
        {
            "id": "LOTE-2026-W38",
            "codigoLote": "LOTE-W38/2026",
            "titulo": "Boletim Semanal de Instrumentação e Nível Freático - Semana 38",
            "periodo": "16/09/2026 a 22/09/2026",
            "dataGeracao": "2026-09-16 12:00",
            "tipo": "Boletim Semanal",
            "estruturasIncluidas": ["Todas as 8 Estruturas"],
            "totalInstrumentosAuditados": 264,
            "totalLaudos": 8,
            "status": "EM_PROCESSAMENTO",
            "responsavel": "Dra. Vanessa Albuquerque",
            "arquivo": "",
            "tamanho": "Em geração"
        }
    ]

    # 6. Histórico de Importações do PCMI
    importacoes_pcmi = [
        {
            "id": "IMP-001",
            "origem": r"C:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\01) PCMI\Leituras_Piezometria_B1_2026.xlsx",
            "data": "2026-09-16 08:30",
            "registrosImportados": 3875,
            "status": "CONCLUIDO",
            "usuario": "Sistema Automático (MDSync Engine)",
            "tipo": "Piezometria & NA"
        },
        {
            "id": "IMP-002",
            "origem": r"C:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\11) Hidrogeologia\10) Monitoramento\JGD\Medicoes_Jangada_2026.csv",
            "data": "2026-09-16 09:15",
            "registrosImportados": 1786,
            "status": "CONCLUIDO",
            "usuario": "Eng. Marcelo N. Siqueira",
            "tipo": "Vazão & Vertedouros Jangada"
        },
        {
            "id": "IMP-003",
            "origem": r"C:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\01) PCMI\Pluviometria_Estacao_Meteorologica.xlsx",
            "data": "2026-09-16 10:00",
            "registrosImportados": 365,
            "status": "CONCLUIDO",
            "usuario": "Sistema Automático",
            "tipo": "Precipitação / Pluviometria"
        }
    ]

    master['clientes'] = clientes
    master['contratosTerceiros'] = contratos_terceiros
    master['ordensServico'] = ordens_servico
    master['coletas'] = coletas
    master['lotesRelatorios'] = lotes_relatorios
    master['importacoesPcmi'] = importacoes_pcmi

    with open(master_path, 'w', encoding='utf-8') as f:
        json.dump(master, f, indent=2, ensure_ascii=False)

    print("Dados do InspectApp/Sysdam semeados com sucesso!")

    scratch_master = r'C:\Users\maycon.nascimento\.gemini\antigravity-ide\scratch\mdsync-geotecnia\public\data\geotech_master.json'
    try:
        with open(scratch_master, 'w', encoding='utf-8') as f:
            json.dump(master, f, indent=2, ensure_ascii=False)
        print("Salvo também em scratch!")
    except Exception as e:
        print("Aviso scratch:", e)

if __name__ == '__main__':
    seed_inspectapp_data()
