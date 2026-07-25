import React, { useState } from 'react';
import { 
  FileText, Image as ImageIcon, Music, Film, FileCode, Eye, Download, 
  Trash2, RefreshCw, CheckSquare, Square, Archive, Sparkles, Filter 
} from 'lucide-react';
import { getFileTypeCategory } from '../utils/converterEngine';

export default function FileList({ 
  items, 
  selectedIds, 
  onToggleSelect, 
  onToggleSelectAll, 
  onOpenViewer, 
  onOpenConvertModal, 
  onDownloadFile, 
  onDeleteFile,
  onBatchConvert,
  onBatchZip
}) {
  const [activeTab, setActiveTab] = useState('all');

  // Filter items by tab category
  const filteredItems = items.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'converted') return item.isConverted;
    const cat = getFileTypeCategory(item.file);
    return cat === activeTab;
  });

  const allFilteredSelected = filteredItems.length > 0 && filteredItems.every(i => selectedIds.includes(i.id));

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getItemIcon = (file) => {
    const cat = getFileTypeCategory(file);
    if (cat === 'image') return <ImageIcon size={20} color="#818cf8" />;
    if (cat === 'audio') return <Music size={20} color="#fbbf24" />;
    if (cat === 'video') return <Film size={20} color="#f472b6" />;
    if (cat === 'pdf') return <FileText size={20} color="#22d3ee" />;
    return <FileCode size={20} color="#34d399" />;
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px', marginBottom: '28px' }}>
      {/* Header & Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color="var(--accent-cyan)" />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Filter Items:</span>
          
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['all', 'image', 'document', 'audio', 'video', 'converted'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid',
                  borderColor: activeTab === tab ? 'var(--accent-primary)' : 'transparent',
                  background: activeTab === tab ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: activeTab === tab ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'var(--transition)'
                }}
              >
                {tab} ({tab === 'all' ? items.length : tab === 'converted' ? items.filter(i=>i.isConverted).length : items.filter(i=>getFileTypeCategory(i.file)===tab).length})
              </button>
            ))}
          </div>
        </div>

        {/* Selection & Batch Action Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => onToggleSelectAll(filteredItems.map(i => i.id))}
          >
            {allFilteredSelected ? <CheckSquare size={16} color="var(--accent-cyan)" /> : <Square size={16} />} 
            {allFilteredSelected ? 'Deselect All' : 'Select All'}
          </button>

          {selectedIds.length > 0 && (
            <>
              <button className="btn btn-primary btn-sm" onClick={onBatchConvert}>
                <RefreshCw size={14} /> Batch Convert ({selectedIds.length})
              </button>
              <button className="btn btn-secondary btn-sm" onClick={onBatchZip} style={{ background: 'rgba(6, 182, 212, 0.15)', borderColor: 'rgba(6, 182, 212, 0.3)', color: '#22d3ee' }}>
                <Archive size={14} /> Download ZIP ({selectedIds.length})
              </button>
            </>
          )}
        </div>
      </div>

      {/* File Cards List */}
      {filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          No files match this filter tab.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const ext = (item.file.name.split('.').pop() || '').toLowerCase();
            const category = getFileTypeCategory(item.file);

            return (
              <div
                key={item.id}
                className="glass-card"
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  borderColor: isSelected ? 'var(--accent-primary)' : 'var(--glass-border)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-card)',
                  flexWrap: 'wrap'
                }}
              >
                {/* Left: Checkbox & Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 280px', minWidth: 0 }}>
                  <button
                    onClick={() => onToggleSelect(item.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                  >
                    {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>

                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getItemIcon(item.file)}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ 
                      fontWeight: 600, 
                      fontSize: '0.92rem', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis' 
                    }} title={item.file.name}>
                      {item.file.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{formatSize(item.file.size)}</span>
                      <span>•</span>
                      <span className={`badge badge-${category === 'image' ? 'image' : category === 'audio' ? 'audio' : category === 'video' ? 'video' : 'doc'}`}>
                        {ext}
                      </span>
                      {item.isConverted && (
                        <span className="badge badge-converted" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Sparkles size={10} /> Converted
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => onOpenViewer(item)}
                    title="View / Open File"
                  >
                    <Eye size={14} /> Open
                  </button>

                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => onOpenConvertModal([item])}
                    title="Convert File"
                  >
                    <RefreshCw size={14} /> Convert
                  </button>

                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => onDownloadFile(item.file)}
                    title="Download File"
                  >
                    <Download size={14} /> Download
                  </button>

                  <button 
                    className="btn btn-danger btn-sm" 
                    onClick={() => onDeleteFile(item.id)}
                    title="Remove item"
                    style={{ padding: '6px 8px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
