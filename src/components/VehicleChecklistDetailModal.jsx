import React from 'react';
import { 
  X, 
  Truck, 
  ExternalLink, 
  Printer, 
  MapPin, 
  Gauge, 
  User, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  ShieldCheck,
  ClipboardList,
  PenTool
} from 'lucide-react';

export const VehicleChecklistDetailModal = ({ item, onClose }) => {
  if (!item) return null;

  const securityItems = item.itensSeguranca || {};
  const generalItems = item.condicoesGerais || {};

  const securityLabels = {
    aguaLimpador: 'Água no limpador',
    bandeirola: 'Bandeirola de sinalização',
    buzina: 'Buzina',
    cintosSeguranca: 'Cintos de segurança',
    documentacao: 'Documentação válida (CRLV + CNH + Credencial)',
    freios: 'Freios',
    giroflex: 'Giroflex',
    pneusEstepe: 'Pneus + Estepe',
    kitSinalizacao: 'Kit de sinalização (Macaco, chave de roda, triângulo)'
  };

  const generalLabels = {
    calibragemPneus: 'Calibragem dos pneus',
    iluminacaoSinalizacao: 'Iluminação e sinalização (faróis, setas, freio, ré e lanternas)',
    latariaPintura: 'Lataria + Pintura',
    limpezaGeral: 'Limpeza geral',
    nivelOleoMotor: 'Nível do óleo do motor',
    nivelAguaArrefecimento: 'Nível de água/líquido de arrefecimento',
    parabrisa: 'Para-brisa',
    vazamentosAparentes: 'Vazamentos aparentes'
  };

  const getStatusBadge = (val) => {
    if (val === 'Crítico') {
      return (
        <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          Crítico
        </span>
      );
    }
    if (val === 'Atenção') {
      return (
        <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          Atenção
        </span>
      );
    }
    return (
      <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        OK
      </span>
    );
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '850px', maxHeight: '92vh', overflowY: 'auto', padding: '2rem' }}
      >
        {/* Header do Modal */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '2px solid var(--border-medium)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-accent)', letterSpacing: '0.05em' }}>
              ITAMINAS COMÉRCIO DE MINÉRIOS S.A • CHECKLIST VEICULAR
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Truck size={24} style={{ color: 'var(--primary-accent)' }} />
              {item.placa} — {item.modeloVeiculo || 'Veículo Operacional'}
            </h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              ID: <strong className="font-mono">{item.id}</strong> • Condutor: <strong>{item.condutor}</strong> • Data: <strong>{item.data} às {item.hora}</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className={`badge-status ${item.badgeClass || 'badge-normal'}`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
              {item.status || 'LIBERADO'}
            </span>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '4px' }}>
              Survey123 Oficial Itaminas
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem' }}>
          {/* Cartões Rápidos: Odômetro, GPS, Status */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>Hodômetro (km atual)</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                <Gauge size={20} style={{ color: 'var(--primary-accent)' }} />
                <span>{item.hod_metro_km_atual?.toLocaleString('pt-BR')} km</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>Coordenadas GPS</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '4px' }}>
                <MapPin size={18} style={{ color: '#10b981' }} />
                <span className="font-mono">{item.lat?.toFixed(5)}, {item.lon?.toFixed(5)}</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>Local da Inspeção</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
                {item.localizacaoNome || 'Mina Sarzedo / Barragens'}
              </div>
            </div>
          </div>

          {/* Seção 1: Itens de Segurança Obrigatório */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} style={{ color: 'var(--primary-accent)' }} />
              Itens de Segurança Obrigatório (Página 2)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.6rem' }}>
              {Object.entries(securityLabels).map(([key, label]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.75rem', backgroundColor: 'var(--bg-panel)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>{label}</span>
                  {getStatusBadge(securityItems[key] || 'OK')}
                </div>
              ))}
            </div>
          </div>

          {/* Seção 2: Condições Gerais */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ClipboardList size={18} style={{ color: 'var(--primary-accent)' }} />
              Condições Gerais do Veículo (Página 3)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.6rem' }}>
              {Object.entries(generalLabels).map(([key, label]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.75rem', backgroundColor: 'var(--bg-panel)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>{label}</span>
                  {getStatusBadge(generalItems[key] || 'OK')}
                </div>
              ))}
            </div>
          </div>

          {/* Observações e Descrição */}
          {item.descreva_aqui && (
            <div style={{ backgroundColor: 'rgba(2, 132, 199, 0.06)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(2, 132, 199, 0.2)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-accent)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Observações e Inconformidades Declaradas:
              </div>
              <div style={{ color: 'var(--text-main)', lineHeight: 1.5, fontSize: '0.82rem' }}>
                "{item.descreva_aqui}"
              </div>
            </div>
          )}

          {/* Registro Fotográfico (Painel e Evidências) */}
          {(item.registroPainelUrl || item.registroFotosSeguranca || item.registroFotosCondicoes || item.registrosComplementares) && (
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.6rem' }}>
                Registros Fotográficos Anexados
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {item.registroPainelUrl && (
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', marginBottom: '2px' }}>Foto do Painel (km)</div>
                    <img src={item.registroPainelUrl} alt="Painel" style={{ maxWidth: '160px', maxHeight: '110px', borderRadius: '6px', border: '1px solid var(--border-medium)', objectFit: 'cover' }} />
                  </div>
                )}
                {item.registroFotosSeguranca && (
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', marginBottom: '2px' }}>Itens de Segurança</div>
                    <img src={item.registroFotosSeguranca} alt="Segurança" style={{ maxWidth: '160px', maxHeight: '110px', borderRadius: '6px', border: '1px solid var(--border-medium)', objectFit: 'cover' }} />
                  </div>
                )}
                {item.registroFotosCondicoes && (
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', marginBottom: '2px' }}>Condições Gerais</div>
                    <img src={item.registroFotosCondicoes} alt="Condições" style={{ maxWidth: '160px', maxHeight: '110px', borderRadius: '6px', border: '1px solid var(--border-medium)', objectFit: 'cover' }} />
                  </div>
                )}
                {item.registrosComplementares && (
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', marginBottom: '2px' }}>Complementar</div>
                    <img src={item.registrosComplementares} alt="Complementar" style={{ maxWidth: '160px', maxHeight: '110px', borderRadius: '6px', border: '1px solid var(--border-medium)', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assinatura Digital do Condutor */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>
                Assinatura do Condutor Responsável
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                {item.condutor}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Itaminas Comércio de Minérios S.A
              </div>
            </div>

            {item.assinatura && item.assinatura.startsWith('data:image') ? (
              <div style={{ backgroundColor: '#ffffff', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border-medium)' }}>
                <img src={item.assinatura} alt="Assinatura" style={{ maxHeight: '65px', maxWidth: '200px' }} />
              </div>
            ) : (
              <div style={{ padding: '0.5rem 1rem', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 700, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <PenTool size={14} /> Assinatura Digital Verificada
              </div>
            )}
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.75rem' }}>
          <a
            href={item.linkSurvey || 'https://arcg.is/0DuT4L1'}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ExternalLink size={14} style={{ color: 'var(--primary-accent)' }} />
            <span>Abrir no ArcGIS Survey123 (https://arcg.is/0DuT4L1)</span>
          </a>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => window.print()}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Printer size={14} />
              <span>Imprimir Ficha</span>
            </button>

            <button
              onClick={onClose}
              className="btn-primary"
              style={{ fontSize: '0.78rem' }}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
