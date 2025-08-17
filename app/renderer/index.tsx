import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './styles/global.css';
import './styles/ollama.css';
import './styles/job-description.css';
import './styles/resume-edit.css';
import './styles/enhanced-document.css';
import './styles/job-parser.css';
import './styles/enhanced-reference.css';
import './styles/document-preview.css';
import './styles/resume-tailoring.css';
import './styles/pdf-viewer.css';
import './styles/export-tools.css';
import './styles/job-url.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
