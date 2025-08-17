import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import fs from 'fs';
import path from 'path';

// Interface for export options
export interface ExportOptions {
  title: string;
  content: string;
  outputPath: string;
}

// Service to export documents to PDF and DOCX
export class ExportService {
  /**
   * Export content to PDF
   */
  static async exportToPDF(options: ExportOptions): Promise<string> {
    try {
      const { title, content, outputPath } = options;
      
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set document properties
      doc.setProperties({
        title: title,
        subject: 'Resume/Cover Letter',
        author: 'Resumeyer',
        creator: 'Resumeyer App'
      });
      
      // Format content
      const formattedContent = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      // Add content to PDF
      let y = 20; // starting y position
      
      // Add title
      doc.setFontSize(16);
      doc.text(title, 20, y);
      y += 10;
      
      // Add content with proper formatting
      doc.setFontSize(12);
      
      formattedContent.forEach(line => {
        // Check if we need a new page
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        // Handle different text styles (basic implementation)
        if (line.startsWith('# ')) {
          // Main header
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text(line.substring(2), 20, y);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          y += 8;
        } else if (line.startsWith('## ')) {
          // Sub header
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(line.substring(3), 20, y);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          y += 7;
        } else if (line.startsWith('* ')) {
          // Bullet point
          doc.text('•', 20, y);
          doc.text(line.substring(2), 25, y);
          y += 6;
        } else {
          // Regular text
          doc.text(line, 20, y);
          y += 6;
        }
      });
      
      // Save the PDF
      const fullPath = path.resolve(outputPath);
      const directory = path.dirname(fullPath);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      
      // Write PDF to file
      fs.writeFileSync(fullPath, Buffer.from(doc.output('arraybuffer')));
      
      return fullPath;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    }
  }

  /**
   * Export content to DOCX
   */
  static async exportToDOCX(options: ExportOptions): Promise<string> {
    try {
      const { title, content, outputPath } = options;
      
      // Create paragraphs from content
      const paragraphs: Paragraph[] = [];
      
      // Add title
      paragraphs.push(
        new Paragraph({
          text: title,
          heading: 'Heading1',
        })
      );
      
      // Process content by lines
      const lines = content.split('\n');
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        if (!trimmedLine) {
          // Empty line, add a blank paragraph
          paragraphs.push(new Paragraph({}));
        } else if (trimmedLine.startsWith('# ')) {
          // Main header
          paragraphs.push(
            new Paragraph({
              text: trimmedLine.substring(2),
              heading: 'Heading1',
            })
          );
        } else if (trimmedLine.startsWith('## ')) {
          // Sub header
          paragraphs.push(
            new Paragraph({
              text: trimmedLine.substring(3),
              heading: 'Heading2',
            })
          );
        } else if (trimmedLine.startsWith('* ')) {
          // Bullet point
          paragraphs.push(
            new Paragraph({
              text: trimmedLine.substring(2),
              bullet: {
                level: 0
              }
            })
          );
        } else {
          // Regular text
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmedLine,
                  size: 24, // 12pt
                })
              ]
            })
          );
        }
      });
      
      // Create document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });
      
      // Create directory if it doesn't exist
      const fullPath = path.resolve(outputPath);
      const directory = path.dirname(fullPath);
      
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      
      // Write to file
      const buffer = await Packer.toBuffer(doc);
      fs.writeFileSync(fullPath, buffer);
      
      return fullPath;
    } catch (error) {
      console.error('Error exporting to DOCX:', error);
      throw error;
    }
  }
}
