import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { ResumeEditorService, ResumeEdit, EditPlan } from '../services/resumeEditorService';
import { ParsedJobDescription } from '../services/jobParserService';

interface ResumeTailoringProps {
  resumeContent: string;
  jobDescription?: string;
  parsedJob?: ParsedJobDescription | null;
  onEditSuggestions: (editPlan: EditPlan) => void;
  onLog: (message: string) => void;
}

const ResumeTailoring: React.FC<ResumeTailoringProps> = ({
  resumeContent,
  jobDescription,
  parsedJob,
  onEditSuggestions,
  onLog
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [resumeEditorService] = useState<ResumeEditorService>(new ResumeEditorService());
  const [processedJobDescription, setProcessedJobDescription] = useState<string>('');

  useEffect(() => {
    // When we have a parsed job, format it as a clean job description
    if (parsedJob) {
      const formattedJD = formatParsedJob(parsedJob);
      setProcessedJobDescription(formattedJD);
    } else if (jobDescription) {
      setProcessedJobDescription(jobDescription);
    }
  }, [parsedJob, jobDescription]);

  // Format parsed job into a clean job description
  const formatParsedJob = (parsed: ParsedJobDescription): string => {
    let result = `Job Title: ${parsed.title}\n`;
    result += `Company: ${parsed.company}\n`;
    result += `Location: ${parsed.location}\n`;
    result += `Employment Type: ${parsed.employmentType}\n\n`;
    
    result += "Required Skills:\n";
    parsed.required_skills.forEach(skill => {
      result += `- ${skill}\n`;
    });
    result += "\n";

    result += "Preferred Skills:\n";
    parsed.preferred_skills.forEach(skill => {
      result += `- ${skill}\n`;
    });
    result += "\n";

    result += "Responsibilities:\n";
    parsed.responsibilities.forEach(resp => {
      result += `- ${resp}\n`;
    });
    result += "\n";

    result += "Qualifications:\n";
    parsed.qualifications.forEach(qual => {
      result += `- ${qual}\n`;
    });

    if (parsed.benefits && parsed.benefits.length > 0) {
      result += "\nBenefits:\n";
      parsed.benefits.forEach(benefit => {
        result += `- ${benefit}\n`;
      });
    }

    return result;
  };

  const generateTailoringEdits = async () => {
    if (!resumeContent || !processedJobDescription) {
      onLog('Please provide both resume and job description');
      return;
    }

    setIsGenerating(true);
    onLog('Generating resume tailoring suggestions...');

    try {
      // Generate edit suggestions
      const editPlan = await resumeEditorService.generateEditSuggestions(
        resumeContent,
        processedJobDescription
      );

      // Pass suggestions to parent
      onEditSuggestions(editPlan);
      onLog(`Generated ${editPlan.edits.length} tailoring suggestions`);
    } catch (error) {
      console.error('Error generating tailoring suggestions:', error);
      onLog(`Error generating tailoring suggestions: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="resume-tailoring">
      <button 
        className={`tailor-button ${isGenerating ? 'disabled' : ''}`}
        onClick={generateTailoringEdits}
        disabled={isGenerating || !resumeContent || !processedJobDescription}
      >
        {isGenerating ? 'Generating Suggestions...' : 'Tailor Resume to Job'}
      </button>
      
      {!resumeContent && (
        <p className="tailoring-info">Please load a resume first</p>
      )}
      
      {!processedJobDescription && (
        <p className="tailoring-info">Please provide a job description</p>
      )}
    </div>
  );
};

export default ResumeTailoring;
