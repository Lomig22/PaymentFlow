// Utilitaire pour générer une image croppée à partir d'un fichier source et d'une zone crop (pixels)
// Source : https://codesandbox.io/s/react-easy-crop-with-cropped-output-lkh2v?file=/src/cropImage.js

export default function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No 2d context');
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        120,
        120
      );
      canvas.toBlob((blob) => {
        if (!blob) return reject('Canvas is empty');
        const fileUrl = window.URL.createObjectURL(blob);
        resolve(fileUrl);
      }, 'image/png');
    };
    image.onerror = (e) => reject(e);
  });
}
