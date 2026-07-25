import React, { useState, useRef } from 'react';
import { UploadCloud, FileCode, Image, FileText, Music, Film, CheckCircle2 } from 'lucide-react';

export default function Dropzone({ onFilesAdded }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files));
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="glass-panel animate-fade-in"
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        cursor: 'pointer',
        border: isDragOver ? '2px dashed var(--accent-cyan)' : '2px dashed var(--glass-border)',
        background: isDragOver ? 'rgba(6, 182, 212, 0.08)' : 'var(--bg-surface)',
        transition: 'var(--transition)',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <div style={{
        width: '64px',
        height: '64px',
        margin: '0 auto 16px',
        borderRadius: 'var(--radius-full)',
        background: isDragOver ? 'var(--accent-cyan)' : 'rgba(99, 102, 241, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'var(--transition)',
        transform: isDragOver ? 'scale(1.1)' : 'scale(1)'
      }}>
        <UploadCloud size={32} color={isDragOver ? '#ffffff' : 'var(--accent-primary)'} />
      </div>

      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>
        {isDragOver ? 'Drop your files right here!' : 'Drag & drop files or click to browse'}
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '500px', margin: '0 auto 20px' }}>
        Open, view, select, convert, or compress any image, document, CSV, JSON, markdown, or media file instantly.
      </p>

      {/* Format Indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <span className="badge badge-image" style={{ gap: '4px' }}><Image size={12} /> Images (PNG/JPG/WEBP/SVG)</span>
        <span className="badge badge-doc" style={{ gap: '4px' }}><FileText size={12} /> Data (CSV/JSON/XML)</span>
        <span className="badge badge-doc" style={{ gap: '4px' }}><FileCode size={12} /> Documents (PDF/MD/TXT)</span>
        <span className="badge badge-audio" style={{ gap: '4px' }}><Music size={12} /> Audio (MP3/WAV/OGG)</span>
        <span className="badge badge-video" style={{ gap: '4px' }}><Film size={12} /> Video (MP4/WebM)</span>
      </div>
    </div>
  );
}
