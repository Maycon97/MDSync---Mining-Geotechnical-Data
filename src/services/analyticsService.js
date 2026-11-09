/**
 * MDSync Analytics & Geotechnical Telemetry Service
 * Suporte a Google Analytics 4 (GA4), GTM (Google Tag Manager) e buffer de eventos offline
 */

const GA_MEASUREMENT_ID = 'G-MDSYNCGEOT';

class AnalyticsService {
  constructor() {
    this.measurementId = GA_MEASUREMENT_ID;
    this.initialized = false;
    this.eventQueue = [];
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.flushQueue();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  /**
   * Inicializa o dataLayer e gtag de forma resiliente
   */
  init(customMeasurementId) {
    if (customMeasurementId) {
      this.measurementId = customMeasurementId;
    }

    if (typeof window === 'undefined') return;

    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
    }

    window.gtag('js', new Date());
    window.gtag('config', this.measurementId, {
      send_page_view: false, // Controlado manualmente por SPA
      cookie_flags: 'SameSite=None;Secure'
    });

    this.initialized = true;
    this.flushQueue();
  }

  /**
   * Envia evento para o Google Analytics ou guarda em buffer se offline
   */
  trackEvent(eventName, eventParams = {}) {
    const payload = {
      ...eventParams,
      timestamp: new Date().toISOString(),
      platform: 'MDSync-Web'
    };

    if (typeof window !== 'undefined' && window.gtag && this.isOnline) {
      try {
        window.gtag('event', eventName, payload);
      } catch (err) {
        console.warn('[MDSync Analytics] Falha ao enviar evento:', err);
      }
    } else {
      // Buffer para envio posterior
      this.eventQueue.push({ eventName, payload });
      if (this.eventQueue.length > 100) this.eventQueue.shift();
    }
  }

  /**
   * Dispara visualização de página / módulo SPA
   */
  trackPageView(pageTitle, pagePath) {
    this.trackEvent('page_view', {
      page_title: pageTitle,
      page_location: typeof window !== 'undefined' ? window.location.href : '',
      page_path: pagePath || (typeof window !== 'undefined' ? window.location.pathname : '/')
    });
  }

  /**
   * Rastreia seleção de estrutura geotécnica
   */
  trackStructureSelection(structureId, structureName) {
    this.trackEvent('geotech_structure_select', {
      structure_id: structureId,
      structure_name: structureName,
      event_category: 'Geotechnical Navigation'
    });
  }

  /**
   * Rastreia emissão/exportação de relatórios regulatórios (ANM / FEAM)
   */
  trackReportExport(reportType, format, structureCount = 1) {
    this.trackEvent('geotech_report_export', {
      report_type: reportType,
      format: format, // 'A4_PDF' | 'ANM_CSV' | 'XLSX'
      structure_count: structureCount,
      event_category: 'Compliance Reporting'
    });
  }

  /**
   * Rastreia sincronização offline do túnel
   */
  trackSyncOperation(operation, count, status = 'success') {
    this.trackEvent('geotech_offline_sync', {
      sync_operation: operation,
      item_count: count,
      sync_status: status,
      event_category: 'Data Tunnel'
    });
  }

  /**
   * Esvazia a fila de eventos após reconexão
   */
  flushQueue() {
    if (typeof window === 'undefined' || !window.gtag || !this.isOnline) return;
    while (this.eventQueue.length > 0) {
      const item = this.eventQueue.shift();
      try {
        window.gtag('event', item.eventName, item.payload);
      } catch (e) {
        break;
      }
    }
  }
}

export const analyticsService = new AnalyticsService();

