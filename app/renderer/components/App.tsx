import React, { useState, useRef, useEffect } from 'react';
import DirectoryTree from './DirectoryTree';
import EnhancedDocumentViewer from './EnhancedDocumentViewer';
import EnhancedReferencePanel from './EnhancedReferencePanel';
import { ParsedJobDescription } from '../services/jobParserService';

const App: React.FC = () => {
    // File and data state
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [referenceFile, setReferenceFile] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [jobDescription, setJobDescription] = useState<string>('');
    const [parsedJob, setParsedJob] = useState<ParsedJobDescription | null>(null);

    // Resizing state
    const [leftPanelWidth, setLeftPanelWidth] = useState<number>(250);
    const [rightPanelWidth, setRightPanelWidth] = useState<number>(300);
    const [isResizingLeft, setIsResizingLeft] = useState<boolean>(false);
    const [isResizingRight, setIsResizingRight] = useState<boolean>(false);

    // Refs to DOM elements
    const leftPanelRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleFileSelect = (filePath: string) => {
        setSelectedFile(filePath);
        addLog(`Selected file: ${filePath}`);
    };

    const handleReferenceSelect = (filePath: string) => {
        setReferenceFile(filePath);
        addLog(`Selected reference: ${filePath}`);
    };

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    const handleJobDescriptionUpdate = (text: string) => {
        setJobDescription(text);
        addLog('Job description updated');
    };

    const handleParsedJobData = (data: ParsedJobDescription) => {
        setParsedJob(data);
        addLog('Job description parsed successfully');
    };

    // Handle starting the resize process
    const startResizeLeft = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizingLeft(true);
        document.addEventListener('mousemove', handleMouseMoveLeft);
        document.addEventListener('mouseup', stopResizeLeft);
    };

    const startResizeRight = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizingRight(true);
        document.addEventListener('mousemove', handleMouseMoveRight);
        document.addEventListener('mouseup', stopResizeRight);
    };

    // Handle the resize while mouse is moving
    const handleMouseMoveLeft = (e: MouseEvent) => {
        if (!isResizingLeft || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth = e.clientX - containerRect.left;

        // Limit the width to reasonable values
        if (newWidth >= 150 && newWidth <= 400) {
            setLeftPanelWidth(newWidth);
        }
    };

    const handleMouseMoveRight = (e: MouseEvent) => {
        if (!isResizingRight || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const newWidth = containerWidth - (e.clientX - containerRect.left);

        // Limit the width to reasonable values
        if (newWidth >= 200 && newWidth <= 600) {
            setRightPanelWidth(newWidth);
        }
    };

    // Clean up event listeners when resizing is done
    const stopResizeLeft = () => {
        setIsResizingLeft(false);
        document.removeEventListener('mousemove', handleMouseMoveLeft);
        document.removeEventListener('mouseup', stopResizeLeft);
    };

    const stopResizeRight = () => {
        setIsResizingRight(false);
        document.removeEventListener('mousemove', handleMouseMoveRight);
        document.removeEventListener('mouseup', stopResizeRight);
    };

    // Clean up event listeners when component unmounts
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMoveLeft);
            document.removeEventListener('mouseup', stopResizeLeft);
            document.removeEventListener('mousemove', handleMouseMoveRight);
            document.removeEventListener('mouseup', stopResizeRight);
        };
    }, []);

    return (
        <div className="app-container" ref={containerRef}>
            {/* Left Panel - Directory Tree */}
            <div
                className="directory-panel"
                ref={leftPanelRef}
                style={{ width: `${leftPanelWidth}px` }}
            >
                <DirectoryTree
                    onFileSelect={handleFileSelect}
                    basePath="D:\\UD\\Resume-CL"
                />
                {/* Right resize handle for left panel */}
                <div
                    className={`resize-handle right ${isResizingLeft ? 'active' : ''}`}
                    onMouseDown={startResizeLeft}
                />
            </div>

            {/* Center Panel - Document Viewer */}
            <div className="document-panel">
                <EnhancedDocumentViewer
                    filePath={selectedFile}
                    addLog={addLog}
                    jobDescription={jobDescription}
                    parsedJob={parsedJob}
                />
            </div>

            {/* Right Panel - Reference & Chat */}
            <div
                className="reference-panel"
                ref={rightPanelRef}
                style={{ width: `${rightPanelWidth}px` }}
            >
                {/* Left resize handle for right panel */}
                <div
                    className={`resize-handle left ${isResizingRight ? 'active' : ''}`}
                    onMouseDown={startResizeRight}
                />

                <EnhancedReferencePanel
                    referenceFile={referenceFile}
                    onReferenceSelect={handleReferenceSelect}
                    logs={logs}
                    onJobDescriptionUpdate={handleJobDescriptionUpdate}
                    onParsedJobData={handleParsedJobData}
                />
            </div>
        </div>
    );
};

export default App;
