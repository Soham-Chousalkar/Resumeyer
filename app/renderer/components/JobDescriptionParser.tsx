import React, { useState } from 'react';
import { JobParserService, ParsedJobDescription } from '../services/jobParserService';

interface JobDescriptionParserProps {
  onParsedData?: (data: ParsedJobDescription) => void;
  onKeywords?: (keywords: string[]) => void;
  onRawJobDescription?: (text: string) => void;
}

const JobDescriptionParser: React.FC<JobDescriptionParserProps> = ({
  onParsedData,
  onKeywords,
  onRawJobDescription
}) => {
  const [jobDescription, setJobDescription] = useState<string>('');
  const [parsedJob, setParsedJob] = useState<ParsedJobDescription | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<{ level: string, years?: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'input' | 'parsed' | 'keywords'>('input');

  const [jobParserService] = useState<JobParserService>(new JobParserService());

  const handleParse = async () => {
    if (!jobDescription.trim()) return;

    setIsLoading(true);
    try {
      // Pass raw job description to parent if needed
      if (onRawJobDescription) {
        onRawJobDescription(jobDescription);
      }

      // Parse job description
      const parsed = await jobParserService.parseJobDescription(jobDescription);
      setParsedJob(parsed);

      // Extract keywords
      const extractedKeywords = await jobParserService.extractKeywords(jobDescription);
      setKeywords(extractedKeywords);

      // Analyze experience level
      const expLevel = await jobParserService.analyzeExperienceLevel(jobDescription);
      setExperienceLevel(expLevel);

      // Switch to parsed tab
      setActiveTab('parsed');

      // Call callbacks if provided
      if (onParsedData) onParsedData(parsed);
      if (onKeywords) onKeywords(extractedKeywords);
    } catch (error) {
      console.error('Error parsing job description:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlPaste = () => {
    // This will be implemented later for URL parsing
    alert('URL parsing will be implemented in a future update');
  };

  const renderInputTab = () => (
    <div className="job-parser-input-tab">
      <div className="input-actions">
        <button
          className="url-button"
          onClick={handleUrlPaste}
          disabled={isLoading}
        >
          Paste URL
        </button>
      </div>
      <textarea
        className="job-description-textarea"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste job description here..."
        disabled={isLoading}
        rows={15}
      />
      <div className="parse-actions">
        <button
          className="parse-button"
          onClick={handleParse}
          disabled={isLoading || !jobDescription.trim()}
        >
          {isLoading ? 'Parsing...' : 'Parse Job Description'}
        </button>
        <button
          className="clear-button"
          onClick={() => setJobDescription('')}
          disabled={isLoading || !jobDescription.trim()}
        >
          Clear
        </button>
      </div>
    </div>
  );

  const renderParsedTab = () => {
    if (!parsedJob) return <div className="no-data">No parsed data yet. Parse a job description first.</div>;

    return (
      <div className="job-parser-parsed-tab">
        <div className="parsed-job-header">
          <h3>{parsedJob.title}</h3>
          <div className="company-info">
            <span>{parsedJob.company}</span>
            {parsedJob.location && <span className="location"> • {parsedJob.location}</span>}
            {parsedJob.employmentType && <span className="employment-type"> • {parsedJob.employmentType}</span>}
          </div>
          {experienceLevel && (
            <div className="experience-level">
              <span className="level-label">Experience Level:</span>
              <span className="level-value">{experienceLevel.level}</span>
              {experienceLevel.years && <span className="years-value"> ({experienceLevel.years} years)</span>}
            </div>
          )}
        </div>

        <div className="parsed-sections">
          {parsedJob.required_skills.length > 0 && (
            <div className="parsed-section">
              <h4>Required Skills</h4>
              <ul>
                {parsedJob.required_skills.map((skill, index) => (
                  <li key={`req-skill-${index}`}>{skill}</li>
                ))}
              </ul>
            </div>
          )}

          {parsedJob.preferred_skills.length > 0 && (
            <div className="parsed-section">
              <h4>Preferred Skills</h4>
              <ul>
                {parsedJob.preferred_skills.map((skill, index) => (
                  <li key={`pref-skill-${index}`}>{skill}</li>
                ))}
              </ul>
            </div>
          )}

          {parsedJob.responsibilities.length > 0 && (
            <div className="parsed-section">
              <h4>Responsibilities</h4>
              <ul>
                {parsedJob.responsibilities.map((resp, index) => (
                  <li key={`resp-${index}`}>{resp}</li>
                ))}
              </ul>
            </div>
          )}

          {parsedJob.qualifications.length > 0 && (
            <div className="parsed-section">
              <h4>Qualifications</h4>
              <ul>
                {parsedJob.qualifications.map((qual, index) => (
                  <li key={`qual-${index}`}>{qual}</li>
                ))}
              </ul>
            </div>
          )}

          {parsedJob.benefits && parsedJob.benefits.length > 0 && (
            <div className="parsed-section">
              <h4>Benefits</h4>
              <ul>
                {parsedJob.benefits.map((benefit, index) => (
                  <li key={`benefit-${index}`}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}

          {parsedJob.salary_range && (
            <div className="parsed-section">
              <h4>Salary Range</h4>
              <p>{parsedJob.salary_range}</p>
            </div>
          )}

          {parsedJob.application_deadline && (
            <div className="parsed-section">
              <h4>Application Deadline</h4>
              <p>{parsedJob.application_deadline}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderKeywordsTab = () => {
    if (!keywords.length) return <div className="no-data">No keywords extracted yet. Parse a job description first.</div>;

    return (
      <div className="job-parser-keywords-tab">
        <div className="keywords-header">
          <h3>Extracted Keywords</h3>
          <p className="keywords-description">
            These are the key skills and qualifications you should highlight in your resume.
          </p>
        </div>
        <div className="keywords-cloud">
          {keywords.map((keyword, index) => (
            <span key={`keyword-${index}`} className="keyword-tag">
              {keyword}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="job-parser-container">
      <div className="job-parser-tabs">
        <button
          className={`tab-button ${activeTab === 'input' ? 'active' : ''}`}
          onClick={() => setActiveTab('input')}
        >
          Input
        </button>
        <button
          className={`tab-button ${activeTab === 'parsed' ? 'active' : ''}`}
          onClick={() => setActiveTab('parsed')}
          disabled={!parsedJob}
        >
          Parsed Data
        </button>
        <button
          className={`tab-button ${activeTab === 'keywords' ? 'active' : ''}`}
          onClick={() => setActiveTab('keywords')}
          disabled={!keywords.length}
        >
          Keywords
        </button>
      </div>

      <div className="job-parser-content">
        {activeTab === 'input' && renderInputTab()}
        {activeTab === 'parsed' && renderParsedTab()}
        {activeTab === 'keywords' && renderKeywordsTab()}
      </div>
    </div>
  );
};

export default JobDescriptionParser;
