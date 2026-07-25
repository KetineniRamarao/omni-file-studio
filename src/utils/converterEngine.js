import JSZip from 'jszip';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';

/**
 * Detect general media type category based on MIME type or extension
 */
export function getFileTypeCategory(file) {
  const type = file.type || '';
  const ext = (file.name.split('.').pop() || '').toLowerCase();

  if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'ico', 'avif'].includes(ext)) {
    return 'image';
  }
  if (type.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(ext)) {
    return 'audio';
  }
  if (type.startsWith('video/') || ['mp4', 'webm', 'mkv', 'avi', 'mov'].includes(ext)) {
    return 'video';
  }
  if (type === 'application/pdf' || ext === 'pdf') {
    return 'pdf';
  }
  if (
    type.startsWith('text/') ||
    ['json', 'csv', 'xml', 'md', 'markdown', 'txt', 'html', 'css', 'js', 'jsx', 'ts', 'tsx', 'py', 'yml', 'yaml'].includes(ext)
  ) {
    return 'document';
  }
  return 'other';
}

/**
 * Read File as Data URL (Base64) for Image rendering
 */
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Read File as Text
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Convert Image File to Target Format (PNG, JPG, WEBP, ICO) using Canvas
 */
export async function convertImage(file, targetFormat = 'png', quality = 0.92, customWidth, customHeight) {
  const dataUrl = await readFileAsDataURL(file);
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const width = customWidth || img.width;
      const height = customHeight || img.height;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // White background for JPG/JPEG to handle transparent PNGs gracefully
      if (targetFormat === 'jpg' || targetFormat === 'jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      let mimeType = 'image/png';
      if (targetFormat === 'jpg' || targetFormat === 'jpeg') mimeType = 'image/jpeg';
      if (targetFormat === 'webp') mimeType = 'image/webp';
      if (targetFormat === 'ico') mimeType = 'image/x-icon';

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Canvas conversion failed'));
          const originalBase = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const newFileName = `${originalBase}_converted.${targetFormat}`;
          const convertedFile = new File([blob], newFileName, { type: mimeType });
          resolve(convertedFile);
        },
        mimeType,
        quality
      );
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Convert Document / Data Formats (CSV, JSON, XML, TXT, HTML, PDF)
 */
export async function convertDocument(file, targetFormat = 'json') {
  const textContent = await readFileAsText(file);
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const originalBase = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

  let resultText = '';
  let resultMime = 'text/plain';
  let isPdf = false;
  let pdfBlob = null;

  // CSV -> JSON
  if ((ext === 'csv' || file.type.includes('csv')) && targetFormat === 'json') {
    const parsed = Papa.parse(textContent, { header: true, skipEmptyLines: true });
    resultText = JSON.stringify(parsed.data, null, 2);
    resultMime = 'application/json';
  }
  // JSON -> CSV
  else if (ext === 'json' && targetFormat === 'csv') {
    try {
      const jsonObject = JSON.parse(textContent);
      const arrayData = Array.isArray(jsonObject) ? jsonObject : [jsonObject];
      resultText = Papa.unparse(arrayData);
      resultMime = 'text/csv';
    } catch (e) {
      throw new Error('Invalid JSON format');
    }
  }
  // JSON -> XML
  else if (ext === 'json' && targetFormat === 'xml') {
    try {
      const jsonObject = JSON.parse(textContent);
      resultText = jsonToXml(jsonObject);
      resultMime = 'application/xml';
    } catch (e) {
      throw new Error('Invalid JSON format');
    }
  }
  // Markdown -> HTML
  else if ((ext === 'md' || ext === 'markdown') && targetFormat === 'html') {
    resultText = markdownToHtml(textContent);
    resultMime = 'text/html';
  }
  // Any Text / HTML -> PDF
  else if (targetFormat === 'pdf') {
    isPdf = true;
    const doc = new jsPDF();
    const splitLines = doc.splitTextToSize(textContent, 180);
    doc.text(splitLines, 15, 20);
    pdfBlob = doc.output('blob');
  } 
  // Fallback text dump
  else {
    resultText = textContent;
    if (targetFormat === 'json') resultMime = 'application/json';
    if (targetFormat === 'txt') resultMime = 'text/plain';
    if (targetFormat === 'html') resultMime = 'text/html';
  }

  if (isPdf && pdfBlob) {
    return new File([pdfBlob], `${originalBase}_converted.pdf`, { type: 'application/pdf' });
  }

  const blob = new Blob([resultText], { type: resultMime });
  return new File([blob], `${originalBase}_converted.${targetFormat}`, { type: resultMime });
}

/**
 * Basic JSON to XML converter
 */
function jsonToXml(obj, rootName = 'root') {
  let xml = `<${rootName}>`;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      if (typeof val === 'object' && val !== null) {
        xml += jsonToXml(val, key);
      } else {
        xml += `<${key}>${val}</${key}>`;
      }
    }
  }
  xml += `</${rootName}>`;
  return xml;
}

/**
 * Basic Markdown to HTML converter
 */
function markdownToHtml(md) {
  return md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
    .replace(/\*(.*)\*/gim, '<i>$1</i>')
    .replace(/\n$/gim, '<br />')
    .replace(/\n/g, '<br />');
}

/**
 * Create a ZIP Archive from multiple selected Files
 */
export async function createZipArchive(files, zipFileName = 'omni_studio_export.zip') {
  const zip = new JSZip();
  files.forEach((item) => {
    const fileObj = item.file || item;
    zip.file(fileObj.name, fileObj);
  });
  const blob = await zip.generateAsync({ type: 'blob' });
  return new File([blob], zipFileName, { type: 'application/zip' });
}

/**
 * Download a File object directly in the browser
 */
export function downloadFile(file) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
