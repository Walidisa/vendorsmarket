"use client";

import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../lib/cropImage";

export function ImageCropper({ file, aspect = 1, onCancel, onCropped }) {
  const [imageUrl, setImageUrl] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = (_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleConfirm = async () => {
    if (!imageUrl || !croppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImg(imageUrl, croppedAreaPixels);
      const ext = (file?.name || "image").split(".").pop();
      const croppedFile = new File([croppedBlob], `cropped.${ext}`, { type: croppedBlob.type || file?.type || "image/jpeg" });
      onCropped(croppedFile);
    } catch (e) {
      onCancel();
    }
  };

  if (!file) return null;

  return (
    <div className="crop-overlay">
      <div className="crop-dialog">
        <div className="cropper-wrapper">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="crop-actions">
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
          <div className="crop-buttons">
            <button type="button" className="rating-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className="rating-confirm" onClick={handleConfirm}>
              Crop & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
