import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';

interface FileEntry {
    name: string;
    isDirectory: boolean;
    path: string;
}

interface DirectoryTreeProps {
    basePath: string;
    onFileSelect: (filePath: string) => void;
}

const DirectoryTree: React.FC<DirectoryTreeProps> = ({ basePath, onFileSelect }) => {
    const [entries, setEntries] = useState<FileEntry[]>([]);
    const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    useEffect(() => {
        loadDirectory(basePath);
    }, [basePath]);

    const loadDirectory = async (dirPath: string) => {
        try {
            const result = await ipcRenderer.invoke('list-directory', dirPath);
            setEntries(result);
        } catch (error) {
            console.error('Failed to load directory:', error);
        }
    };

    const toggleDirectory = async (dirPath: string) => {
        const newExpandedDirs = new Set(expandedDirs);

        if (newExpandedDirs.has(dirPath)) {
            newExpandedDirs.delete(dirPath);
        } else {
            newExpandedDirs.add(dirPath);
            await loadDirectory(dirPath);
        }

        setExpandedDirs(newExpandedDirs);
    };

    const handleFileClick = (filePath: string) => {
        setSelectedFile(filePath);
        onFileSelect(filePath);
    };

    const renderDirectoryTree = (entries: FileEntry[], parentPath: string) => {
        return (
            <ul className="directory-tree">
                {entries
                    .filter(entry => entry.path.startsWith(parentPath) &&
                        entry.path.split('\\').length === parentPath.split('\\').length + 1)
                    .map(entry => (
                        <li key={entry.path} className="directory-tree-item">
                            <div
                                className={`directory-tree-item-label ${selectedFile === entry.path ? 'active' : ''}`}
                                onClick={() => {
                                    if (entry.isDirectory) {
                                        toggleDirectory(entry.path);
                                    } else {
                                        handleFileClick(entry.path);
                                    }
                                }}
                            >
                                {entry.isDirectory ? '📁 ' : '📄 '}
                                {entry.name}
                            </div>

                            {entry.isDirectory && expandedDirs.has(entry.path) && (
                                <div className="directory-tree-children">
                                    {renderDirectoryTree(entries, entry.path)}
                                </div>
                            )}
                        </li>
                    ))}
            </ul>
        );
    };

    const refreshDirectory = () => {
        loadDirectory(basePath);
    };

    return (
        <div className="directory-tree-container">
            <div className="directory-tree-header">
                <h4>Resume Files</h4>
                <button className="refresh-button" onClick={refreshDirectory} title="Refresh">
                    🔄
                </button>
            </div>
            {entries.length > 0 ? (
                renderDirectoryTree(entries, basePath)
            ) : (
                <div className="directory-tree-empty">
                    <p>No files found. The directory might be empty or inaccessible.</p>
                    <button onClick={refreshDirectory}>Retry</button>
                </div>
            )}
        </div>
    );
};

export default DirectoryTree;
