import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Eye, Maximize2, Minimize2, Tag, Info } from 'lucide-react';
import { SlideImage } from '../types';

interface MedicalImageViewerProps {
  image: SlideImage;
  lang: 'en' | 'fr';
}

export const MedicalImageViewer: React.FC<MedicalImageViewerProps> = ({ image, lang }) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [invertContrast, setInvertContrast] = useState<boolean>(false);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.3, 3.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.3, 0.7));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setInvertContrast(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoom <= 1 || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  return (
    <div
      id="medical-image-viewer-container"
      ref={containerRef}
      className={`relative bg-slate-950 rounded-xl overflow-hidden border border-slate-200 transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : 'w-full shadow-xs'
      }`}
    >
      {/* Viewer Header / Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-white border-b border-slate-200 text-xs text-slate-700 gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            {image.modality}
          </span>
          <span className="font-medium text-slate-800 truncate max-w-xs sm:max-w-md">
            {image.caption}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={handleZoomIn}
            title={lang === 'fr' ? 'Zoom avant' : 'Zoom in'}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title={lang === 'fr' ? 'Zoom arrière' : 'Zoom out'}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-slate-500 px-1">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleReset}
            title={lang === 'fr' ? 'Réinitialiser' : 'Reset view'}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-200 mx-1" />

          {/* Invert contrast (PACS style) */}
          <button
            type="button"
            onClick={() => setInvertContrast(!invertContrast)}
            title={lang === 'fr' ? 'Inverser le contraste' : 'Invert contrast'}
            className={`p-1.5 rounded-lg transition-colors ${
              invertContrast
                ? 'bg-amber-50 text-amber-700 border border-amber-300'
                : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Toggle Annotations */}
          {image.annotations && image.annotations.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAnnotations(!showAnnotations)}
              title={lang === 'fr' ? 'Afficher les repères cliniques' : 'Toggle clinical annotations'}
              className={`p-1.5 rounded-lg transition-colors ${
                showAnnotations
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
              }`}
            >
              <Tag className="w-4 h-4" />
            </button>
          )}

          {/* Fullscreen */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={lang === 'fr' ? 'Plein écran' : 'Toggle fullscreen'}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        className={`relative w-full overflow-hidden flex items-center justify-center select-none ${
          isFullscreen ? 'flex-1 min-h-0' : 'h-80 sm:h-96'
        } ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative transition-transform duration-75 origin-center will-change-transform max-w-full max-h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          <img
            src={image.url}
            alt={image.caption}
            referrerPolicy="no-referrer"
            className={`max-h-[70vh] w-auto object-contain rounded transition-[filter] duration-200 ${
              invertContrast ? 'invert contrast-125' : 'contrast-105'
            }`}
            draggable={false}
          />

          {/* Clinical Annotations Pins */}
          {showAnnotations &&
            image.annotations?.map((anno) => {
              const isActive = activeAnnotationId === anno.id;
              return (
                <div
                  key={anno.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${anno.xPercent}%`, top: `${anno.yPercent}%` }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveAnnotationId(isActive ? null : anno.id);
                    }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transition-transform ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 scale-125 ring-4 ring-amber-400/40 animate-pulse'
                        : 'bg-blue-600 text-white hover:scale-110 ring-2 ring-white/80'
                    }`}
                  >
                    +
                  </button>

                  {/* Pin label tooltip */}
                  <div
                    className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 rounded-xl bg-white border border-slate-200 text-left text-xs shadow-lg z-20 pointer-events-auto transition-all ${
                      isActive ? 'block scale-100 opacity-100' : 'hidden group-hover:block scale-95 opacity-90'
                    }`}
                  >
                    <p className="font-bold text-blue-600 mb-0.5">{anno.label}</p>
                    <p className="text-slate-600 leading-snug text-[11px]">{anno.description}</p>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Pan Guide hint if zoomed in */}
        {zoom > 1 && (
          <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-md text-[11px] text-slate-300 border border-slate-700 pointer-events-none">
            {lang === 'fr' ? 'Glissez pour déplacer l’image' : 'Click & drag to pan'}
          </div>
        )}
      </div>

      {/* Selected annotation description bar if any clicked */}
      {activeAnnotationId && image.annotations && (
        <div className="p-3 bg-white border-t border-slate-200 text-xs text-slate-700 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-blue-700">
              {image.annotations.find((a) => a.id === activeAnnotationId)?.label}:{' '}
            </span>
            <span>
              {image.annotations.find((a) => a.id === activeAnnotationId)?.description}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveAnnotationId(null)}
            className="ml-auto text-slate-400 hover:text-slate-700 font-mono text-sm px-1.5"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};
