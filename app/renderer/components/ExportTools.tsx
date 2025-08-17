import React, { useState } from 'react';
import { ExportClient } from '../services/exportClient';

interface ExportToolsProps {
  title: string;
  content: string;
  onExportComplete?: (result: { success: boolean; filePath?: string; format: string }) => void;
}

const ExportTools: React.FC<ExportToolsProps> = ({ title, content, onExportComplete }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [lastExported, setLastExported] = useState<string | null>(null);

  const handleExportToPDF = async () => {
    try {
      setIsExporting(true);
      setExportError(null);

      const result = await ExportClient.showAndExportToPDF(title, content);
      
      if (result.success && result.filePath) {
        setLastExported(result.filePath);
        if (onExportComplete) {
          onExportComplete({ success: true, filePath: result.filePath, format: 'pdf' });
        }
      } else {
        setExportError(result.error || 'Failed to export to PDF');
        if (onExportComplete) {
          onExportComplete({ success: false, format: 'pdf' });
        }
      }
    } catch (error) {
      setExportError((error as Error).message);
      if (onExportComplete) {
        onExportComplete({ success: false, format: 'pdf' });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportToDOCX = async () => {
    try {
      setIsExporting(true);
      setExportError(null);

      const result = await ExportClient.showAndExportToDOCX(title, content);
      
      if (result.success && result.filePath) {
        setLastExported(result.filePath);
        if (onExportComplete) {
          onExportComplete({ success: true, filePath: result.filePath, format: 'docx' });
        }
      } else {
        setExportError(result.error || 'Failed to export to DOCX');
        if (onExportComplete) {
          onExportComplete({ success: false, format: 'docx' });
        }
      }
    } catch (error) {
      setExportError((error as Error).message);
      if (onExportComplete) {
        onExportComplete({ success: false, format: 'docx' });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const openLastExported = () => {
    if (lastExported) {
      // Using Electron shell to open the file with the default application
      window.require('electron').shell.openPath(lastExported);
    }
  };

  return (
    <div className="export-tools">
      <div className="export-buttons">
        <button 
          onClick={handleExportToPDF} 
          disabled={isExporting || !content}
          className="export-button pdf-button"
          title="Export as PDF"
        >
          Export to PDF
        </button>
        <button 
          onClick={handleExportToDOCX} 
          disabled={isExporting || !content}
          className="export-button docx-button"
          title="Export as DOCX"
        >
          Export to DOCX
        </button>
        {lastExported && (
          <button 
            onClick={openLastExported}
            className="export-button open-button"
            title="Open last exported file"
          >
            Open Last Exported
          </button>
        )}
      </div>
      
      {isExporting && (
        <div className="export-status exporting">
          <span>Exporting document...</span>
        </div>
      )}
      
      {exportError && (
        <div className="export-status error">
          <span>Error: {exportError}</span>
        </div>
      )}
      
      {!isExporting && !exportError && lastExported && (
        <div className="export-status success">
          <span>Document exported to: {lastExported}</span>
        </div>
      )}
    </div>
  );
};

export default ExportTools;
