import React, { useState } from 'react';
import { UrlParserClient, ParsedJobUrl } from '../services/urlParserClient';

interface JobUrlInputProps {
  onJobDescriptionLoaded: (jobDescription: string) => void;
  onJobUrlParsed: (parsedJob: ParsedJobUrl) => void;
  onLog?: (message: string) => void;
}

const JobUrlInput: React.FC<JobUrlInputProps> = ({ 
  onJobDescriptionLoaded, 
  onJobUrlParsed,
  onLog 
}) => {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate URL
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!UrlParserClient.isValidUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      if (onLog) onLog(`Parsing job description from URL: ${url}`);
      
      // Parse the job URL
      const parsedJob = await UrlParserClient.parseJobUrl(url);
      
      // Update the job description
      onJobDescriptionLoaded(parsedJob.description);
      
      // Pass the parsed job data
      onJobUrlParsed(parsedJob);
      
      if (onLog) onLog(`Successfully parsed job from ${parsedJob.source}: ${parsedJob.title}`);
    } catch (error) {
      console.error('Error parsing URL:', error);
      setError(`Failed to parse URL: ${(error as Error).message}`);
      if (onLog) onLog(`Error parsing URL: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="job-url-input">
      <h3>Import Job Description from URL</h3>
      <form onSubmit={handleSubmit} className="url-form">
        <div className="input-group">
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="Enter job posting URL (LinkedIn, Indeed, etc.)"
            disabled={isLoading}
            className="url-input"
          />
          <button 
            type="submit" 
            disabled={isLoading || !url.trim()}
            className="url-submit-button"
          >
            {isLoading ? 'Loading...' : 'Import'}
          </button>
        </div>
        {error && <div className="url-error">{error}</div>}
        {isLoading && <div className="url-loading">Parsing job description...</div>}
      </form>
      <div className="url-info">
        <p>Supported sites: LinkedIn, Indeed, Glassdoor, and most job boards</p>
      </div>
    </div>
  );
};

export default JobUrlInput;
