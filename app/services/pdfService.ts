import * as fs from 'fs';
import * as path from 'path';

export interface ParsedPDF {
    text: string;
    info?: any;
    metadata?: any;
    pageCount?: number;
}

/**
 * Service for handling PDF file operations
 */
export class PDFService {
    /**
     * Parse a PDF file and extract its text content
     * For PDF files, since we can't properly extract text without complex dependencies,
     * we'll use a simplified approach to get some basic readable content
     * 
     * @param filePath Path to the PDF file
     * @returns Promise with the parsed PDF data
     */
    static async parsePDF(filePath: string): Promise<ParsedPDF> {
        try {
            // For PDF files, we'll do a simple buffer read and extract readable strings
            const buffer = fs.readFileSync(filePath);

            // Extract ASCII text from PDF - very basic approach
            let text = '';
            let currentWord = '';
            let textSections: string[] = [];

            // Simple text extraction by looking for readable ASCII characters
            for (let i = 0; i < buffer.length; i++) {
                const byte = buffer[i];

                // Look for ASCII readable text (most printable ASCII chars)
                if (byte >= 32 && byte <= 126) {
                    currentWord += String.fromCharCode(byte);
                } else if (currentWord.length > 3) {
                    // If we have a word of reasonable length, save it
                    if (/^[a-zA-Z0-9\s.,;:'"!?()-]+$/.test(currentWord)) {
                        textSections.push(currentWord);
                    }
                    currentWord = '';
                } else {
                    currentWord = '';
                }
            }

            // Format the extracted text into lines
            let extractedText = textSections.join(' ');
            extractedText = extractedText.replace(/\s{2,}/g, ' ').trim();

            // If we couldn't extract meaningful text, provide a message
            if (extractedText.length < 50) {
                extractedText = `This appears to be a PDF file (${path.basename(filePath)}).\n\n` +
                    `PDF content could not be fully extracted. Please open the original file for full content.`;
            }

            return {
                text: extractedText,
                pageCount: 1, // We don't know the page count with this method
                info: { filename: path.basename(filePath) },
                metadata: { size: buffer.length }
            };
        } catch (error: any) {
            console.error('Error parsing PDF:', error);
            throw new Error(`Failed to parse PDF: ${error.message || 'Unknown error'}`);
        }
    }

    /**
     * Check if a file is a PDF
     * @param filePath Path to the file
     * @returns boolean indicating if the file is a PDF
     */
    static isPDF(filePath: string): boolean {
        return path.extname(filePath).toLowerCase() === '.pdf';
    }
}