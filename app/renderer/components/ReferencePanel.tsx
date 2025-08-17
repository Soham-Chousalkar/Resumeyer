import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import OllamaStatus from './OllamaStatus';

interface ReferencePanelProps {
    referenceFile: string | null;
    onReferenceSelect: (filePath: string) => void;
    logs: string[];
}

const ReferencePanel: React.FC<ReferencePanelProps> = ({
    referenceFile,
    onReferenceSelect,
    logs
}) => {
    const [referenceContent, setReferenceContent] = useState<string>('');
    const [chatMessage, setChatMessage] = useState<string>('');
    const [chatHistory, setChatHistory] = useState<{ message: string, isUser: boolean }[]>([]);

    useEffect(() => {
        if (referenceFile) {
            loadReferenceFile(referenceFile);
        }
    }, [referenceFile]);

    const loadReferenceFile = async (filePath: string) => {
        try {
            const content = await ipcRenderer.invoke('read-file', filePath);
            if (content !== null) {
                setReferenceContent(content);
            } else {
                setReferenceContent('');
                console.log(`File not found or could not be read: ${filePath}`);
            }
        } catch (error) {
            console.error('Failed to load reference file:', error);
            setReferenceContent('');
        }
    };

    const handleSelectReferenceFile = () => {
        // In a real app, implement file picker dialog
        // For now, use our created reference file
        const referenceFilePath = 'D:\\UD\\Resume-CL\\Reference\\reference_resume.txt';
        onReferenceSelect(referenceFilePath);
    };

    const handleSelectCoverLetterTemplate = () => {
        // Use our created cover letter template
        const coverLetterPath = 'D:\\UD\\Resume-CL\\Reference\\reference_cover_letter.txt';
        onReferenceSelect(coverLetterPath);
    };

    const handleSendMessage = () => {
        if (chatMessage.trim()) {
            setChatHistory(prev => [...prev, { message: chatMessage, isUser: true }]);

            // In a real app, this would call the local LLM service
            // For now, just echo a response
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

    return (
        <>
            <div className="reference-content">
                <h3>Reference Files</h3>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <button onClick={handleSelectReferenceFile}>Load Resume Template</button>
                    <button onClick={handleSelectCoverLetterTemplate}>Load Cover Letter Template</button>
                </div>
                {referenceContent ? (
                    <pre style={{ whiteSpace: 'pre-wrap', marginTop: '10px', maxHeight: '500px', overflow: 'auto' }}>
                        {referenceContent}
                    </pre>
                ) : (
                    <p>No reference file selected</p>
                )}
            </div>

            <div className="chat-container">
                <OllamaStatus addLog={(message) => {
                    // We don't have direct access to the parent's addLog function,
                    // so we'll just log to console for now
                    console.log(message);
                }} />
                <div className="chat-messages">
                    {chatHistory.map((chat, index) => (
                        <div
                            key={index}
                            style={{
                                textAlign: chat.isUser ? 'right' : 'left',
                                margin: '5px',
                                padding: '8px',
                                borderRadius: '8px',
                                backgroundColor: chat.isUser ? '#dcf8c6' : '#f0f0f0',
                                maxWidth: '80%',
                                alignSelf: chat.isUser ? 'flex-end' : 'flex-start',
                                marginLeft: chat.isUser ? 'auto' : '0',
                            }}
                        >
                            {chat.message}
                        </div>
                    ))}
                </div>

                <div className="logs-container" style={{ maxHeight: '100px', overflowY: 'auto', padding: '10px', borderTop: '1px solid #ddd' }}>
                    <h4>Logs</h4>
                    {logs.map((log, index) => (
                        <div key={index} className="log-entry" style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                            {log}
                        </div>
                    ))}
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
        </>
    );
};

export default ReferencePanel;
