import React from 'react';
import { Layers, ShieldCheck, Github, RefreshCw } from 'lucide-react';

export default function Navbar({ fileCount, onReset }) {
  return (
    <header className="glass-panel" style={{ padding: '16px 28px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ 
          width: '42px', 
          height: '42px', 
          borderRadius: '12px', 
          background: 'var(--accent-gradient)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)' 
        }}>
          <Layers size={24} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
            OmniFile <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Studio</span>
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#10b981" /> 100% Client-Side Engine • Private & Instant
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {fileCount > 0 && (
          <span style={{ 
            background: 'rgba(99, 102, 241, 0.15)', 
            color: 'var(--accent-primary)', 
            padding: '6px 14px', 
            borderRadius: 'var(--radius-full)', 
            fontSize: '0.82rem', 
            fontWeight: 600,
            border: '1px solid rgba(99, 102, 241, 0.3)'
          }}>
            {fileCount} {fileCount === 1 ? 'file' : 'files'} loaded
          </span>
        )}

        {fileCount > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={onReset} title="Clear workspace">
            <RefreshCw size={14} /> Clear All
          </button>
        )}

        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-secondary btn-sm"
          style={{ textDecoration: 'none' }}
        >
          <Github size={15} /> GitHub Pages Ready
        </a>
      </div>
    </header>
  );
}
