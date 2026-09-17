import json
from datetime import datetime

def seed_fluig_tickets():
    master_path = 'public/data/geotech_master.json'
    with open(master_path, 'r', encoding='utf-8') as f:
        master = json.load(f)

    # Chamados do sistema Fluig para anomalias geotécnicas e manutenção
    fluig_tickets = [
        {
            "id": "FLUIG-2026-08412",
            "protocolo": "FLUIG-08412",
            "processoId": "GEO_GESTAO_ANOMALIAS",
            "versaoProcesso": "2.4",
            "titulo": "Desobstrução e reparo de canaleta de concreto na Berma 2",
            "estrutura": "Barragem B1",
            "estruturaId": "BARRAGEM_B1",
            "localizacao": "Berma 2 - Estaca 14+20m (Ombreira Direita)",
            "tipoAnomalia": "Obstrução de Drenagem / Quebra de Canaleta",
            "criticidade": "Média",
            "criticidadeNivel": "Nível 1 (Atenção)",
            "status": "EM_EXECUCAO",
            "statusLabel": "Em Execução pelo Setor",
            "badgeClass": "badge-atencao",
            "setorResponsavel": "Manutenção Civil & Obras Geotécnicas",
            "setorResponsavelSigla": "MANUT_CIVIL",
            "responsavelExecucao": "Encarregado Carlos Eduardo (Matrícula 4092)",
            "solicitante": "Eng. Marcelo N. Siqueira (CREA 85.120/D-MG)",
            "dataAbertura": "2026-09-14 08:45",
            "prazoSla": "2026-09-20",
            "diasRestantes": 4,
            "lat": -20.063712,
            "lon": -44.114520,
            "descricao": "Identificado acúmulo de material granular carreado após chuva de 14.8 mm e pequena trinca em junta de dilatação da canaleta trapezoidal da Berma 2.",
            "acaoRecomendada": "Limpeza mecânica manual dos sedimentos e selagem com mastique asfáltico na junta para evitar infiltração no maciço.",
            "evidenciaFoto": "/assets/evidencia_canaleta_b1.jpg",
            "solucaoFoto": "",
            "historico": [
                { "data": "2026-09-14 08:45", "usuario": "Eng. Marcelo N. Siqueira", "acao": "Abertura de Chamado Fluig via App MDSync (Coleta em Campo)" },
                { "data": "2026-09-14 10:15", "usuario": "Sistema Fluig (BPM)", "acao": "Atribuído automaticamente ao grupo MANUT_CIVIL" },
                { "data": "2026-09-15 07:30", "usuario": "Carlos Eduardo (Manutenção)", "acao": "Iniciado atendimento em campo com equipe de 3 operacionais" }
            ],
            "urlFluig": "https://itaminas.fluig.com/portal/p/1/workflowview?processId=GEO_GESTAO_ANOMALIAS&numProcess=8412"
        },
        {
            "id": "FLUIG-2026-08419",
            "protocolo": "FLUIG-08419",
            "processoId": "GEO_GESTAO_ANOMALIAS",
            "versaoProcesso": "2.4",
            "titulo": "Adequação de talude e reconformação de crista na Cava Jangada",
            "estrutura": "Cava Jangada",
            "estruturaId": "CAVA_JANGADA",
            "localizacao": "Bancada 890m - Setor Norte",
            "tipoAnomalia": "Erosão / Voçoroca / Ravinamento",
            "criticidade": "Alta",
            "criticidadeNivel": "Nível 2 (Alerta)",
            "status": "ABERTO",
            "statusLabel": "Aberto / Triagem no Setor",
            "badgeClass": "badge-alerta",
            "setorResponsavel": "Operação de Mina & Equipamentos Pesados",
            "setorResponsavelSigla": "OP_MINA",
            "responsavelExecucao": "Supervisão de Mina - Turno A",
            "solicitante": "Geólogo Thiago V. Amaral (CREA 142.890/MG)",
            "dataAbertura": "2026-09-15 14:20",
            "prazoSla": "2026-09-18",
            "diasRestantes": 2,
            "lat": -20.084120,
            "lon": -44.135240,
            "descricao": "Ravinamento de talude decorrente de escoamento concentrado superficial, com projeção para a crista inferior da bancada de lavra.",
            "acaoRecomendada": "Mobilização de trator D6 para reconformação mecânica do talude e execução de camalhão de crista para desvio de água superficial.",
            "evidenciaFoto": "/assets/evidencia_ravinamento_jangada.jpg",
            "solucaoFoto": "",
            "historico": [
                { "data": "2026-09-15 14:20", "usuario": "Geólogo Thiago V. Amaral", "acao": "Chamado aberto via MDSync com envio direto ao Fluig" },
                { "data": "2026-09-15 14:25", "usuario": "Sistema Fluig (BPM)", "acao": "Encaminhado para a gerência de Mina" }
            ],
            "urlFluig": "https://itaminas.fluig.com/portal/p/1/workflowview?processId=GEO_GESTAO_ANOMALIAS&numProcess=8419"
        },
        {
            "id": "FLUIG-2026-08398",
            "protocolo": "FLUIG-08398",
            "processoId": "GEO_GESTAO_ANOMALIAS",
            "versaoProcesso": "2.4",
            "titulo": "Substituição de tampa metálica e cadeado do Piezômetro INA-108",
            "estrutura": "Barragem B1",
            "estruturaId": "BARRAGEM_B1",
            "localizacao": "Berma 1 - Estaca 08+10m",
            "tipoAnomalia": "Dano em Instrumentação / Tubo ou Tampa",
            "criticidade": "Baixa",
            "criticidadeNivel": "Nível 0 (Rotina)",
            "status": "CONCLUIDO",
            "statusLabel": "Concluído e Validado",
            "badgeClass": "badge-normal",
            "setorResponsavel": "Topografia & Monitoramento",
            "setorResponsavelSigla": "TOPO_MONIT",
            "responsavelExecucao": "Técnico Lucas Ferreira (Topografia)",
            "solicitante": "Técnico Geotécnico Mateus Rocha",
            "dataAbertura": "2026-09-10 11:00",
            "dataConclusao": "2026-09-12 16:30",
            "prazoSla": "2026-09-15",
            "diasRestantes": 0,
            "lat": -20.063850,
            "lon": -44.114400,
            "descricao": "Tampa de proteção do tubo guia do INA-108 oxidada com trava de cadeado emperrada, dificultando a leitura manual semanal.",
            "acaoRecomendada": "Troca por nova tampa galvanizada padrão Itaminas com segredo de cadeado unificado da Geotecnia.",
            "evidenciaFoto": "/assets/evidencia_instrumento_dano.jpg",
            "solucaoFoto": "/assets/solucao_instrumento_reparo.jpg",
            "historico": [
                { "data": "2026-09-10 11:00", "usuario": "Mateus Rocha", "acao": "Chamado aberto via MDSync" },
                { "data": "2026-09-11 09:00", "usuario": "Lucas Ferreira", "acao": "Substituição realizada em campo" },
                { "data": "2026-09-12 16:30", "usuario": "Eng. Marcelo N. Siqueira", "acao": "Vistoria presencial e encerramento no Fluig" }
            ],
            "urlFluig": "https://itaminas.fluig.com/portal/p/1/workflowview?processId=GEO_GESTAO_ANOMALIAS&numProcess=8398"
        },
        {
            "id": "FLUIG-2026-08425",
            "protocolo": "FLUIG-08425",
            "processoId": "GEO_GESTAO_ANOMALIAS",
            "versaoProcesso": "2.4",
            "titulo": "Limpeza de bacia de dissipação do Vertedouro VT-02",
            "estrutura": "Barragem B4",
            "estruturaId": "BARRAGEM_B4",
            "localizacao": "Canal de Restituição do Vertedouro",
            "tipoAnomalia": "Assoreamento / Acúmulo de Detritos",
            "criticidade": "Média",
            "criticidadeNivel": "Nível 1 (Atenção)",
            "status": "AGUARDANDO_VALIDACAO",
            "statusLabel": "Aguardando Validação Geotécnica",
            "badgeClass": "badge-info",
            "setorResponsavel": "Infraestrutura Hídrica & Drenagem",
            "setorResponsavelSigla": "INFRA_HIDRICA",
            "responsavelExecucao": "Equipe Hidrogeologia & Bombas",
            "solicitante": "Eng. Marcelo N. Siqueira (CREA 85.120/D-MG)",
            "dataAbertura": "2026-09-12 15:10",
            "prazoSla": "2026-09-19",
            "diasRestantes": 3,
            "lat": -20.071200,
            "lon": -44.120400,
            "descricao": "Acúmulo de vegetação e pedriscos carreados junto à soleira do vertedouro de concreto VT-02.",
            "acaoRecomendada": "Remoção de material e desobstrução completa da lâmina de transbordo para manter a capacidade de vazão do projeto.",
            "evidenciaFoto": "/assets/evidencia_vertedouro_b4.jpg",
            "solucaoFoto": "/assets/solucao_vertedouro_limpo.jpg",
            "historico": [
                { "data": "2026-09-12 15:10", "usuario": "Eng. Marcelo N. Siqueira", "acao": "Chamado aberto no Fluig via MDSync" },
                { "data": "2026-09-14 11:30", "usuario": "Equipe Hidrogeologia", "acao": "Limpeza e desobstrução concluídas" },
                { "data": "2026-09-15 08:00", "usuario": "Sistema Fluig (BPM)", "acao": "Transferido para validação do solicitante" }
            ],
            "urlFluig": "https://itaminas.fluig.com/portal/p/1/workflowview?processId=GEO_GESTAO_ANOMALIAS&numProcess=8425"
        },
        {
            "id": "FLUIG-2026-08431",
            "protocolo": "FLUIG-08431",
            "processoId": "GEO_GESTAO_ANOMALIAS",
            "versaoProcesso": "2.4",
            "titulo": "Hidrossemeadura e recomposição vegetal em talude de jusante",
            "estrutura": "PDE Mangaba",
            "estruturaId": "PDE_MANGABA",
            "localizacao": "Banqueta 3 - Talude Jusante",
            "tipoAnomalia": "Perda de Cobertura Vegetal / Erosão Superficial",
            "criticidade": "Baixa",
            "criticidadeNivel": "Nível 0 (Rotina)",
            "status": "ABERTO",
            "statusLabel": "Aberto / Triagem no Setor",
            "badgeClass": "badge-normal",
            "setorResponsavel": "Meio Ambiente & PRAD",
            "setorResponsavelSigla": "MEIO_AMBIENTE",
            "responsavelExecucao": "Coordenação de Meio Ambiente",
            "solicitante": "Técnico Geotécnico Mateus Rocha",
            "dataAbertura": "2026-09-16 09:15",
            "prazoSla": "2026-09-30",
            "diasRestantes": 14,
            "lat": -20.059200,
            "lon": -44.108900,
            "descricao": "Ponto de desprendimento de biomanta após período de seca, necessitando reforço de hidrossemeadura e fixação de tela biodegradável.",
            "acaoRecomendada": "Aplicação de adubo orgânico e sementes de braquiária com fixação mecânica de manta antierosiva.",
            "evidenciaFoto": "/assets/evidencia_vegetacao_mangaba.jpg",
            "solucaoFoto": "",
            "historico": [
                { "data": "2026-09-16 09:15", "usuario": "Mateus Rocha", "acao": "Chamado aberto via MDSync integrado ao Fluig" }
            ],
            "urlFluig": "https://itaminas.fluig.com/portal/p/1/workflowview?processId=GEO_GESTAO_ANOMALIAS&numProcess=8431"
        }
    ]

    master['chamadosFluig'] = fluig_tickets

    with open(master_path, 'w', encoding='utf-8') as f:
        json.dump(master, f, indent=2, ensure_ascii=False)

    print("Chamados Fluig adicionados com sucesso ao master json!")

    scratch_master = r'C:\Users\maycon.nascimento\.gemini\antigravity-ide\scratch\mdsync-geotecnia\public\data\geotech_master.json'
    try:
        with open(scratch_master, 'w', encoding='utf-8') as f:
            json.dump(master, f, indent=2, ensure_ascii=False)
        print("Salvo também em scratch!")
    except Exception as e:
        print("Aviso scratch:", e)

if __name__ == '__main__':
    seed_fluig_tickets()
