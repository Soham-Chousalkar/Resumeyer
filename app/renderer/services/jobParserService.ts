import { OllamaClient } from './ollamaClient';

export interface ParsedJobDescription {
  title: string;
  company: string;
  location: string;
  employmentType: string;
  required_skills: string[];
  preferred_skills: string[];
  responsibilities: string[];
  qualifications: string[];
  benefits?: string[];
  salary_range?: string;
  application_deadline?: string;
}

export class JobParserService {
  private ollamaClient: OllamaClient;
  
  constructor() {
    this.ollamaClient = new OllamaClient();
  }

  /**
   * Parse a job description to extract structured information
   * @param jobDescription The full text job description
   * @returns Structured information extracted from the job description
   */
  async parseJobDescription(jobDescription: string): Promise<ParsedJobDescription> {
    try {
      // First, initialize Ollama connection
      await this.ollamaClient.initialize();
      
      // Create a system prompt for the LLM
      const systemPrompt = `
You are a job description parser that extracts structured information from job descriptions.
Analyze the provided job description text and extract the following information:
- Job title
- Company name
- Location (can be remote, hybrid, or physical location)
- Employment type (full-time, part-time, contract, etc.)
- Required skills (as a list)
- Preferred/nice-to-have skills (as a list)
- Key responsibilities (as a list)
- Required qualifications (as a list)
- Benefits if mentioned (as a list, optional)
- Salary range if mentioned (optional)
- Application deadline if mentioned (optional)

Provide your response as a JSON object with the following structure:
{
  "title": "Job title",
  "company": "Company name",
  "location": "Job location",
  "employmentType": "Employment type",
  "required_skills": ["skill1", "skill2", ...],
  "preferred_skills": ["skill1", "skill2", ...],
  "responsibilities": ["responsibility1", "responsibility2", ...],
  "qualifications": ["qualification1", "qualification2", ...],
  "benefits": ["benefit1", "benefit2", ...] (optional),
  "salary_range": "Salary range" (optional),
  "application_deadline": "Application deadline" (optional)
}

If certain information is not available in the job description, use empty strings or empty arrays as appropriate.
`;

      // Get the parsed job description from Ollama
      const parsedJob = await this.ollamaClient.generateJSON<ParsedJobDescription>(
        `Job Description:\n${jobDescription}`,
        systemPrompt
      );

      return parsedJob;
    } catch (error) {
      console.error('Error parsing job description:', error);
      
      // Return a basic structure if parsing fails
      return {
        title: '',
        company: '',
        location: '',
        employmentType: '',
        required_skills: [],
        preferred_skills: [],
        responsibilities: [],
        qualifications: []
      };
    }
  }

  /**
   * Extract keywords from a job description
   * @param jobDescription The full text job description
   * @returns Array of relevant keywords
   */
  async extractKeywords(jobDescription: string): Promise<string[]> {
    try {
      // First, initialize Ollama connection
      await this.ollamaClient.initialize();
      
      const systemPrompt = `
You are a keyword extraction tool that identifies the most important technical skills, 
tools, technologies, and qualifications from job descriptions.
Extract up to 15 of the most relevant keywords that a candidate should include in their resume.
Focus on:
1. Technical skills and tools (programming languages, frameworks, platforms)
2. Domain-specific knowledge
3. Certifications and qualifications
4. Soft skills that are repeatedly emphasized

Provide your response as a JSON array of strings:
["keyword1", "keyword2", "keyword3", ...]
`;

      // Get keywords from Ollama
      const keywords = await this.ollamaClient.generateJSON<string[]>(
        `Job Description:\n${jobDescription}`,
        systemPrompt
      );

      return keywords;
    } catch (error) {
      console.error('Error extracting keywords:', error);
      return [];
    }
  }

  /**
   * Analyze a job description to estimate required experience level
   * @param jobDescription The full text job description
   * @returns Experience level assessment
   */
  async analyzeExperienceLevel(jobDescription: string): Promise<{level: string, years?: number}> {
    try {
      // First, initialize Ollama connection
      await this.ollamaClient.initialize();
      
      const systemPrompt = `
You are an experience level analyzer for job descriptions.
Analyze the provided job description and determine the required experience level.
Provide your response as a JSON object with:
{
  "level": "entry" | "mid" | "senior" | "executive",
  "years": estimated years of experience required (number, optional)
}
`;

      // Get experience level assessment from Ollama
      const experienceLevel = await this.ollamaClient.generateJSON<{level: string, years?: number}>(
        `Job Description:\n${jobDescription}`,
        systemPrompt
      );

      return experienceLevel;
    } catch (error) {
      console.error('Error analyzing experience level:', error);
      return { level: 'unknown' };
    }
  }
}
