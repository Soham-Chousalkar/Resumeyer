import { OllamaService } from './ollamaService';
import { PROMPTS, fillPromptTemplate } from '../models/prompts';

// Define interface for the AI Edit Plan
interface AIEditPlan {
    keywords: {
        must: string[];
        nice: string[];
    };
    edits: {
        experience?: Array<{
            index: number;
            replaceBullets?: string[];
            remove?: boolean;
        }>;
        projects?: Array<{
            index?: number;
            remove?: boolean;
            insertAfter?: number;
            project?: {
                name: string;
                tech: string[];
                bullets: string[];
            };
        }>;
        skills?: {
            add: string[];
            remove: string[];
        };
    };
    formatting: {
        targetOnePage: boolean;
        minFontPt: number;
        shrinkIfOverflow: boolean;
    };
    riskFlags: string[];
    changelog: Array<{
        section: string;
        reasonJD: string;
        action: string;
    }>;
}

// Interface for Resume JSON
interface ResumeJSON {
    contact: {
        name: string;
        phone: string;
        email: string;
        github?: string;
        linkedin?: string;
        portfolio?: string;
    };
    education: Array<{
        school: string;
        degree: string;
        dates: string;
        gpa?: string;
    }>;
    experience: Array<{
        company: string;
        role: string;
        location: string;
        dates: string;
        bullets: string[];
    }>;
    projects: Array<{
        name: string;
        tech: string[];
        bullets: string[];
    }>;
    skills: string[];
    optional?: {
        coursework?: string[];
        publications?: string[];
    };
    layout: {
        font: string;
        fontSizePt: number;
        marginsIn: {
            top: number;
            right: number;
            bottom: number;
            left: number;
        };
    };
}

export class EditPlanService {
    private ollamaService: OllamaService;

    constructor() {
        this.ollamaService = new OllamaService();
    }

    /**
     * Generate an edit plan based on job description and resume
     */
    public async generateEditPlan(
        jobDescription: string,
        resumeJson: ResumeJSON
    ): Promise<AIEditPlan> {
        // Check if Ollama is running
        const ollamaRunning = await this.ollamaService.checkOllamaStatus();
        if (!ollamaRunning) {
            await this.ollamaService.startOllama();
        }

        // Check if model is available
        const modelAvailable = await this.ollamaService.isModelAvailable();
        if (!modelAvailable) {
            await this.ollamaService.pullModel();
        }

        // Fill in the prompt template
        const prompt = fillPromptTemplate(PROMPTS.EDIT_PLAN, {
            JOB_DESCRIPTION: jobDescription,
            RESUME_JSON: JSON.stringify(resumeJson, null, 2)
        });

        try {
            // Generate edit plan
            return await this.ollamaService.generateStructured<AIEditPlan>(
                prompt,
                'You are a professional resume optimizer. Respond in JSON format only.'
            );
        } catch (error) {
            console.error('Failed to generate edit plan:', error);
            throw new Error('Failed to generate edit plan');
        }
    }

    /**
     * Extract key information from job description
     */
    public async extractJobInfo(jobDescription: string) {
        const prompt = fillPromptTemplate(PROMPTS.JOB_INFO_EXTRACT, {
            JOB_DESCRIPTION: jobDescription
        });

        try {
            return await this.ollamaService.generateStructured<{
                company: string;
                role: string;
                location: string;
                required_skills: string[];
                preferred_skills: string[];
                keywords: string[];
            }>(
                prompt,
                'You are a job description analyzer. Extract key information and respond in JSON format only.'
            );
        } catch (error) {
            console.error('Failed to extract job info:', error);
            throw new Error('Failed to extract job information');
        }
    }

    /**
     * Generate a cover letter based on job description and resume
     */
    public async generateCoverLetter(
        jobDescription: string,
        resumeHighlights: string,
        referenceCoverLetter: string
    ): Promise<string> {
        const prompt = fillPromptTemplate(PROMPTS.COVER_LETTER, {
            JOB_DESCRIPTION: jobDescription,
            RESUME_HIGHLIGHTS: resumeHighlights,
            REFERENCE_CL: referenceCoverLetter
        });

        try {
            return await this.ollamaService.generate(
                prompt,
                this.ollamaService.getModel()
            );
        } catch (error) {
            console.error('Failed to generate cover letter:', error);
            throw new Error('Failed to generate cover letter');
        }
    }
}
