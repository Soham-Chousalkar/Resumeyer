import React, { useState } from 'react';

interface JobDescriptionInputProps {
  onJobDescriptionSubmit: (jobDescription: string) => void;
  isProcessing: boolean;
}

const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  onJobDescriptionSubmit,
  isProcessing
}) => {
  const [jobDescription, setJobDescription] = useState<string>('');
  const [showInput, setShowInput] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobDescription.trim()) {
      onJobDescriptionSubmit(jobDescription);
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
      
      {showInput && (
        <form onSubmit={handleSubmit} className="job-description-form">
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job description here..."
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
