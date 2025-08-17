import React, { useState } from 'react';
import JobUrlInput from './JobUrlInput';
import { ParsedJobUrl } from '../services/urlParserClient';

interface JobDescriptionInputProps {
  onJobDescriptionSubmit: (jobDescription: string) => void;
  isProcessing: boolean;
  onLog?: (message: string) => void;
}

const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  onJobDescriptionSubmit,
  isProcessing,
  onLog
}) => {
  const [jobDescription, setJobDescription] = useState<string>('');
  const [showInput, setShowInput] = useState<boolean>(false);
  const [parsedJob, setParsedJob] = useState<ParsedJobUrl | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobDescription.trim()) {
      onJobDescriptionSubmit(jobDescription);
    }
  };

  const handleJobUrlLoaded = (description: string) => {
    setJobDescription(description);
    if (description.trim()) {
      onJobDescriptionSubmit(description);
    }
  };

  const handleJobUrlParsed = (parsed: ParsedJobUrl) => {
    setParsedJob(parsed);
    if (onLog) {
      onLog(`Loaded job: ${parsed.title} at ${parsed.company} from ${parsed.source}`);
    }
  };

  return (
    <div className="job-description-container">
      <div className="job-description-header">
        <h3>Job Description</h3>
        <button 
          onClick={() => setShowInput(!showInput)}
          className="toggle-button"
        >
          {showInput ? 'Hide' : 'Show'}
        </button>
      </div>

      <JobUrlInput 
        onJobDescriptionLoaded={handleJobUrlLoaded}
        onJobUrlParsed={handleJobUrlParsed}
        onLog={onLog}
      />
      
      {showInput && (
        <form onSubmit={handleSubmit} className="job-description-form">
          {parsedJob && (
            <div className="parsed-job-info">
              <div className="parsed-job-title">{parsedJob.title}</div>
              <div className="parsed-job-company">{parsedJob.company}</div>
              <div className="parsed-job-source">Source: {parsedJob.source}</div>
            </div>
          )}
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder={parsedJob ? "Job description loaded from URL..." : "Paste job description here..."}
            rows={10}
            disabled={isProcessing}
            className="job-description-textarea"
          />
          <div className="job-description-actions">
            <button 
              type="submit" 
              disabled={isProcessing || !jobDescription.trim()}
              className="submit-button"
            >
              {isProcessing ? 'Processing...' : 'Tailor Resume'}
            </button>
            <button 
              type="button" 
              onClick={() => setJobDescription('')}
              disabled={isProcessing || !jobDescription.trim()}
              className="clear-button"
            >
              Clear
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default JobDescriptionInput;
