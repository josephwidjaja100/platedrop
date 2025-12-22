import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Move } from 'lucide-react';

interface PhotoEditorProps {
  imageUrl: string;
  onSave: (croppedImage: File) => void;
  onCancel: () => void;
}

const PhotoEditor: React.FC<PhotoEditorProps> = ({ imageUrl, onSave, onCancel }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Load and initialize image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      setImageDimensions({ width: img.width, height: img.height });
      
      // Calculate initial scale to fit the crop area
      const cropSize = 280; // Size of the crop area
      const minScale = Math.max(cropSize / img.width, cropSize / img.height);
      setScale(minScale * 1.1); // Add 10% padding
      setImageLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging, dragStart]);

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScale(parseFloat(e.target.value));
  };

  const handleSave = () => {
    if (!imageRef.current || !canvasRef.current || !previewRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const outputSize = 1000;
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Get the crop area dimensions
    const cropSize = 280;

    // Calculate the scaling factor from preview to output
    const scaleFactor = outputSize / cropSize;

    // Clear and prepare canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outputSize, outputSize);

    // Calculate image dimensions in the preview
    const imgWidth = imageDimensions.width * scale;
    const imgHeight = imageDimensions.height * scale;

    // The image is positioned with its center at (cropSize/2 + position.x, cropSize/2 + position.y)
    // We need to draw it so that what's visible in the crop area appears in the output
    const imgCenterX = cropSize / 2 + position.x;
    const imgCenterY = cropSize / 2 + position.y;

    // Calculate where the top-left of the image should be on the output canvas
    const outputImgX = (imgCenterX - imgWidth / 2) * scaleFactor;
    const outputImgY = (imgCenterY - imgHeight / 2) * scaleFactor;

    // Draw the image
    ctx.drawImage(
      imageRef.current,
      outputImgX,
      outputImgY,
      imgWidth * scaleFactor,
      imgHeight * scaleFactor
    );

    // Convert to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'profile-photo.jpg', { 
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        onSave(file);
      }
    }, 'image/jpeg', 0.92);
  };

  const minScale = imageDimensions.width > 0 
    ? Math.max(280 / imageDimensions.width, 280 / imageDimensions.height)
    : 0.1;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4"
      style={{ fontFamily: 'Merriweather, serif' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">crop photo</h2>
            <p className="text-xs text-gray-600 mt-0.5">drag and zoom</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/70 rounded-full transition-all duration-200"
            aria-label="Close editor"
          >
            <X size={18} className="text-gray-700" />
          </button>
        </div>

        {/* Preview Area */}
        <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100">
          <div
            ref={previewRef}
            className="relative mx-auto bg-white rounded-xl shadow-xl overflow-hidden"
            style={{ 
              width: '280px', 
              height: '280px',
              touchAction: 'none'
            }}
            onPointerDown={handlePointerDown}
          >
            {imageLoaded ? (
              <>
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: `${imageDimensions.width * scale}px`,
                    height: `${imageDimensions.height * scale}px`,
                    transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    userSelect: 'none',
                  }}
                >
                  <img
                    src={imageUrl}
                    alt="Crop preview"
                    draggable={false}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
                
                {/* Crop overlay guide */}
                <div className="absolute inset-0 pointer-events-none">
                  <svg width="100%" height="100%" className="absolute inset-0">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    <circle cx="50%" cy="50%" r="4" fill="white" opacity="0.6"/>
                  </svg>
                </div>

                {/* Corner guides */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/60"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/60"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/60"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/60"></div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-gray-700 rounded-full"></div>
              </div>
            )}
          </div>

          {/* Zoom Slider */}
          <div className="mt-4 px-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-700 w-10">zoom</span>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min={minScale}
                  max={minScale * 3}
                  step={0.01}
                  value={scale}
                  onChange={handleScaleChange}
                  className="w-full h-2 bg-gray-300 rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #1f2937 0%, #1f2937 ${((scale - minScale) / (minScale * 3 - minScale)) * 100}%, #d1d5db ${((scale - minScale) / (minScale * 3 - minScale)) * 100}%, #d1d5db 100%)`
                  }}
                />
              </div>
              <span className="text-xs font-medium text-gray-700 w-10 text-right">
                {Math.round(scale / minScale * 100)}%
              </span>
            </div>
          </div>

          {/* Helper text */}
          <div className="mt-3 flex items-center justify-center gap-2 text-gray-600">
            <Move size={14} />
            <p className="text-xs">drag to adjust</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="flex-1 px-5 py-2.5 bg-white text-gray-800 font-bold rounded-full hover:bg-gray-100 transition-all duration-200 border-2 border-gray-300 text-sm"
          >
            cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!imageLoaded}
            className="flex-1 px-5 py-2.5 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-lg"
          >
            <Check size={16} />
            save
          </button>
        </div>
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #1f2937;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: transform 0.1s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        
        .slider::-webkit-slider-thumb:active {
          transform: scale(0.95);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #1f2937;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: transform 0.1s ease;
        }
        
        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
        }
        
        .slider::-moz-range-thumb:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
};

export default PhotoEditor;