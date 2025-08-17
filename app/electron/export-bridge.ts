import { ipcMain, dialog } from 'electron';
import fs from 'fs';
import path from 'path';
import { ExportService, ExportOptions } from '../services/exportService';

// Base path for exported documents
const EXPORTS_BASE_PATH = 'D:\\UD\\Resume-CL\\Exports';

// Initialize export handlers
export function initExportHandlers() {
  // Ensure exports directory exists
  if (!fs.existsSync(EXPORTS_BASE_PATH)) {
    fs.mkdirSync(EXPORTS_BASE_PATH, { recursive: true });
  }

  // Handle PDF export
  ipcMain.handle('export-to-pdf', async (event, options: ExportOptions) => {
    try {
      // If path is not provided, use default location
      if (!options.outputPath) {
        options.outputPath = path.join(EXPORTS_BASE_PATH, `${options.title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
      }
      
      const filePath = await ExportService.exportToPDF(options);
      return { success: true, filePath };
    } catch (error) {
      console.error('Error in export-to-pdf:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Handle DOCX export
  ipcMain.handle('export-to-docx', async (event, options: ExportOptions) => {
    try {
      // If path is not provided, use default location
      if (!options.outputPath) {
        options.outputPath = path.join(EXPORTS_BASE_PATH, `${options.title.replace(/[^a-z0-9]/gi, '_')}.docx`);
      }
      
      const filePath = await ExportService.exportToDOCX(options);
      return { success: true, filePath };
    } catch (error) {
      console.error('Error in export-to-docx:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Handle export dialog
  ipcMain.handle('show-export-dialog', async (event, options: {
    title: string;
    defaultPath: string;
    filters: { name: string; extensions: string[] }[];
  }) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: options.title || 'Save File',
        defaultPath: options.defaultPath,
        filters: options.filters,
        properties: ['createDirectory', 'showOverwriteConfirmation']
      });

      if (canceled || !filePath) {
        return { canceled: true };
      }

      return { canceled: false, filePath };
    } catch (error) {
      console.error('Error in show-export-dialog:', error);
      return { canceled: true, error: (error as Error).message };
    }
  });
}
