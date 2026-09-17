import { useState } from 'react';

export const useCameraPhoto = () => {
  const [photoData, setPhotoData] = useState(null);
  const [photoName, setPhotoName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setPhotoName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar para tamanho otimizado (máx 1200px largura/altura)
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Comprimir para JPEG 80% qualidade
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
        setPhotoData(compressedBase64);
        setIsProcessing(false);
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setPhotoData(null);
    setPhotoName('');
  };

  return { photoData, photoName, isProcessing, handleFileUpload, clearPhoto, setPhotoData };
};
