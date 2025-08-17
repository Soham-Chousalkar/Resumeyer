import React, { useState } from 'react';
import { ResumeEdit } from '../services/resumeEditorService';

interface ResumeEditViewerProps {
  edits: ResumeEdit[];
  keywords: {
    must: string[];
    nice: string[];
  };
  summary: string;
  onApplyEdit: (edit: ResumeEdit) => void;
  onApplyAllEdits: () => void;
}

const ResumeEditViewer: React.FC<ResumeEditViewerProps> = ({
  edits,
  keywords,
  summary,
  onApplyEdit,
  onApplyAllEdits
}) => {
  const [expandedEditIndex, setExpandedEditIndex] = useState<number | null>(null);
  
  const toggleEdit = (index: number) => {
    setExpandedEditIndex(expandedEditIndex === index ? null : index);
  };
  
  return (
    <div className="resume-edit-viewer">
      <div className="resume-edit-summary">
        <h3>AI Suggestions</h3>
        <p>{summary}</p>
        
        <div className="keywords-container">
          <div className="keyword-section">
            <h4>Must-Have Keywords</h4>
            <div className="keyword-tags">
              {keywords.must.map((keyword, index) => (
                <span key={`must-${index}`} className="keyword-tag must-have">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          
          <div className="keyword-section">
            <h4>Nice-to-Have Keywords</h4>
            <div className="keyword-tags">
              {keywords.nice.map((keyword, index) => (
                <span key={`nice-${index}`} className="keyword-tag nice-have">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="edits-container">
        <div className="edits-header">
          <h4>Suggested Edits ({edits.length})</h4>
          <button 
            onClick={onApplyAllEdits}
            disabled={edits.length === 0}
            className="apply-all-button"
          >
            Apply All
          </button>
        </div>
        
        {edits.length > 0 ? (
          <div className="edits-list">
            {edits.map((edit, index) => (
              <div 
                key={index} 
                className={`edit-item ${expandedEditIndex === index ? 'expanded' : ''}`}
              >
                <div 
                  className="edit-header"
                  onClick={() => toggleEdit(index)}
                >
                  <span className="edit-section">{edit.section}</span>
                  <span className="edit-expand">{expandedEditIndex === index ? '−' : '+'}</span>
                </div>
                
                {expandedEditIndex === index && (
                  <div className="edit-details">
                    <div className="edit-original">
                      <h5>Original</h5>
                      <p>{edit.original}</p>
                    </div>
                    
                    <div className="edit-suggestion">
                      <h5>Suggestion</h5>
                      <p>{edit.suggestion}</p>
                    </div>
                    
                    <div className="edit-reason">
                      <h5>Reason</h5>
                      <p>{edit.reason}</p>
                    </div>
                    
                    <button 
                      className="apply-edit-button"
                      onClick={() => onApplyEdit(edit)}
                    >
                      Apply This Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-edits">
            <p>No edits suggested yet. Submit a job description to get tailored suggestions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeEditViewer;
