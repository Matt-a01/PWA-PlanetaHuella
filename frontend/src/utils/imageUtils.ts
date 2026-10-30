// Comprime una imagen seleccionada desde la galería/multimedia a formato Base64 optimizado para MongoDB
export const comprimirImagenMultimedia = (
  archivo: File,
  maxDim = 700,
  calidad = 0.82
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
    reader.onload = (evento) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagen no válido.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

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
        ctx?.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', calidad));
      };
      if (typeof evento.target?.result === 'string') {
        img.src = evento.target.result;
      } else {
        reject(new Error('No se pudo procesar la imagen.'));
      }
    };
    reader.readAsDataURL(archivo);
  });
};

// Mejora automáticamente la resolución y centrado de imágenes del catálogo provenientes de Unsplash
export const mejorarCalidadImagenUrl = (url?: string): string => {
  if (!url || !url.trim()) return '';
  const limpia = url.trim();
  if (limpia.includes('images.unsplash.com')) {
    return limpia
      .replace(/([?&])w=\d+/g, '$1w=700')
      .replace(/([?&])q=\d+/g, '$1q=85');
  }
  return limpia;
};
