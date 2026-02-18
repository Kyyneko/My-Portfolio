'use client';
import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { ZoomIn, ZoomOut, RotateCw, Check, X } from 'lucide-react';

/**
 * Helper: create an Image element from src
 */
function createImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = (err) => reject(err);
        image.src = url;
    });
}

/**
 * Get the rotated bounding-box size
 */
function getRotatedSize(width, height, rotation) {
    const rad = (rotation * Math.PI) / 180;
    return {
        width: Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
        height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
    };
}

/**
 * Creates a cropped (and rotated) image from the source using canvas.
 */
async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Calculate rotated bounding box
    const rotSize = getRotatedSize(image.width, image.height, rotation);

    // Set canvas to the rotated dimensions
    canvas.width = rotSize.width;
    canvas.height = rotSize.height;

    // Translate and rotate around center
    ctx.translate(rotSize.width / 2, rotSize.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-image.width / 2, -image.height / 2);

    // Draw the rotated image
    ctx.drawImage(image, 0, 0);

    // Now extract the cropped area
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');
    croppedCanvas.width = pixelCrop.width;
    croppedCanvas.height = pixelCrop.height;

    croppedCtx.drawImage(
        canvas,
        pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
        0, 0, pixelCrop.width, pixelCrop.height
    );

    return new Promise((resolve) => {
        croppedCanvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
    });
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel, aspect = 1, cropShape = 'round' }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropChange = useCallback((location) => setCrop(location), []);
    const onZoomChange = useCallback((z) => setZoom(z), []);

    const onCropAreaComplete = useCallback((_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleConfirm = async () => {
        if (!croppedAreaPixels) return;
        const blob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
        onCropComplete(blob);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 250,
            display: 'flex', flexDirection: 'column',
            animation: 'fadeIn 0.2s ease',
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem 1.5rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}>
                <h3 style={{ color: '#fff', margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                    Adjust Photo
                </h3>
                <button onClick={onCancel} style={{
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
                    cursor: 'pointer', padding: '0.25rem',
                }}>
                    <X size={20} />
                </button>
            </div>

            {/* Crop Area */}
            <div style={{ flex: 1, position: 'relative', minHeight: '300px' }}>
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={aspect}
                    cropShape={cropShape}
                    showGrid={false}
                    onCropChange={onCropChange}
                    onZoomChange={onZoomChange}
                    onCropComplete={onCropAreaComplete}
                    style={{
                        containerStyle: { background: '#111' },
                        cropAreaStyle: {
                            border: '2px solid rgba(96,165,250,0.8)',
                            boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
                        },
                    }}
                />
            </div>

            {/* Controls */}
            <div style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
            }}>
                {/* Zoom slider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ZoomOut size={16} style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
                    <input
                        type="range"
                        min={1} max={3} step={0.05}
                        value={zoom}
                        onChange={e => setZoom(Number(e.target.value))}
                        style={{
                            flex: 1, height: '4px', appearance: 'none',
                            background: 'rgba(255,255,255,0.2)', borderRadius: '4px',
                            outline: 'none', cursor: 'pointer',
                            accentColor: '#60a5fa',
                        }}
                    />
                    <ZoomIn size={16} style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />

                    <button onClick={() => setRotation(r => (r + 90) % 360)} style={{
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                        color: 'rgba(255,255,255,0.7)', borderRadius: '8px',
                        padding: '0.4rem 0.6rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        fontSize: '0.75rem', fontWeight: 500, marginLeft: '0.5rem',
                    }}>
                        <RotateCw size={14} /> Rotate
                    </button>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button onClick={onCancel} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button onClick={handleConfirm} className="btn btn-primary">
                        <Check size={16} /> Apply
                    </button>
                </div>
            </div>
        </div>
    );
}

