import React, { useEffect, useState } from 'react';
import { OllamaClient } from '../services/ollamaClient';

interface OllamaStatusProps {
    addLog: (message: string) => void;
}

const OllamaStatus: React.FC<OllamaStatusProps> = ({ addLog }) => {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [statusMessage, setStatusMessage] = useState<string>('Checking Ollama status...');
    const [ollamaClient] = useState<OllamaClient>(new OllamaClient());

    useEffect(() => {
        checkOllamaStatus();
    }, []);

    const checkOllamaStatus = async () => {
        setIsLoading(true);
        try {
            const result = await ollamaClient.initialize();
            setIsConnected(result.status);
            setStatusMessage(result.message);
            addLog(result.message);
        } catch (error) {
            console.error('Error initializing Ollama:', error);
            setIsConnected(false);
            setStatusMessage(`Failed to connect to Ollama: ${error}`);
            addLog(`Failed to connect to Ollama: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartOllama = async () => {
        setIsLoading(true);
        setStatusMessage('Attempting to start Ollama...');
        try {
            const started = await ollamaClient.startOllama();
            if (started) {
                setIsConnected(true);
                setStatusMessage('Ollama started successfully');
                addLog('Ollama started successfully');
            } else {
                setStatusMessage('Failed to start Ollama');
                addLog('Failed to start Ollama');
            }
        } catch (error) {
            console.error('Error starting Ollama:', error);
            setStatusMessage(`Error starting Ollama: ${error}`);
            addLog(`Error starting Ollama: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestOllama = async () => {
        setIsLoading(true);
        setStatusMessage('Testing Ollama...');
        try {
            const response = await ollamaClient.generate(
                'Hello! Can you tell me a brief joke about programming?',
                undefined,
                'You are a helpful assistant who responds with brief, humorous content.'
            );
            setStatusMessage(`Ollama responded: ${response}`);
            addLog(`Tested Ollama successfully: ${response.substring(0, 100)}...`);
        } catch (error) {
            console.error('Error testing Ollama:', error);
            setStatusMessage(`Error testing Ollama: ${error}`);
            addLog(`Error testing Ollama: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="ollama-status">
            <div className="status-indicator">
                <div className={`indicator-light ${isConnected ? 'green' : 'red'}`}></div>
                <div className="status-text">
                    <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                    {isLoading && <span className="loading-spinner">⟳</span>}
                </div>
            </div>
            <div className="status-message">{statusMessage}</div>
            <div className="status-actions">
                <button
                    onClick={checkOllamaStatus}
                    disabled={isLoading}
                >
                    Refresh Status
                </button>
                <button
                    onClick={handleStartOllama}
                    disabled={isLoading || isConnected}
                >
                    Start Ollama
                </button>
                <button
                    onClick={handleTestOllama}
                    disabled={isLoading || !isConnected}
                >
                    Test Connection
                </button>
            </div>
        </div>
    );
};

export default OllamaStatus;
