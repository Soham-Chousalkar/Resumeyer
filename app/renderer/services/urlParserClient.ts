import { ipcRenderer } from 'electron';

export interface ParsedJobUrl {
  title: string;
  company: string;
  description: string;
  url: string;
  source: string;
}

export class UrlParserClient {
  /**
   * Parse a job description from a URL
   */
  static async parseJobUrl(url: string): Promise<ParsedJobUrl> {
    try {
      const result = await ipcRenderer.invoke('parse-job-url', url);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to parse job URL');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error parsing job URL:', error);
      throw error;
    }
  }

  /**
   * Validate if a string is a valid URL
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Extract domain name from URL
   */
  static getDomainFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      return domain.startsWith('www.') ? domain.substring(4) : domain;
    } catch (error) {
      return 'unknown';
    }
  }
}
