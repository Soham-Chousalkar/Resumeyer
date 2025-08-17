import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { ipcRenderer } from 'electron';

interface DocumentViewerProps {
    filePath: string | null;
    addLog: (message: string) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ filePath, addLog }) => {
    const [content, setContent] = useState<string>('');

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

    return (
        <>
            <div className="editor-toolbar">
                <button
                    className={`toolbar-button ${editor?.isActive('bold') ? 'active' : ''}`}
                    onClick={handleBold}
                >
                    Bold
                </button>
                <button
                    className={`toolbar-button ${editor?.isActive('italic') ? 'active' : ''}`}
                    onClick={handleItalic}
                >
                    Italic
                </button>
                <button
                    className={`toolbar-button ${editor?.isActive('bulletList') ? 'active' : ''}`}
                    onClick={handleBulletList}
                >
                    Bullet List
                </button>
                <button
                    className={`toolbar-button ${editor?.isActive('orderedList') ? 'active' : ''}`}
                    onClick={handleOrderedList}
                >
                    Ordered List
                </button>
            </div>
            <div className="editor-content-container">
                <EditorContent editor={editor} />
                <div className="editor-status-bar">
                    {filePath && (
                        <span className="current-file">
                            Current file: {filePath.split('\\').pop()}
                        </span>
                    )}
                </div>
            </div>
        </>
    );
};

export default DocumentViewer;
