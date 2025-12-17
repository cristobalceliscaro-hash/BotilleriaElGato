import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor() { }

  /**
   * Redimensiona y recorta la imagen al tamaño especificado
   * @param dataUrl Imagen en formato DataUrl
   * @param targetWidth Ancho objetivo
   * @param targetHeight Alto objetivo
   * @returns Promise con la imagen procesada en DataUrl
   */
  async cropAndResize(dataUrl: string, targetWidth: number = 400, targetHeight: number = 300): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('No se pudo obtener el contexto del canvas'));
            return;
          }

          // Calcular el recorte manteniendo la relación de aspecto
          const aspectRatio = targetWidth / targetHeight;
          let sourceWidth = img.width;
          let sourceHeight = img.height;
          let sourceX = 0;
          let sourceY = 0;

          const currentRatio = img.width / img.height;

          if (currentRatio > aspectRatio) {
            // Imagen más ancha: recortar los lados
            sourceWidth = img.height * aspectRatio;
            sourceX = (img.width - sourceWidth) / 2;
          } else {
            // Imagen más alta: recortar arriba/abajo
            sourceHeight = img.width / aspectRatio;
            sourceY = (img.height - sourceHeight) / 2;
          }

          // Configurar tamaño del canvas
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          // Dibujar y recortar
          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            targetWidth,
            targetHeight
          );

          // Convertir a DataUrl con compresión
          const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(croppedDataUrl);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };

      img.src = dataUrl;
    });
  }

  /**
   * Comprime la imagen sin cambiar dimensiones
   * @param dataUrl Imagen en formato DataUrl
   * @param quality Calidad de compresión (0-1)
   * @returns Promise con la imagen comprimida
   */
  async compressImage(dataUrl: string, quality: number = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('No se pudo obtener el contexto del canvas'));
            return;
          }

          ctx.drawImage(img, 0, 0);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };

      img.src = dataUrl;
    });
  }

  /**
   * Obtiene información de la imagen
   */
  async getImageInfo(dataUrl: string): Promise<{ width: number; height: number; size: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        const sizeInBytes = dataUrl.length * 0.75; // Aproximado
        resolve({
          width: img.width,
          height: img.height,
          size: sizeInBytes
        });
      };

      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };

      img.src = dataUrl;
    });
  }
}
