import { OllamaClient } from './ollamaClient';

export interface ResumeEdit {
  section: string;
  original: string;
  suggestion: string;
  reason: string;
}

export interface EditPlan {
  edits: ResumeEdit[];
  keywords: {
    must: string[];
    nice: string[];
  };
  summary: string;
}

export class ResumeEditorService {
  private ollamaClient: OllamaClient;
  
  constructor() {
    this.ollamaClient = new OllamaClient();
  }

  /**
   * Generate edit suggestions for a resume based on job description
   * @param resumeText The current resume text
   * @param jobDescription The job description to tailor for
   * @returns A plan of edits to apply to the resume
   */
  async generateEditSuggestions(resumeText: string, jobDescription: string): Promise<EditPlan> {
    try {
      // First, initialize Ollama connection
      await this.ollamaClient.initialize();
      
      // Create a system prompt for the LLM
      const systemPrompt = `
You are a professional resume optimizer that helps tailor resumes to specific job descriptions.
Analyze the resume text and job description, then suggest specific improvements to make the resume more appealing for the job.
Focus on:
1. Highlighting relevant experience and skills
2. Using industry-specific keywords from the job description
3. Quantifying achievements where possible
4. Making the language more impactful

Provide your response as a JSON object with the following structure:
{
  "edits": [
    {
      "section": "EXPERIENCE", // Section in the resume (EXPERIENCE, EDUCATION, SKILLS, PROJECTS)
      "original": "...", // Original text to replace
      "suggestion": "...", // Suggested improvement
      "reason": "..." // Brief explanation why this change improves the resume
    }
  ],
  "keywords": {
    "must": ["keyword1", "keyword2"], // Important keywords from the JD that must be included
    "nice": ["keyword3", "keyword4"] // Good-to-have keywords
  },
  "summary": "Brief overview of suggested changes and how they align with the job description"
}
`;

      // Get the raw response from Ollama
      const response = await this.ollamaClient.generateJSON<EditPlan>(
        `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}`,
        systemPrompt
      );

      return response;
    } catch (error) {
      console.error('Error generating edit suggestions:', error);
      throw new Error(`Failed to generate edit suggestions: ${error}`);
    }
  }

  /**
   * Apply edits to resume text
   * @param resumeText Original resume text
   * @param edits Array of edits to apply
   * @returns Updated resume text with edits applied
   */
  applyEdits(resumeText: string, edits: ResumeEdit[]): string {
    let updatedText = resumeText;
    
    // Apply each edit in sequence
    for (const edit of edits) {
      if (edit.original && edit.suggestion) {
        updatedText = updatedText.replace(edit.original, edit.suggestion);
      }
    }
    
    return updatedText;
  }
}
