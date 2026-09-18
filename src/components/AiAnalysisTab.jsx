import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { useAuth } from '../context/AuthContext';
import { aiGeotechService } from '../services/aiGeotechService';
import { geminiService } from '../services/geminiService';
import { cometApiService, AVAILABLE_MODELS } from '../services/cometApiService';
import { 
  Cpu, 
  FileText, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  ShieldCheck, 
  Layers, 
  CloudRain, 
  Activity,
  Download,
  Send,
  Bot,
  User,
  Key,
  Trash2,
  HelpCircle,
  ExternalLink,
  MapPin,
  LayoutDashboard,
  ClipboardEdit,
  Droplets,
  LineChart,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';

export const AiAnalysisTab = ({ onNavigateTab }) => {
  const { 
    structures, 
    instruments, 
    readingsPiezometria, 
    anomalies, 
    pluviometria, 
    stats,
    contratosTerceiros = [],
    ordensServico = [],
    clientes = [],
    coletas = [],
    activeStructureId, 
    selectStructure 
  } = useGeotechData();
  const { currentUser } = useAuth();

  // Controle de Visualização: 'chat' (Chatbot Gemini) | 'parecer' (Parecer Técnico Estruturado)
  const [activeView, setActiveView] = useState('chat');

  // Estados do Parecer Técnico
  const [selectedStruct, setSelectedStruct] = useState(activeStructureId || 'TODAS');

  // Estados do Agente Geotinho (CometAPI + Gemini + Motor Local)
  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Olá, **${currentUser?.nome || 'Engenheiro(a)'}**! Sou o **Geotinho**, o Agente Especialista de Inteligência Artificial e Pesquisa Geotécnica do **MDSync**, operando com o motor **CometAPI (gpt-6-astra)**.

Estou conectado em tempo real aos dados das **8 estruturas** do Complexo Itaminas (**245 instrumentos ativos**, incluindo os **48 instrumentos** de **Jangada** com piezometria e vertedouros).

Como posso te ajudar hoje?
- Consultar níveis de água, vazões ou anomalias de qualquer estrutura.
- Navegar para módulos do site (Dashboard, Mapa, Coleta de Campo, Vertedouros).
- Orientar sobre as regras da **Resolução ANM nº 95/2022** e PNSB.
- Ajudar no download e funcionamento offline do **APK Android**.

*Escolha uma das sugestões rápidas abaixo ou digite sua pergunta:*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'cometapi'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [cometKeyInput, setCometKeyInput] = useState(() => cometApiService.getApiKey());
  const [selectedModel, setSelectedModel] = useState(() => cometApiService.getModel());
  const [baseUrlInput, setBaseUrlInput] = useState(() => cometApiService.getBaseUrl());
  const [geminiKeyInput, setGeminiKeyInput] = useState(() => geminiService.getApiKey());
  const [keySavedToast, setKeySavedToast] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeView === 'chat') {
      scrollToBottom();
    }
  }, [messages, activeView]);

  // Sugestões de tarefas rápidas para o usuário
  const quickPrompts = [
    {
      label: '📊 Status da Barragem B1',
      prompt: 'Qual é a condição geotécnica atual da Barragem B1 e quantos instrumentos estão ativos nela?'
    },
    {
      label: '💧 Dados de Jangada',
      prompt: 'Quantos piezômetros e vertedouros temos em Jangada e quais bacias são monitoradas?'
    },
    {
      label: '📱 Baixar APK Android',
      prompt: 'Como faço para baixar e instalar o aplicativo APK no celular para operar offline?'
    },
    {
      label: '🗺️ Abrir Georreferenciamento',
      prompt: 'Quero visualizar todos os instrumentos e ortofoto no mapa de georreferenciamento.'
    },
    {
      label: '⚖️ Resolução ANM nº 95/2022',
      prompt: 'Quais são as diretrizes da Resolução ANM nº 95/2022 para emissão de laudos de estabilidade?'
    },
    {
      label: '🌧️ Chuva Recente (7d)',
      prompt: 'Qual é o volume de chuva acumulado nos últimos 7 dias na Estação Itaminas e o impacto nas estruturas?'
    }
  ];

  // Enviar mensagem
  const handleSendMessage = async (customPrompt) => {
    const textToSend = (customPrompt || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInputText('');
    setIsLoading(true);

    try {
      // Contexto em tempo real do sistema para o Gemini
      const context = {
        structures,
        instruments,
        anomalies,
        pluviometria,
        stats,
        contratosTerceiros,
        ordensServico,
        clientes,
        coletas
      };

      const result = await cometApiService.sendMessage({
        prompt: textToSend,
        history: messages,
        context
      });

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: result.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: result.source,
        model: result.model,
        apiErrorNotice: result.apiErrorNotice
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Erro no chatbot Gemini:', err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: `Desculpe, ocorreu um erro temporário ao processar sua solicitação: ${err.message}. Você pode tentar novamente ou utilizar as opções diretas de navegação.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'local'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Executar Ação contida na resposta
  const handleExecuteAction = (actionType, param) => {
    if (actionType === 'NAVIGATE') {
      if (onNavigateTab) {
        onNavigateTab(param);
      }
    } else if (actionType === 'DOWNLOAD') {
      if (param === 'apk') {
        const link = document.createElement('a');
        link.href = 'https://github.com/Maycon97/MDSync---Mining-Geotechnical-Data/releases/latest/download/mdsync-geotecnia.apk';
        link.download = 'mdsync-geotecnia.apk';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else if (actionType === 'SELECT_STRUCT') {
      selectStructure(param);
      setSelectedStruct(param);
    }
  };

  // Renderizar o texto com botões interativos de ação
  const renderMessageContent = (msg) => {
    let raw = msg.text || '';

    // Extrair ações como [ACTION:NAVIGATE:mapa] ou [ACTION:DOWNLOAD:apk]
    const actionRegex = /\[ACTION:([A-Z_]+):([^\]]+)\]/g;
    const actions = [];
    let match;
    while ((match = actionRegex.exec(raw)) !== null) {
      actions.push({ type: match[1], param: match[2] });
    }

    // Remover tags de ação do texto visível
    const cleanText = raw.replace(actionRegex, '').trim();

    return (
      <div>
        <div style={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}>
          {cleanText.split('\n').map((line, lIdx) => {
            // Formatação simples de cabeçalhos e listas
            if (line.startsWith('### ')) {
              return <h4 key={lIdx} style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.6rem 0 0.3rem' }}>{line.replace('### ', '')}</h4>;
            }
            if (line.startsWith('## ')) {
              return <h3 key={lIdx} style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.8rem 0 0.4rem' }}>{line.replace('## ', '')}</h3>;
            }
            if (line.startsWith('- ') || line.startsWith('* ')) {
              return (
                <div key={lIdx} style={{ display: 'flex', gap: '0.4rem', margin: '0.2rem 0', paddingLeft: '0.25rem' }}>
                  <span style={{ color: 'var(--primary-accent)' }}>•</span>
                  <span>{renderBold(line.substring(2))}</span>
                </div>
              );
            }
            return <p key={lIdx} style={{ margin: line.trim() ? '0.35rem 0' : '0.15rem 0' }}>{renderBold(line)}</p>;
          })}
        </div>

        {/* Botões de Ações Interativas Executáveis */}
        {actions.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid var(--border-subtle)' }}>
            {actions.map((act, aIdx) => {
              let icon = <ExternalLink size={14} />;
              let label = `Ação: ${act.param}`;
              let btnClass = 'btn-secondary';

              if (act.type === 'NAVIGATE') {
                if (act.param === 'mapa') {
                  icon = <MapPin size={14} style={{ color: '#10b981' }} />;
                  label = 'Abrir Georreferenciamento (Mapa)';
                  btnClass = 'btn-primary';
                } else if (act.param === 'dashboard') {
                  icon = <LayoutDashboard size={14} style={{ color: '#0284c7' }} />;
                  label = 'Ir para Dashboard de Gráficos';
                  btnClass = 'btn-primary';
                } else if (act.param === 'campo') {
                  icon = <ClipboardEdit size={14} style={{ color: '#f59e0b' }} />;
                  label = 'Nova Coleta de Campo (Inspect)';
                } else if (act.param === 'piezometria') {
                  icon = <LineChart size={14} style={{ color: '#38bdf8' }} />;
                  label = 'Ver Piezometria & Cotas';
                } else if (act.param === 'vazao') {
                  icon = <Droplets size={14} style={{ color: '#06b6d4' }} />;
                  label = 'Ver Vazão & Vertedouros';
                } else if (act.param === 'laudo') {
                  icon = <FileText size={14} style={{ color: '#ec4899' }} />;
                  label = 'Emitir Laudo ANM 95/2022';
                } else if (act.param === 'home') {
                  icon = <Activity size={14} style={{ color: '#a855f7' }} />;
                  label = 'Ir para Página Inicial (Home)';
                } else if (act.param === 'coletas') {
                  icon = <ClipboardEdit size={14} style={{ color: '#f59e0b' }} />;
                  label = 'Ver Coletas de Campo';
                } else if (act.param === 'ordens_servico') {
                  icon = <Activity size={14} style={{ color: '#0284c7' }} />;
                  label = 'Ver Ordens de Serviço';
                } else if (act.param === 'contratos') {
                  icon = <Layers size={14} style={{ color: '#8b5cf6' }} />;
                  label = 'Ver Contratos Terceiros';
                } else if (act.param === 'clientes') {
                  icon = <Activity size={14} style={{ color: '#38bdf8' }} />;
                  label = 'Ver Clientes & Unidades';
                } else if (act.param === 'lotes_relatorios') {
                  icon = <FileText size={14} style={{ color: '#60a5fa' }} />;
                  label = 'Ver Lotes de Relatórios';
                } else if (act.param === '3d') {
                  icon = <Activity size={14} style={{ color: '#3b82f6' }} />;
                  label = 'Abrir Modelo 3D da Cava Jangada';
                }
              } else if (act.type === 'DOWNLOAD' && act.param === 'apk') {
                icon = <Download size={14} style={{ color: '#10b981' }} />;
                label = 'Baixar APK Android (mdsync-geotecnia.apk)';
                btnClass = 'btn-primary';
              } else if (act.type === 'SELECT_STRUCT') {
                icon = <Layers size={14} style={{ color: 'var(--primary-accent)' }} />;
                label = `Filtrar: ${act.param.replace('_', ' ')}`;
              }

              return (
                <button
                  key={aIdx}
                  onClick={() => handleExecuteAction(act.type, act.param)}
                  className={btnClass}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.78rem',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '8px'
                  }}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {msg.apiErrorNotice && (
          <div style={{ fontSize: '0.7rem', color: 'var(--geo-atencao)', marginTop: '0.5rem', fontStyle: 'italic' }}>
            {msg.apiErrorNotice}
          </div>
        )}
      </div>
    );
  };

  // Formatação de texto em negrito markdown (**texto**)
  const renderBold = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'var(--text-main)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Salvar Configurações de IA (CometAPI e Gemini)
  const handleSaveApiKey = () => {
    cometApiService.setApiKey(cometKeyInput);
    cometApiService.setModel(selectedModel);
    cometApiService.setBaseUrl(baseUrlInput);
    geminiService.setApiKey(geminiKeyInput);
    setKeySavedToast(true);
    setTimeout(() => setKeySavedToast(false), 3000);
    setApiKeyModalOpen(false);
  };

  // Limpar Conversa
  const handleClearChat = () => {
    setMessages([
      {
        id: 'reset',
        sender: 'assistant',
        text: 'Histórico da conversa limpo. Como posso ajudar com as estruturas e dados do complexo agora?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'local'
      }
    ]);
  };

  // ============================================================
  // CÁLCULO DO PARECER TÉCNICO FORMAL
  // ============================================================
  const structureObj = structures.find(s => s.id === selectedStruct);
  const structureName = selectedStruct === 'TODAS' ? 'Complexo Geotécnico Itaminas (Todas)' : (structureObj?.nome || selectedStruct);

  const relevantInstruments = useMemo(() => {
    if (selectedStruct === 'TODAS') return instruments;
    return instruments.filter(i => i.estrutura.replace(/\s+/g, '_') === selectedStruct || i.estrutura === selectedStruct);
  }, [instruments, selectedStruct]);

  const report = useMemo(() => {
    return aiGeotechService.generateStabilityReport({
      estrutura: structureName,
      instrumentos: relevantInstruments,
      leituras: readingsPiezometria,
      anomalias: anomalies,
      pluviometria
    });
  }, [structureName, relevantInstruments, readingsPiezometria, anomalies, pluviometria]);

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. BARRA SUPERIOR COM SELETOR DE MODO (CHATBOT GEMINI vs PARECER TÉCNICO) */}
      <div className="card-panel" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                SUPORTE GEOTINHO
              </h2>
            </div>
          </div>

          {/* Abas Alternadoras de Modo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setActiveView('chat')}
              className={activeView === 'chat' ? 'btn-primary' : 'btn-ghost'}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.45rem 0.9rem', borderRadius: '8px' }}
            >
              <Bot size={15} />
              <span>Chatbot Gemini IA</span>
            </button>
            <button
              onClick={() => setActiveView('parecer')}
              className={activeView === 'parecer' ? 'btn-primary' : 'btn-ghost'}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.45rem 0.9rem', borderRadius: '8px' }}
            >
              <FileText size={15} />
              <span>Parecer Técnico Oficial</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. VISUALIZAÇÃO A: CHATBOT GEMINI INTEGRADO                   */}
      {/* ============================================================ */}
      {activeView === 'chat' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Faixa de Status do Modelo e Ferramentas */}
          <div className="card-panel" style={{ padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', backgroundColor: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: (cometApiService.hasApiKey() || geminiService.hasApiKey()) ? 'var(--geo-normal)' : 'var(--text-muted)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: (cometApiService.hasApiKey() || geminiService.hasApiKey()) ? 'var(--geo-normal)' : '#94a3b8' }} />
                Motor: <strong style={{ color: 'var(--text-main)' }}>
                  {cometApiService.hasApiKey() 
                    ? `CometAPI (${cometApiService.getModel()})` 
                    : (geminiService.hasApiKey() ? 'Google Gemini 2.5 Flash' : 'Motor Heurístico Local Offline')}
                </strong>
              </span>
              <span style={{ color: 'var(--text-faint)' }}>|</span>
              <span style={{ color: 'var(--text-muted)' }}>
                Complexo: <strong>{instruments.length} instrumentos conectados</strong>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setApiKeyModalOpen(true)}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}
                title="Configurar chave de token da CometAPI e Gemini"
              >
                <Key size={13} style={{ color: 'var(--primary-accent)' }} />
                <span>{cometApiService.hasApiKey() ? `Token CometAPI Ativo` : (geminiService.hasApiKey() ? 'Gemini Ativo' : 'Configurar CometAPI (Token)')}</span>
              </button>
              <button
                onClick={handleClearChat}
                className="btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', padding: '0.35rem 0.65rem', color: 'var(--text-faint)' }}
                title="Limpar histórico do chat"
              >
                <Trash2 size={13} />
                <span>Limpar</span>
              </button>
            </div>
          </div>

          {/* Sugestões Rápidas de Ação */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', scrollbarWidth: 'none' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-faint)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Sparkles size={13} style={{ color: 'var(--primary-accent)' }} /> Sugestões:
            </span>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.prompt)}
                className="btn-secondary"
                style={{
                  fontSize: '0.72rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '16px',
                  whiteSpace: 'nowrap',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Área Principal de Mensagens */}
          <div className="card-panel" style={{
            minHeight: '440px',
            maxHeight: '560px',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '1.25rem',
            gap: '1rem',
            backgroundColor: 'var(--bg-surface)'
          }}>
            {messages.map(msg => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                    gap: '0.75rem',
                    maxWidth: '100%'
                  }}
                >
                  {!isUser && (
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0284c7, #8b5cf6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0,
                      marginTop: '2px',
                      boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
                    }}>
                      <Bot size={18} />
                    </div>
                  )}

                  <div style={{
                    maxWidth: isUser ? '75%' : '85%',
                    backgroundColor: isUser ? 'var(--primary-accent)' : 'var(--bg-secondary)',
                    color: isUser ? '#ffffff' : 'var(--text-main)',
                    padding: '0.9rem 1.15rem',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    border: isUser ? 'none' : '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-sm)',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.68rem', opacity: 0.8 }}>
                      <span style={{ fontWeight: 700 }}>
                        {isUser ? (currentUser?.nome || 'Você') : 'Gemini Geotecnia'}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {isUser ? (
                      <div style={{ lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                        {msg.text}
                      </div>
                    ) : (
                      renderMessageContent(msg)
                    )}
                  </div>

                  {isUser && (
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-accent)',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <User size={18} />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284c7, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  flexShrink: 0
                }}>
                  <RefreshCw size={16} className="animate-spin" />
                </div>
                <div style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '16px 16px 16px 4px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)'
                }}>
                  <span>Gemini analisando telemetria e gerando resposta...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Campo de Entrada de Texto do Chat */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="card-panel"
            style={{ padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite sua dúvida sobre o complexo, laudos ANM, Jangada ou tarefas do app/apk..."
              disabled={isLoading}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '0.875rem',
                color: 'var(--text-main)',
                padding: '0.4rem 0.5rem'
              }}
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1.15rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '8px'
              }}
            >
              <Send size={15} />
              <span>Enviar</span>
            </button>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. VISUALIZAÇÃO B: PARECER TÉCNICO OFICIAL (DOCUMENTO ANM)    */}
      {/* ============================================================ */}
      {activeView === 'parecer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Barra de Filtro de Estrutura e Ação de Impressão */}
          <div className="card-panel" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filtrar Estrutura do Parecer:</span>
              <select
                value={selectedStruct}
                onChange={(e) => {
                  setSelectedStruct(e.target.value);
                  selectStructure(e.target.value);
                }}
                className="form-select"
                style={{ fontSize: '0.825rem', fontWeight: 600, minWidth: '220px' }}
              >
                <option value="TODAS">Complexo Geral (8 Estruturas)</option>
                {structures.map(s => (
                  <option key={s.id} value={s.id}>{s.nome} ({s.totalInstrumentos} instrumentos)</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => window.print()}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', padding: '0.45rem 0.85rem' }}
            >
              <Printer size={16} />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>

          {/* DOCUMENTO ESTRUTURADO DO PARECER TÉCNICO */}
          <div className="card-panel" style={{
            padding: '2rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            {/* Cabeçalho do Relatório */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              borderBottom: '2px solid var(--border-medium)',
              paddingBottom: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  SISTEMA MDSYNC • PROTOCOLO DE SEGURANÇA GEOTÉCNICA
                </div>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                  {report.titulo}
                </h1>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Emissão: <strong>{report.dataEmissao}</strong> • Responsável da Sessão: <strong>{currentUser.nome}</strong> ({currentUser.registro})
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className={`badge-status ${report.classeAlerta}`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
                  {report.classificacao}
                </span>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: '4px' }}>
                  Conforme Portaria ANM nº 95/2022
                </div>
              </div>
            </div>

            {/* Resumo Métrico em Grade */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.75rem',
              backgroundColor: 'var(--bg-secondary)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Total de Instrumentos</div>
                <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800 }}>{report.resumoMetrico.totalInstrumentos}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Status Normal</div>
                <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--geo-normal)' }}>{report.resumoMetrico.instrumentosNormais}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Em Atenção</div>
                <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--geo-atencao)' }}>{report.resumoMetrico.instrumentosAtencao}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Em Emergência</div>
                <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--geo-emergencia)' }}>{report.resumoMetrico.instrumentosCriticos}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Chuva Recente (7d)</div>
                <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--geo-info)' }}>{report.resumoMetrico.pluviometria7d}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Anomalias Abertas</div>
                <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: report.resumoMetrico.anomaliasAbertas > 0 ? 'var(--geo-atencao)' : 'var(--text-main)' }}>
                  {report.resumoMetrico.anomaliasAbertas}
                </div>
              </div>
            </div>

            {/* Diagnóstico Geotécnico Automatizado */}
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} style={{ color: 'var(--primary-accent)' }} />
                1. Diagnóstico e Parecer Automatizado
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, textAlign: 'justify' }}>
                {report.diagnosticoTecnico}
              </p>
            </div>

            {/* Tabela de Instrumentos em Vigilância Especial */}
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={16} style={{ color: 'var(--geo-atencao)' }} />
                2. Instrumentos Sob Vigilância Especial ({report.pontosAtencao.length})
              </h3>
              {report.pontosAtencao.length > 0 ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Instrumento</th>
                        <th>Seção</th>
                        <th>Status</th>
                        <th>Última Cota Medida</th>
                        <th>Limite de Atenção</th>
                        <th>Limite de Emergência</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.pontosAtencao.map((pt, idx) => (
                        <tr key={idx}>
                          <td className="font-mono" style={{ fontWeight: 700, color: 'var(--primary-accent)' }}>{pt.instrumento}</td>
                          <td>{pt.secao}</td>
                          <td>
                            <span className={`badge-status ${pt.status === 'EMERGÊNCIA' ? 'badge-emergencia' : 'badge-atencao'}`}>
                              {pt.status}
                            </span>
                          </td>
                          <td className="font-mono" style={{ fontWeight: 700 }}>{pt.ultimaCota}</td>
                          <td className="font-mono">{pt.limiteAtencao}</td>
                          <td className="font-mono" style={{ color: 'var(--geo-emergencia)' }}>{pt.limiteEmergencia}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{
                  padding: '0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--geo-normal-bg)',
                  color: 'var(--geo-normal)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CheckCircle2 size={18} />
                  <span>Nenhum instrumento ultrapassou os limites de controle para a estrutura selecionada.</span>
                </div>
              )}
            </div>

            {/* Ações e Recomendações Técnicas */}
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} style={{ color: 'var(--geo-normal)' }} />
                3. Plano de Ação & Recomendações Geotécnicas
              </h3>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {report.acoesRecomendadas.map((acao, idx) => (
                  <li key={idx} style={{ marginBottom: '0.35rem' }}>
                    {acao}
                  </li>
                ))}
              </ul>
            </div>

            {/* Assinatura Digital do Laudo */}
            <div style={{
              marginTop: '1rem',
              paddingTop: '1.5rem',
              borderTop: '1px dashed var(--border-medium)',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: 'var(--text-faint)'
            }}>
              <div>
                <div>Documento gerado automaticamente pelo motor de IA do <strong>MDSync</strong></div>
                <div>Itaminas Mineração S.A. • Gerência de Geotecnia e Segurança de Barragens</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>Hash de Integridade: <span className="font-mono">8F3E-91C2-BD07</span></div>
                <div>Status: <strong>Válido para Acompanhamento Interno</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. MODAL DE CONFIGURAÇÃO DA COMETAPI & MOTOR GEOTINHO         */}
      {/* ============================================================ */}
      {apiKeyModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setApiKeyModalOpen(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '540px', padding: '1.75rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
              }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Motor de Inteligência — Geotinho
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>
                  Conecte seu token da <strong>CometAPI</strong> (OpenAI-compatible) ou chave Gemini
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              As credenciais são armazenadas de forma segura no armazenamento local (localStorage) do seu navegador ou dispositivo Android/iOS e enviadas diretamente aos servidores da API em tempo real.
            </p>

            {/* 1. Campo Principal: Token da CometAPI */}
            <div style={{ marginBottom: '1.15rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  CometAPI Key / Token (Recomendado):
                </label>
                <a 
                  href="https://www.cometapi.com/console/token" 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ fontSize: '0.72rem', color: 'var(--primary-accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <span>Obter Token</span>
                  <ExternalLink size={12} />
                </a>
              </div>
              <input
                type="password"
                value={cometKeyInput}
                onChange={(e) => setCometKeyInput(e.target.value)}
                placeholder="Cole seu token CometAPI aqui..."
                className="form-input"
                style={{ width: '100%', fontSize: '0.85rem' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-faint)', marginBottom: '0.25rem' }}>
                    Modelo CometAPI:
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', fontSize: '0.78rem', padding: '0.4rem 0.6rem' }}
                  >
                    {AVAILABLE_MODELS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-faint)', marginBottom: '0.25rem' }}>
                    Base URL:
                  </label>
                  <input
                    type="text"
                    value={baseUrlInput}
                    onChange={(e) => setBaseUrlInput(e.target.value)}
                    placeholder="https://api.cometapi.com/v1"
                    className="form-input"
                    style={{ width: '100%', fontSize: '0.78rem', padding: '0.4rem 0.6rem' }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Campo Secundário: Fallback Google Gemini */}
            <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Chave Gemini API (Fallback de Backup):
                </label>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ fontSize: '0.7rem', color: 'var(--primary-accent)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <span>Google AI Studio</span>
                  <ExternalLink size={11} />
                </a>
              </div>
              <input
                type="password"
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
                placeholder="Opcional: AIzaSy..."
                className="form-input"
                style={{ width: '100%', fontSize: '0.8rem' }}
              />
            </div>

            {/* Botões de Ação */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {(cometApiService.hasApiKey() || geminiService.hasApiKey()) && (
                <button
                  type="button"
                  onClick={() => {
                    cometApiService.clearApiKey();
                    geminiService.clearApiKey();
                    setCometKeyInput('');
                    setGeminiKeyInput('');
                    setApiKeyModalOpen(false);
                  }}
                  className="btn-ghost"
                  style={{ color: 'var(--geo-emergencia)', fontSize: '0.78rem' }}
                >
                  Limpar Todas
                </button>
              )}
              
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                <button
                  type="button"
                  onClick={() => setApiKeyModalOpen(false)}
                  className="btn-secondary"
                  style={{ fontSize: '0.82rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="btn-primary"
                  style={{ fontSize: '0.82rem' }}
                >
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
