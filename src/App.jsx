import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dropzone from './components/Dropzone';
import FileList from './components/FileList';
import FileViewerModal from './components/FileViewerModal';
import ConverterPanel from './components/ConverterPanel';
import { downloadFile, createZipArchive } from './utils/converterEngine';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [items, setItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewerItem, setViewerItem] = useState(null);
  const [convertTargetItems, setConvertTargetItems] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleFilesAdded = (newFiles) => {
    const formattedNewItems = newFiles.map((file) => ({
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      file,
      isConverted: false
    }));

    setItems((prev) => [...prev, ...formattedNewItems]);
    showToast(`Added ${newFiles.length} file(s) to workspace`);
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (targetIds) => {
    const allSelected = targetIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !targetIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...targetIds])));
    }
  };

  const handleDeleteFile = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    showToast('File removed');
  };

  const handleReset = () => {
    setItems([]);
    setSelectedIds([]);
    showToast('Workspace cleared');
  };

  const handleConversionComplete = (newItems) => {
    setItems((prev) => [...newItems, ...prev]);
    showToast(`Successfully converted ${newItems.length} file(s)!`);
  };

  const handleBatchZip = async () => {
    const selectedItems = items.filter((item) => selectedIds.includes(item.id));
    if (selectedItems.length === 0) return;

    showToast('Compressing into ZIP archive...');
    const zipFile = await createZipArchive(selectedItems, 'omni_files_export.zip');
    downloadFile(zipFile);
    showToast('Downloaded ZIP archive!');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar fileCount={items.length} onReset={handleReset} />

      <main style={{ flex: 1 }}>
        <Dropzone onFilesAdded={handleFilesAdded} />

        {items.length > 0 && (
          <FileList
            items={items}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onOpenViewer={(item) => setViewerItem(item)}
            onOpenConvertModal={(targetItems) => setConvertTargetItems(targetItems)}
            onDownloadFile={(file) => downloadFile(file)}
            onDeleteFile={handleDeleteFile}
            onBatchConvert={() => {
              const selectedItems = items.filter((i) => selectedIds.includes(i.id));
              setConvertTargetItems(selectedItems);
            }}
            onBatchZip={handleBatchZip}
          />
        )}
      </main>

      {/* File Viewer Modal */}
      {viewerItem && (
        <FileViewerModal
          item={viewerItem}
          onClose={() => setViewerItem(null)}
          onDownload={(file) => downloadFile(file)}
        />
      )}

      {/* Converter Settings Modal */}
      {convertTargetItems && (
        <ConverterPanel
          targetItems={convertTargetItems}
          onClose={() => setConvertTargetItems(null)}
          onConversionComplete={handleConversionComplete}
        />
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'rgba(16, 185, 129, 0.95)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          fontSize: '0.88rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }} className="animate-fade-in">
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}

      <footer style={{
        textAlign: 'center',
        padding: '24px 0',
        color: 'var(--text-dim)',
        fontSize: '0.8rem',
        borderTop: '1px solid var(--glass-border)',
        marginTop: '40px'
      }}>
        OmniFile Studio • Built with React & Vite • 100% Client-Side Privacy Guaranteed
      </footer>
    </div>
  );
}
