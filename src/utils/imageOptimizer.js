/**
 * Utilitário de Otimização e Compressão de Imagens — MDSync Geotecnia
 * 
 * Funcionalidades:
 * - Redimensiona imagens proporcionalmente para dimensões padrão (ex: 320x320 para avatares).
 * - Converte e comprime para JPEG (qualidade 0.82 padrão).
 * - Reduz arquivos de 2-5 MB para 20-40 KB (redução de ~98%), evitando QuotaExceededError no LocalStorage.
 * - Suporta File, Blob e strings Base64 DataURL.
 * - Fallback gracioso para ambientes de teste e servidores sem Canvas 2D.
 */

export async function compressImage(fileOrDataUrl, {
  maxWidth = 320,
  maxHeight = 320,
  quality = 0.82,
  outputType = 'image/jpeg'
} = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    if (typeof fileOrDataUrl === 'string') return fileOrDataUrl;
    return '';
  }

  return new Promise((resolve, reject) => {
    const processDataUrl = (dataUrl) => {
      if (!dataUrl || typeof dataUrl !== 'string') {
        resolve('');
        return;
      }

      // Se a string já for minúscula e não for imagem crua, pode retornar
      if (dataUrl.length < 2048) {
        resolve(dataUrl);
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width || maxWidth;
          let height = img.height || maxHeight;

          if (width > height && width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }

          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Em ambientes sem renderizador 2D (ex: jsdom sem node-canvas)
            resolve(dataUrl);
            return;
          }

          // Preenche fundo com branco se for JPEG para evitar artefatos pretos em PNGs transparentes
          if (outputType === 'image/jpeg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL(outputType, quality);
          resolve(compressed);
        } catch (err) {
          console.warn('[ImageOptimizer] Exceção ao comprimir no canvas, mantendo original:', err);
          resolve(dataUrl);
        }
      };

      img.onerror = () => {
        resolve(dataUrl);
      };

      img.src = dataUrl;
    };

    if (typeof fileOrDataUrl === 'string') {
      processDataUrl(fileOrDataUrl);
    } else if (fileOrDataUrl instanceof Blob || (typeof File !== 'undefined' && fileOrDataUrl instanceof File)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        processDataUrl(e.target?.result);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrDataUrl);
    } else {
      resolve('');
    }
  });
}

