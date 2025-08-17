import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import * as path from 'path';
import OllamaStatus from './OllamaStatus';
import JobDescriptionParser from './JobDescriptionParser';
import DocumentPreview from './DocumentPreview';
import PDFViewer from './PDFViewer';
import { ParsedJobDescription } from '../services/jobParserService';

interface EnhancedReferencePanelProps {
  referenceFile: string | null;
  onReferenceSelect: (filePath: string) => void;
  logs: string[];
  onJobDescriptionUpdate?: (text: string) => void;
  onParsedJobData?: (data: ParsedJobDescription) => void;
}

const EnhancedReferencePanel: React.FC<EnhancedReferencePanelProps> = ({
  referenceFile,
  onReferenceSelect,
  logs,
  onJobDescriptionUpdate,
  onParsedJobData
}) => {
  const [referenceContent, setReferenceContent] = useState<string>('');
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{ message: string, isUser: boolean }[]>([]);
  const [activeTab, setActiveTab] = useState<'references' | 'jobParser' | 'chat'>('references');
  const [parsedJob, setParsedJob] = useState<ParsedJobDescription | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [isPDF, setIsPDF] = useState<boolean>(false);

  useEffect(() => {
    if (referenceFile) {
      loadReferenceFile(referenceFile);
    }
  }, [referenceFile]);

  const loadReferenceFile = async (filePath: string) => {
    setIsLoadingFile(true);
    try {
      // Check if file is PDF
      const isPdfFile = filePath.toLowerCase().endsWith('.pdf');
      setIsPDF(isPdfFile);
      
      if (isPdfFile) {
        // For PDFs, just set the flag and don't try to load content
        setReferenceContent(''); // Clear any previous content
        console.log(`PDF file detected, will use PDF viewer: ${filePath}`);
      } else {
        // For non-PDF files, load the content normally
        const content = await ipcRenderer.invoke('read-file', filePath);
        
        if (content !== null) {
          // Set the formatted content
          setReferenceContent(content);
          console.log(`File loaded successfully: ${filePath}`);
        } else {
          setReferenceContent('');
          console.log(`File not found or could not be read: ${filePath}`);
        }
      }
    } catch (error) {
      console.error('Failed to load reference file:', error);
      setReferenceContent('');
      setIsPDF(false); // Reset PDF flag on error
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleSelectReferenceFile = async () => {
    try {
      const result = await ipcRenderer.invoke('open-file-dialog', {
        title: 'Select Resume File',
        buttonLabel: 'Select Resume'
      });

      if (result && result.filePath) {
        onReferenceSelect(result.filePath);
      }
    } catch (error) {
      console.error('Error selecting resume file:', error);
    }
  };

  const handleSelectCoverLetterTemplate = async () => {
    try {
      const result = await ipcRenderer.invoke('open-file-dialog', {
        title: 'Select Cover Letter File',
        buttonLabel: 'Select Cover Letter'
      });

      if (result && result.filePath) {
        onReferenceSelect(result.filePath);
      }
    } catch (error) {
      console.error('Error selecting cover letter file:', error);
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setChatHistory(prev => [...prev, { message: chatMessage, isUser: true }]);

      // In a real app, this would call the local LLM service
      setTimeout(() => {
        setChatHistory(prev => [
          ...prev,
          {
            message: `You said: "${chatMessage}" - In the future, this will be processed by the local LLM.`,
            isUser: false
          }
        ]);
      }, 500);

      setChatMessage('');
    }
  };

  const handleParsedJobData = (data: ParsedJobDescription) => {
    setParsedJob(data);

    // Pass to parent if callback is provided
    if (onParsedJobData) {
      onParsedJobData(data);
    }
  };

  const handleKeywords = (extractedKeywords: string[]) => {
    setKeywords(extractedKeywords);
  };

  const handleRawJobDescription = (text: string) => {
    if (onJobDescriptionUpdate) {
      onJobDescriptionUpdate(text);
    }
  };

  return (
    <div className="enhanced-reference-panel">
      <div className="reference-tabs">
        <button
          className={`reference-tab-button ${activeTab === 'references' ? 'active' : ''}`}
          onClick={() => setActiveTab('references')}
        >
          Reference Files
        </button>
        <button
          className={`reference-tab-button ${activeTab === 'jobParser' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobParser')}
        >
          Job Parser
        </button>
        <button
          className={`reference-tab-button ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat & Logs
        </button>
      </div>

      <div className="reference-content">
        {activeTab === 'references' && (
          <div className="references-tab">
            <h3>Reference Files</h3>
            <div className="reference-actions">
              <button onClick={handleSelectReferenceFile}>Load Resume Template</button>
              <button onClick={handleSelectCoverLetterTemplate}>Load Cover Letter Template</button>
            </div>
                        {referenceFile ? (
              isLoadingFile ? (
                <div className="loading-reference">
                  <p>Loading document...</p>
                </div>
              ) : isPDF ? (
                <PDFViewer 
                  filePath={referenceFile}
                />
              ) : referenceContent ? (
                <DocumentPreview 
                  content={referenceContent} 
                  title={referenceFile.split('\\').pop() || ''} 
                  isPDF={false}
                />
              ) : (
                <div className="loading-reference">
                  <p>Error loading document</p>
                </div>
              )
            ) : (
              <div className="no-reference">
                <div className="upload-instruction">
                  <p>No document selected</p>
                  <p>Please select a file using the buttons above</p>
                  <div className="document-icon">
                    <span>📄</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'jobParser' && (
          <div className="job-parser-tab">
            <JobDescriptionParser
              onParsedData={handleParsedJobData}
              onKeywords={handleKeywords}
              onRawJobDescription={handleRawJobDescription}
            />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="chat-tab">
            <OllamaStatus
              addLog={(message) => {
                console.log(message);
              }}
            />

            <div className="chat-messages">
              {chatHistory.map((chat, index) => (
                <div
                  key={index}
                  className={`chat-message ${chat.isUser ? 'user' : 'assistant'}`}
                >
                  {chat.message}
                </div>
              ))}
            </div>

            <div className="logs-container">
              <h4>Logs</h4>
              <div className="logs-list">
                {logs.map((log, index) => (
                  <div key={index} className="log-entry">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            <div className="chat-input">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedReferencePanel;
