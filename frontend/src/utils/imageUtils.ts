const TIPOS_MIME_PERMITIDOS = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_TAMANO_ORIGINAL_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_BASE64_BYTES = 350 * 1024; // 350 KB

const exportarCanvasOptimo = (
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  width: number,
  height: number,
  calidad: number
): string => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Tu navegador no permite procesar imágenes en este momento.');
  }

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const webpDataUrl = canvas.toDataURL('image/webp', calidad);
  if (webpDataUrl.startsWith('data:image/webp')) {
    return webpDataUrl;
  }

  // Fallback automático a JPEG si el navegador no soporta codificación WebP en Canvas
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', calidad);
};

// Comprime una imagen a WebP (o JPEG en fallback), validando formato MIME, peso de entrada (<=10 MB) y salida (<350 KB)
export const comprimirImagenMultimedia = (
  archivo: File,
  maxDim = 560,
  calidad = 0.78
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!TIPOS_MIME_PERMITIDOS.has(archivo.type)) {
      reject(
        new Error('Formato no permitido. Selecciona una imagen en formato JPG, PNG o WebP.')
      );
      return;
    }

    if (archivo.size > MAX_TAMANO_ORIGINAL_BYTES) {
      reject(
        new Error('La imagen seleccionada supera el tamaño máximo permitido de 10 MB.')
      );
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
    reader.onload = (evento) => {
      const img = new Image();
      img.onerror = () =>
        reject(new Error('El archivo seleccionado no contiene una imagen válida.'));
      img.onload = () => {
        try {
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

          let resultadoBase64 = exportarCanvasOptimo(canvas, img, width, height, calidad);

          if (resultadoBase64.length >= MAX_BASE64_BYTES) {
            resultadoBase64 = exportarCanvasOptimo(canvas, img, width, height, 0.6);
          }

          if (resultadoBase64.length >= MAX_BASE64_BYTES) {
            reject(
              new Error(
                'La imagen sigue superando los 350 KB tras comprimirla. Selecciona una fotografía más ligera o recortada.'
              )
            );
            return;
          }

          resolve(resultadoBase64);
        } catch (err) {
          reject(
            err instanceof Error ? err : new Error('No se pudo comprimir la imagen seleccionada.')
          );
        }
      };

      if (typeof evento.target?.result === 'string') {
        img.src = evento.target.result;
      } else {
        reject(new Error('No se pudo procesar la imagen seleccionada.'));
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
