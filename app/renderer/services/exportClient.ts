import { ipcRenderer } from 'electron';

// Interface for export options
export interface ExportOptions {
  title: string;
  content: string;
  outputPath?: string;
}

// Interface for dialog options
export interface SaveDialogOptions {
  title: string;
  defaultPath: string;
  filters: { name: string; extensions: string[] }[];
}

// Service for document exporting
export class ExportClient {
  /**
   * Show save dialog to select the export location
   */
  static async showSaveDialog(options: SaveDialogOptions): Promise<{ canceled: boolean; filePath?: string }> {
    return await ipcRenderer.invoke('show-export-dialog', options);
  }

  /**
   * Export content to PDF
   */
  static async exportToPDF(options: ExportOptions): Promise<{ success: boolean; filePath?: string; error?: string }> {
    return await ipcRenderer.invoke('export-to-pdf', options);
  }

  /**
   * Export content to DOCX
   */
  static async exportToDOCX(options: ExportOptions): Promise<{ success: boolean; filePath?: string; error?: string }> {
    return await ipcRenderer.invoke('export-to-docx', options);
  }

  /**
   * Show the document selection dialog and export to PDF
   */
  static async showAndExportToPDF(title: string, content: string): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      // Show save dialog
      const saveResult = await this.showSaveDialog({
        title: 'Save as PDF',
        defaultPath: `D:\\UD\\Resume-CL\\Exports\\${title.replace(/[^a-z0-9]/gi, '_')}.pdf`,
        filters: [
          { name: 'PDF Documents', extensions: ['pdf'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (saveResult.canceled || !saveResult.filePath) {
        return { success: false, error: 'Export canceled' };
      }

      // Export to PDF
      return await this.exportToPDF({
        title,
        content,
        outputPath: saveResult.filePath
      });
    } catch (error) {
      console.error('Error in showAndExportToPDF:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Show the document selection dialog and export to DOCX
   */
  static async showAndExportToDOCX(title: string, content: string): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      // Show save dialog
      const saveResult = await this.showSaveDialog({
        title: 'Save as DOCX',
        defaultPath: `D:\\UD\\Resume-CL\\Exports\\${title.replace(/[^a-z0-9]/gi, '_')}.docx`,
        filters: [
          { name: 'Word Documents', extensions: ['docx'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (saveResult.canceled || !saveResult.filePath) {
        return { success: false, error: 'Export canceled' };
      }

      // Export to DOCX
      return await this.exportToDOCX({
        title,
        content,
        outputPath: saveResult.filePath
      });
    } catch (error) {
      console.error('Error in showAndExportToDOCX:', error);
      return { success: false, error: (error as Error).message };
    }
  }
}
