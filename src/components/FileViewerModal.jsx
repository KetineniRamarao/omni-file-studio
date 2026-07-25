import React, { useState, useEffect } from 'react';
import { X, Download, Copy, Check, RotateCw, FileText, Info } from 'lucide-react';
import { getFileTypeCategory, readFileAsDataURL, readFileAsText } from '../utils/converterEngine';

export default function FileViewerModal({ item, onClose, onDownload }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [rotation, setRotation] = useState(0);

  const file = item?.file;
  const category = file ? getFileTypeCategory(file) : 'other';

  useEffect(() => {
    if (!file) return;
    setLoading(true);

    if (category === 'image' || category === 'audio' || category === 'video' || category === 'pdf') {
      readFileAsDataURL(file).then((url) => {
        setContent(url);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      readFileAsText(file).then((txt) => {
        setContent(txt);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [file, category]);

  if (!item) return null;

  const handleCopyText = () => {
    if (typeof content === 'string') {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const ext = (file.name.split('.').pop() || '').toLowerCase();

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
        maxWidth: '850px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <FileText size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {file.name}
            </h3>
            <span className="badge badge-doc">{ext}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {category === 'image' && (
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                title="Rotate image 90°"
              >
                <RotateCw size={14} /> Rotate
              </button>
            )}
            {typeof content === 'string' && category !== 'image' && category !== 'pdf' && category !== 'audio' && category !== 'video' && (
              <button className="btn btn-secondary btn-sm" onClick={handleCopyText}>
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={() => onDownload(file)}>
              <Download size={14} /> Download
            </button>
            <button 
              onClick={onClose} 
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(9, 13, 22, 0.4)'
        }}>
          {loading ? (
            <div style={{ color: 'var(--text-muted)' }}>Loading preview...</div>
          ) : category === 'image' ? (
            <div style={{ textAlign: 'center' }}>
              <img 
                src={content} 
                alt={file.name} 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '65vh', 
                  borderRadius: 'var(--radius-md)', 
                  transform: `rotate(${rotation}deg)`, 
                  transition: 'transform 0.3s ease',
                  boxShadow: 'var(--shadow-glow)'
                }} 
              />
            </div>
          ) : category === 'audio' ? (
            <div style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
              <audio controls src={content} style={{ width: '100%', marginTop: '20px' }} />
            </div>
          ) : category === 'video' ? (
            <video controls src={content} style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: 'var(--radius-md)' }} />
          ) : category === 'pdf' ? (
            <iframe src={content} title={file.name} style={{ width: '100%', height: '65vh', border: 'none', borderRadius: 'var(--radius-md)' }} />
          ) : (
            <pre style={{
              width: '100%',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.86rem',
              color: '#e2e8f0',
              background: '#0d1117',
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border)',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: '65vh'
            }}>
              {content || 'No text content available'}
            </pre>
          )}
        </div>

        {/* Modal Footer info */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid var(--glass-border)', fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', gap: '16px' }}>
          <span>Size: {(file.size / 1024).toFixed(1)} KB</span>
          <span>MIME: {file.type || 'unknown'}</span>
          <span>Last modified: {new Date(file.lastModified).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
