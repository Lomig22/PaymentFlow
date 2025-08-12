import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import getCroppedImg from '../../utils/cropImageUtils'; // À créer si besoin

interface SignatureImageCropperProps {
  image: string | null;
  onChange: (croppedImg: string) => void;
  aspect?: number; // ratio (ex: 4/3, 1/1)
}

const SignatureImageCropper: React.FC<SignatureImageCropperProps> = ({ image, onChange, aspect = 1 }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    if (!image || !croppedAreaPixels) return;
    const croppedImg = await getCroppedImg(image, croppedAreaPixels);
    setCroppedImage(croppedImg);
    onChange(croppedImg);
  }, [image, croppedAreaPixels, onChange]);

  return (
    <div>
      <div style={{ position: 'relative', width: '100%', height: 200, background: '#f3f4f6', borderRadius: 8 }}>
        {image && (
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        )}
      </div>
      <div className="flex items-center gap-4 my-2">
        <span>Zoom</span>
        <Slider
          value={zoom}
          min={1}
          max={3}
          step={0.01}
          onChange={(_, z) => setZoom(Number(z))}
          style={{ width: 120 }}
        />
      </div>
      <Button variant="contained" color="primary" onClick={showCroppedImage} disabled={!image}>
        Rogner et enregistrer
      </Button>
      {croppedImage && (
        <div className="mt-4">
          <div className="text-sm mb-1">Aperçu logo carré :</div>
          <img src={croppedImage} alt="Logo carré preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
        </div>
      )}
    </div>
  );
};

export default SignatureImageCropper;
