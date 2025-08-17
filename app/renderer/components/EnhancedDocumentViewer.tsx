import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { ipcRenderer } from 'electron';
import JobDescriptionInput from './JobDescriptionInput';
import ResumeEditViewer from './ResumeEditViewer';
import ResumeTailoring from './ResumeTailoring';
import ExportTools from './ExportTools';
import { ResumeEditorService, ResumeEdit, EditPlan } from '../services/resumeEditorService';
import { ParsedJobDescription } from '../services/jobParserService';

interface EnhancedDocumentViewerProps {
  filePath: string | null;
  addLog: (message: string) => void;
  jobDescription?: string;
  parsedJob?: ParsedJobDescription | null;
}

const EnhancedDocumentViewer: React.FC<EnhancedDocumentViewerProps> = ({
  filePath,
  addLog,
  jobDescription,
  parsedJob
}) => {
  const [content, setContent] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [editPlan, setEditPlan] = useState<EditPlan | null>(null);
  const [resumeEditorService] = useState<ResumeEditorService>(new ResumeEditorService());
  const [localJobDescription, setLocalJobDescription] = useState<string>('');
  const [localParsedJob, setLocalParsedJob] = useState<ParsedJobDescription | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Document,
      Paragraph,
      Text,
    ],
    content: '<p>Select a file to view and edit</p>',
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Convert HTML to plain text for content state
      const div = document.createElement('div');
      div.innerHTML = html;
      setContent(div.textContent || '');
    },
  });

  useEffect(() => {
    if (filePath) {
      loadFile(filePath);
    }
  }, [filePath]);

  const loadFile = async (path: string) => {
    try {
      const content = await ipcRenderer.invoke('read-file', path);

      if (content !== null) {
        setContent(content);

        // Update editor content
        if (editor) {
          editor.commands.setContent(`<p>${content.replace(/\\n/g, '</p><p>')}</p>`);
        }

        addLog(`Loaded file: ${path}`);

        // Reset any previous edit plans
        setEditPlan(null);
      } else {
        // Handle missing file
        setContent('');
        if (editor) {
          editor.commands.setContent('<p>File not found or could not be read</p>');
        }
        addLog(`File not found: ${path}`);
      }
    } catch (error) {
      console.error('Failed to load file:', error);
      addLog(`Error loading file: ${error}`);

      // Reset editor content on error
      if (editor) {
        editor.commands.setContent('<p>Error loading file</p>');
      }
    }
  };

  const handleJobDescriptionSubmit = async (jdText: string) => {
    if (!content || !editor) {
      addLog('No resume loaded. Please load a resume first.');
      return;
    }

    // Save the job description text
    setLocalJobDescription(jdText);

    // Reset parsed job data if we're using a new job description
    setLocalParsedJob(null);

    addLog('Job description received. You can now tailor your resume.');
  };

  const handleParsedJobData = (data: ParsedJobDescription) => {
    setLocalParsedJob(data);
    addLog('Job description parsed successfully.');
  };

  const handleEditSuggestions = (suggestions: EditPlan) => {
    setEditPlan(suggestions);
    addLog(`Generated ${suggestions.edits.length} edit suggestions.`);
  };

  const applyEdit = (edit: ResumeEdit) => {
    if (!editor) return;

    // Get the current HTML
    const html = editor.getHTML();

    // Simple replace (in the future, we would want a more robust approach)
    const updatedHtml = html.replace(edit.original, edit.suggestion);

    // Set the updated content
    editor.commands.setContent(updatedHtml);

    addLog(`Applied edit to "${edit.original.substring(0, 20)}..."`);
  };

  const applyAllEdits = () => {
    if (!editor || !editPlan) return;

    const html = editor.getHTML();
    let updatedHtml = html;

    // Apply all edits to the HTML
    for (const edit of editPlan.edits) {
      updatedHtml = updatedHtml.replace(edit.original, edit.suggestion);
    }

    // Set the updated content
    editor.commands.setContent(updatedHtml);

    addLog(`Applied all ${editPlan.edits.length} edits.`);
  };

  // Enhanced toolbar with more formatting options
  const handleBold = () => {
    editor?.chain().focus().toggleBold().run();
  };

  const handleItalic = () => {
    editor?.chain().focus().toggleItalic().run();
  };

  const handleBulletList = () => {
    editor?.chain().focus().toggleBulletList().run();
  };

  const handleOrderedList = () => {
    editor?.chain().focus().toggleOrderedList().run();
  };

  const handleHeading = (level: 1 | 2 | 3) => {
    editor?.chain().focus().toggleHeading({ level }).run();
  };

  const handleUnderline = () => {
    editor?.chain().focus().toggleUnderline().run();
  };

  const handleStrike = () => {
    editor?.chain().focus().toggleStrike().run();
  };

  // Text alignment - not using for now since it requires additional extensions
  const handleAlign = (align: 'left' | 'center' | 'right') => {
    console.log(`Text alignment (${align}) would be set here with proper extensions`);
    // We would need to add the alignment extension to TipTap:
    // import { TextAlign } from '@tiptap/extension-text-align'
  };

  return (
    <div className="enhanced-document-viewer">
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button
            className={`toolbar-button ${editor?.isActive('bold') ? 'active' : ''}`}
            onClick={handleBold}
            title="Bold"
          >
            B
          </button>
          <button
            className={`toolbar-button ${editor?.isActive('italic') ? 'active' : ''}`}
            onClick={handleItalic}
            title="Italic"
          >
            I
          </button>
          <button
            className={`toolbar-button ${editor?.isActive('underline') ? 'active' : ''}`}
            onClick={handleUnderline}
            title="Underline"
          >
            U
          </button>
          <button
            className={`toolbar-button ${editor?.isActive('strike') ? 'active' : ''}`}
            onClick={handleStrike}
            title="Strikethrough"
          >
            S
          </button>
        </div>

        <div className="toolbar-group">
          <button
            className={`toolbar-button ${editor?.isActive('heading', { level: 1 }) ? 'active' : ''}`}
            onClick={() => handleHeading(1)}
            title="Heading 1"
          >
            H1
          </button>
          <button
            className={`toolbar-button ${editor?.isActive('heading', { level: 2 }) ? 'active' : ''}`}
            onClick={() => handleHeading(2)}
            title="Heading 2"
          >
            H2
          </button>
          <button
            className={`toolbar-button ${editor?.isActive('heading', { level: 3 }) ? 'active' : ''}`}
            onClick={() => handleHeading(3)}
            title="Heading 3"
          >
            H3
          </button>
        </div>

        <div className="toolbar-group">
          <button
            className={`toolbar-button ${editor?.isActive('bulletList') ? 'active' : ''}`}
            onClick={handleBulletList}
            title="Bullet List"
          >
            • List
          </button>
          <button
            className={`toolbar-button ${editor?.isActive('orderedList') ? 'active' : ''}`}
            onClick={handleOrderedList}
            title="Numbered List"
          >
            1. List
          </button>
        </div>

        <div className="toolbar-group">
          <button
            className={`toolbar-button ${editor?.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
            onClick={() => handleAlign('left')}
            title="Align Left"
          >
            ←
          </button>
          <button
            className={`toolbar-button ${editor?.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
            onClick={() => handleAlign('center')}
            title="Align Center"
          >
            ↔
          </button>
          <button
            className={`toolbar-button ${editor?.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
            onClick={() => handleAlign('right')}
            title="Align Right"
          >
            →
          </button>
        </div>
      </div>

      <div className="document-content-area">
        <div className="editor-content-container">
          <EditorContent editor={editor} />
          <div className="editor-status-bar">
            {filePath && (
              <span className="current-file">
                Current file: {filePath.split('\\').pop()}
              </span>
            )}
          </div>
          {filePath && content && (
            <ExportTools
              title={filePath.split('\\').pop() || 'Document'}
              content={content}
              onExportComplete={(result) => {
                if (result.success) {
                  addLog(`Successfully exported to ${result.format.toUpperCase()}: ${result.filePath}`);
                } else {
                  addLog(`Failed to export to ${result.format.toUpperCase()}`);
                }
              }}
            />
          )}
        </div>

        <div className="editor-sidebar">
          <JobDescriptionInput
            onJobDescriptionSubmit={handleJobDescriptionSubmit}
            isProcessing={isProcessing}
          />

          {content && (jobDescription || parsedJob || localJobDescription || localParsedJob) && (
            <ResumeTailoring
              resumeContent={content}
              jobDescription={jobDescription || localJobDescription}
              parsedJob={parsedJob || localParsedJob}
              onEditSuggestions={handleEditSuggestions}
              onLog={addLog}
            />
          )}

          {editPlan && (
            <ResumeEditViewer
              edits={editPlan.edits}
              keywords={editPlan.keywords}
              summary={editPlan.summary}
              onApplyEdit={applyEdit}
              onApplyAllEdits={applyAllEdits}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedDocumentViewer;
