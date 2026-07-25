import React, { useState } from 'react';
import { X, RefreshCw, Sliders, AlertCircle } from 'lucide-react';
import { getFileTypeCategory, convertImage, convertDocument } from '../utils/converterEngine';

export default function ConverterPanel({ targetItems, onClose, onConversionComplete }) {
  const [targetFormat, setTargetFormat] = useState('png');
  const [quality, setQuality] = useState(0.90);
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  if (!targetItems || targetItems.length === 0) return null;

  const firstItem = targetItems[0];
  const firstCategory = getFileTypeCategory(firstItem.file);

  // Available formats based on input type
  const getFormatOptions = () => {
    if (firstCategory === 'image') {
      return ['png', 'jpg', 'webp', 'ico'];
    }
    return ['json', 'csv', 'xml', 'pdf', 'txt', 'html'];
  };

  const formats = getFormatOptions();

  const handleRunConversion = async () => {
    setIsProcessing(true);
    setProgress(10);
    setErrorMsg('');

    try {
      const convertedResults = [];
      const total = targetItems.length;

      for (let i = 0; i < total; i++) {
        const item = targetItems[i];
        const category = getFileTypeCategory(item.file);
        let convertedFile;

        if (category === 'image') {
          convertedFile = await convertImage(
            item.file,
            targetFormat,
            quality,
            customWidth ? parseInt(customWidth, 10) : undefined,
            customHeight ? parseInt(customHeight, 10) : undefined
          );
        } else {
          convertedFile = await convertDocument(item.file, targetFormat);
        }

        convertedResults.push({
          id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          file: convertedFile,
          isConverted: true,
          originalName: item.file.name
        });

        setProgress(Math.round(((i + 1) / total) * 100));
      }

      setTimeout(() => {
        onConversionComplete(convertedResults);
        setIsProcessing(false);
        onClose();
      }, 400);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Conversion failed for selected item');
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 8, 16, 0.82)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }} className="animate-fade-in">
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '28px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <RefreshCw size={18} color="var(--accent-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Convert {targetItems.length} File(s)</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Choose output format & settings</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Selected Items Summary */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: '20px',
          fontSize: '0.85rem',
          border: '1px solid var(--glass-border)'
        }}>
          <span style={{ color: 'var(--text-muted)' }}>Targeting: </span>
          <strong style={{ color: '#ffffff' }}>
            {targetItems.map(i => i.file.name).join(', ')}
          </strong>
        </div>

        {/* Format Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
            Output Format:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {formats.map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setTargetFormat(fmt)}
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid',
                  borderColor: targetFormat === fmt ? 'var(--accent-primary)' : 'var(--glass-border)',
                  background: targetFormat === fmt ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Image Options (Quality slider & custom dimensions) */}
        {firstCategory === 'image' && (
          <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={14} /> Quality Compression:
              </label>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                {Math.round(quality * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Width (px):</label>
                <input 
                  type="number" 
                  placeholder="Auto" 
                  value={customWidth} 
                  onChange={(e) => setCustomWidth(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(9, 13, 22, 0.8)',
                    border: '1px solid var(--glass-border)',
                    color: '#fff',
                    marginTop: '4px',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Height (px):</label>
                <input 
                  type="number" 
                  placeholder="Auto" 
                  value={customHeight} 
                  onChange={(e) => setCustomHeight(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(9, 13, 22, 0.8)',
                    border: '1px solid var(--glass-border)',
                    color: '#fff',
                    marginTop: '4px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent-gradient)', transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
              Processing... {progress}%
            </div>
          </div>
        )}

        {/* Submit Action */}
        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px' }}
          onClick={handleRunConversion}
          disabled={isProcessing}
        >
          {isProcessing ? 'Converting Files...' : `Convert to ${targetFormat.toUpperCase()}`}
        </button>
      </div>
    </div>
  );
}
