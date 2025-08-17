import { ipcMain } from 'electron';
import { UrlParsingService, ParsedJobUrl } from '../services/urlParsingService';

// Initialize URL parsing handlers
export function initUrlParsingHandlers() {
  // Handle job URL parsing
  ipcMain.handle('parse-job-url', async (event, url: string) => {
    try {
      console.log(`Parsing job URL: ${url}`);
      const result = await UrlParsingService.parseJobUrl(url);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error in parse-job-url:', error);
      return { 
        success: false, 
        error: (error as Error).message || 'Failed to parse job URL' 
      };
    }
  });
}
