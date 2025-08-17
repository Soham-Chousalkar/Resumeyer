/**
 * Collection of prompt templates for different Resumeyer functionalities
 */

export const PROMPTS = {
    /**
     * Prompt to generate an edit plan for a resume based on a job description
     */
    EDIT_PLAN: `
You are a professional resume optimizer. Your task is to analyze the job description and the user's resume, then recommend edits to tailor the resume for the job.

Job Description:
{{JOB_DESCRIPTION}}

Resume JSON:
{{RESUME_JSON}}

Constraints:
- Focus on STAR format (Situation, Task, Action, Result)
- Include metrics and quantifiable achievements
- Keep bullets to 1-2 lines each
- Ensure the resume fits on one page
- Follow the skills rule: include skills relevant to the JD and don't duplicate skills already in bullet points

Provide your response as a JSON object with the following structure:
{
  "keywords": { "must": ["..."], "nice": ["..."] },
  "edits": {
    "experience": [
      {
        "index": 0,
        "replaceBullets": [
          "Led X to achieve Y (+25%) by Z.",
          "Built A using B/C, cutting latency 30%."
        ]
      }
    ],
    "projects": [
      { "index": 1, "remove": true }, 
      { "insertAfter": 0, "project": { "name": "...", "tech": ["..."], "bullets": ["..."] } }
    ],
    "skills": { "add": ["Kafka"], "remove": ["Excel"] }
  },
  "formatting": {
    "targetOnePage": true,
    "minFontPt": 10,
    "shrinkIfOverflow": true
  },
  "riskFlags": ["Bullets with unverifiable claims in exp[1]"],
  "changelog": [
    { "section": "experience[0]", "reasonJD": "Req: streaming pipelines", "action": "added Kafka" }
  ]
}
`,

    /**
     * Prompt to generate a cover letter based on a job description and resume
     */
    COVER_LETTER: `
You are a professional cover letter writer. Your task is to create a compelling cover letter for the job description using the highlights from the resume.

Job Description:
{{JOB_DESCRIPTION}}

Resume Highlights:
{{RESUME_HIGHLIGHTS}}

Reference Cover Letter Style:
{{REFERENCE_CL}}

Write a 4-6 paragraph cover letter with:
1. An engaging opening paragraph that mentions the specific position and company
2. 2-3 paragraphs highlighting relevant experience and skills that match the job requirements
3. A closing paragraph expressing interest in an interview
4. Appropriate greeting and sign-off

The tone should match the reference cover letter style but with content tailored to this specific job.
`,

    /**
     * Prompt for extracting key information from a job description
     */
    JOB_INFO_EXTRACT: `
Extract the key information from this job description:

{{JOB_DESCRIPTION}}

Return a JSON object with:
{
  "company": "Company name",
  "role": "Job title",
  "location": "Job location (city, remote, etc.)",
  "required_skills": ["skill1", "skill2", ...],
  "preferred_skills": ["skill1", "skill2", ...],
  "keywords": ["keyword1", "keyword2", ...]
}
`
};

/**
 * Function to fill in a prompt template with actual values
 * @param template The prompt template with placeholders
 * @param values Object containing values to replace placeholders
 * @returns Filled prompt template
 */
export function fillPromptTemplate(template: string, values: Record<string, string>): string {
    let filledTemplate = template;

    for (const [key, value] of Object.entries(values)) {
        const placeholder = `{{${key}}}`;
        filledTemplate = filledTemplate.replace(new RegExp(placeholder, 'g'), value);
    }

    return filledTemplate;
}
