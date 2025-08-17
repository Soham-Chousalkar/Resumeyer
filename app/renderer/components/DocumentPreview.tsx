import React, { useState, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface DocumentPreviewProps {
  content: string;
  title?: string;
  isPDF?: boolean;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ content, title, isPDF = false }) => {
  const [scale, setScale] = useState(0.6); // Start with a smaller scale to see the whole page
  const containerRef = useRef<HTMLDivElement>(null);
  const [formattedContent, setFormattedContent] = useState<React.ReactNode[]>([]);

  // Format content on mount or when content changes
  useEffect(() => {
    const formatted = formatContent(content);
    setFormattedContent(formatted);
  }, [content]);

  // Function to format content with proper line breaks and styling
  const formatContent = (text: string): React.ReactNode[] => {
    if (!text) return [<p key="empty">No content</p>];

    // For PDF content, perform additional cleanup
    let processedText = text;
    if (isPDF) {
      // Remove excessive whitespace
      processedText = processedText.replace(/\s{2,}/g, ' ');
      // Fix common PDF formatting issues
      processedText = processedText.replace(/(\w)\s*-\s*(\w)/g, '$1-$2'); // Fix hyphenation
    }

    // Split text into paragraphs (with different strategies for PDF vs text)
    const paragraphs = isPDF ?
      processedText.split(/\n{1,}/).filter(p => p.trim()) :
      processedText.split('\n\n');

    return paragraphs.map((paragraph, idx) => {
      // Check if paragraph is a header (all caps or has colon)
      const isHeader = paragraph.toUpperCase() === paragraph ||
        (paragraph.includes(':') && paragraph.length < 100) ||
        /^[A-Z\s]{5,}$/.test(paragraph.trim());

      // Handle lists with hyphens or bullets
      if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('•') || paragraph.trim().match(/^\d+\.\s/)) {
        const listItems = paragraph.split('\n').map(line => {
          const trimmed = line.trim();
          if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
            return trimmed.substring(1).trim();
          } else if (trimmed.match(/^\d+\.\s/)) {
            return trimmed.replace(/^\d+\.\s/, '');
          }
          return trimmed;
        });

        return (
          <ul key={idx} className={isHeader ? 'doc-header' : ''}>
            {listItems.map((item, itemIdx) => (
              <li key={`${idx}-${itemIdx}`}>{item}</li>
            ))}
          </ul>
        );
      }

      // Handle normal paragraphs, preserving line breaks
      const lines = paragraph.split('\n');
      return (
        <p key={idx} className={isHeader ? 'doc-header' : ''}>
          {lines.map((line, lineIdx) => (
            <React.Fragment key={`${idx}-${lineIdx}`}>
              {line}
              {lineIdx < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      );
    });
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(2, prev + 0.1));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(0.3, prev - 0.1));
  };

  const handleReset = () => {
    setScale(0.6);
  };

  return (
    <div className="document-preview-container">
      {title && <h3 className="preview-title">{title}</h3>}

      <div className="preview-toolbar">
        <button onClick={handleZoomOut} className="zoom-button">−</button>
        <span className="zoom-level">{Math.round(scale * 100)}%</span>
        <button onClick={handleZoomIn} className="zoom-button">+</button>
        <button onClick={handleReset} className="reset-button">Reset</button>
      </div>

      <div className="preview-wrapper">
        <TransformWrapper
          initialScale={scale}
          initialPositionX={0}
          initialPositionY={0}
          minScale={0.3}
          maxScale={2}
          limitToBounds={false}
          doubleClick={{
            disabled: true,
          }}
          wheel={{
            step: 0.05,
          }}
          onZoom={(ref) => {
            setScale(ref.state.scale);
          }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <React.Fragment>
              <TransformComponent
                wrapperClass="preview-transform-wrapper"
                contentClass="preview-transform-content"
              >
                <div className="document-preview" ref={containerRef}>
                  <div className={`a4-page ${isPDF ? 'pdf-content' : ''}`}>
                    {formattedContent}
                  </div>
                </div>
              </TransformComponent>
            </React.Fragment>
          )}
        </TransformWrapper>
      </div>

      <div className="drag-hint">
        <p>Drag to pan • Scroll to zoom</p>
      </div>
    </div>
  );
};

export default DocumentPreview;