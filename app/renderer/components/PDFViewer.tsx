import React, { useState, useEffect, useRef } from 'react';
import path from 'path';

interface PDFViewerProps {
  filePath: string;
  title?: string;
}

/**
 * A component for viewing PDF files using an iframe with Electron's PDF viewer
 */
const PDFViewer: React.FC<PDFViewerProps> = ({ filePath, title }) => {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Convert file path to URL suitable for PDF viewing
  const getFileUrl = (path: string): string => {
    // Ensure path uses correct slashes
    const normalizedPath = path.replace(/\\/g, '/');
    
    // Format as file URL
    if (!normalizedPath.startsWith('file:///')) {
      return `file:///${normalizedPath}`;
    }
    return normalizedPath;
  };
  
  useEffect(() => {
    if (filePath) {
      // Convert to a proper URL for PDF viewing
      setPdfUrl(getFileUrl(filePath));
      setIframeLoaded(false);
    }
  }, [filePath]);

  // Toggle fullscreen viewing mode
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };
  
  return (
    <div className={`pdf-viewer-container ${isFullScreen ? 'fullscreen' : ''}`}>
      <div className="pdf-controls">
        <div className="pdf-actions">
          <button 
            className="pdf-action-button" 
            onClick={toggleFullScreen}
            title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>
      </div>
      
      <div className="pdf-view-area">
        <iframe 
          ref={iframeRef}
          src={pdfUrl} 
          className="pdf-iframe"
          title={`PDF Viewer - ${title || path.basename(filePath)}`}
          onLoad={() => setIframeLoaded(true)}
        />
      </div>
    </div>
  );
};

export default PDFViewer;