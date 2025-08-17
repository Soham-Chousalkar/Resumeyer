import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { setupOllamaHandlers } from './ollama-bridge';
import { PDFService } from '../services/pdfService';
import { initExportHandlers } from './export-bridge';
import { initUrlParsingHandlers } from './url-parsing-bridge';

// Define the base path for resume files
const RESUME_BASE_PATH = 'D:\\UD\\Resume-CL';

// Ensure the base directory exists
if (!fs.existsSync(RESUME_BASE_PATH)) {
    fs.mkdirSync(RESUME_BASE_PATH, { recursive: true });
}

let mainWindow: BrowserWindow | null = null;

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false, // Allow loading local files in iframes
            allowRunningInsecureContent: true, // For PDF viewing in iframes
        },
    });
    
    // Allow loading local PDF files in iframes
    mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
        const allowedPermissions = ['openExternal', 'media'];
        if (allowedPermissions.includes(permission)) {
            callback(true);
        } else {
            callback(false);
        }
    });

    // Load the index.html of the app
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Only open DevTools when explicitly requested
    // Commented out to prevent auto-opening
    // if (process.env.NODE_ENV === 'development') {
    //     mainWindow.webContents.openDevTools();
    // }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', () => {
    createWindow();
    setupOllamaHandlers();
    initExportHandlers();
    initUrlParsingHandlers();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// IPC handlers for file system operations

// Create directory if it doesn't exist
ipcMain.handle('create-directory', async (event, dirPath) => {
    try {
        // Verify path is within allowed directory
        const normalizedPath = path.normalize(dirPath);
        if (!normalizedPath.startsWith(RESUME_BASE_PATH)) {
            throw new Error('Access denied: Directory outside of allowed path');
        }

        if (!fs.existsSync(normalizedPath)) {
            await fs.promises.mkdir(normalizedPath, { recursive: true });
        }

        return true;
    } catch (error) {
        console.error('Error creating directory:', error);
        return false;
    }
});

// Write content to a file
ipcMain.handle('write-file', async (event, filePath, content) => {
    try {
        // Verify path is within allowed directory
        const normalizedPath = path.normalize(filePath);
        if (!normalizedPath.startsWith(RESUME_BASE_PATH)) {
            throw new Error('Access denied: File outside of allowed path');
        }

        // Ensure the directory exists
        const dirPath = path.dirname(normalizedPath);
        if (!fs.existsSync(dirPath)) {
            await fs.promises.mkdir(dirPath, { recursive: true });
        }

        await fs.promises.writeFile(filePath, content, 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing file:', error);
        return false;
    }
});
ipcMain.handle('list-directory', async (event, dirPath) => {
    try {
        // Verify path is within allowed directory
        const normalizedPath = path.normalize(dirPath);
        if (!normalizedPath.startsWith(RESUME_BASE_PATH)) {
            throw new Error('Access denied: Directory outside of allowed path');
        }

        const files = await fs.promises.readdir(normalizedPath, { withFileTypes: true });
        return files.map(file => ({
            name: file.name,
            isDirectory: file.isDirectory(),
            path: path.join(dirPath, file.name)
        }));
    } catch (error) {
        console.error('Error listing directory:', error);
        return [];
    }
});

ipcMain.handle('read-file', async (event, filePath) => {
    try {
        // Verify path is within allowed directory
        const normalizedPath = path.normalize(filePath);
        if (!normalizedPath.startsWith(RESUME_BASE_PATH)) {
            throw new Error('Access denied: File outside of allowed path');
        }

        // Check if file exists before trying to read it
        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filePath}`);
            return null;
        }

        // Check if the file is a PDF
        if (path.extname(filePath).toLowerCase() === '.pdf') {
            console.log('PDF file detected, using PDF parser');
            const pdfData = await PDFService.parsePDF(filePath);
            return pdfData.text;
        }

        return await fs.promises.readFile(filePath, 'utf8');
    } catch (error) {
        console.error('Error reading file:', error);
        return null; // Return null instead of throwing to handle errors gracefully
    }
});

// Get PDF information
ipcMain.handle('get-pdf-info', async (event, filePath) => {
    try {
        // Verify path is within allowed directory
        const normalizedPath = path.normalize(filePath);
        if (!normalizedPath.startsWith(RESUME_BASE_PATH)) {
            throw new Error('Access denied: File outside of allowed path');
        }

        // Check if file exists before trying to read it
        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filePath}`);
            return null;
        }

        // Check if the file is a PDF
        if (path.extname(filePath).toLowerCase() === '.pdf') {
            const pdfData = await PDFService.parsePDF(filePath);
            return {
                text: pdfData.text,
                info: pdfData.info,
                metadata: pdfData.metadata,
                pageCount: pdfData.pageCount
            };
        }

        return null; // Not a PDF file
    } catch (error) {
        console.error('Error getting PDF info:', error);
        return null;
    }
});

// Open PDF file in external application
ipcMain.handle('open-external-pdf', async (event, filePath) => {
    try {
        // Verify path is within allowed directory
        const normalizedPath = path.normalize(filePath);
        if (!normalizedPath.startsWith(RESUME_BASE_PATH)) {
            throw new Error('Access denied: File outside of allowed path');
        }
        
        // Check if file exists and is a PDF
        if (!fs.existsSync(filePath) || path.extname(filePath).toLowerCase() !== '.pdf') {
            throw new Error('Invalid PDF file');
        }
        
        // Open the PDF file with the system's default PDF viewer
        await require('electron').shell.openPath(filePath);
        return true;
    } catch (error) {
        console.error('Error opening external PDF:', error);
        return false;
    }
});

// Open file dialog
ipcMain.handle('open-file-dialog', async (event, options) => {
    try {
        if (!mainWindow) {
            throw new Error('Main window not available');
        }

        const { filePaths } = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [
                { name: 'Documents', extensions: ['txt', 'docx', 'pdf'] },
                { name: 'All Files', extensions: ['*'] }
            ],
            defaultPath: RESUME_BASE_PATH,
            ...options
        });

        if (filePaths && filePaths.length > 0) {
            const selectedPath = filePaths[0];

            // Check if the file is outside the allowed directory
            if (!selectedPath.startsWith(RESUME_BASE_PATH)) {
                // If outside, copy the file to the allowed directory
                const fileName = path.basename(selectedPath);
                const newPath = path.join(RESUME_BASE_PATH, 'Uploads', fileName);

                // Create the uploads directory if it doesn't exist
                const uploadsDir = path.join(RESUME_BASE_PATH, 'Uploads');
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }

                // Copy the file
                await fs.promises.copyFile(selectedPath, newPath);

                return { filePath: newPath, fileName };
            }

            return { filePath: selectedPath, fileName: path.basename(selectedPath) };
        }

        return null;
    } catch (error) {
        console.error('Error opening file dialog:', error);
        return null;
    }
});
