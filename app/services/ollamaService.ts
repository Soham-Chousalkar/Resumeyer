import { exec } from 'child_process';
import axios from 'axios';

// Default Ollama settings
const OLLAMA_API_BASE_URL = 'http://localhost:11434/api';
const DEFAULT_MODEL = 'llama3.1:8b';

interface OllamaResponse {
    response: string;
    model: string;
    created_at: string;
}

export class OllamaService {
    private model: string;
    private isOllamaRunning: boolean = false;

    constructor(model: string = DEFAULT_MODEL) {
        this.model = model;
    }

    /**
     * Check if Ollama is running
     */
    public async checkOllamaStatus(): Promise<boolean> {
        try {
            const response = await axios.get(`${OLLAMA_API_BASE_URL}/tags`);
            this.isOllamaRunning = response.status === 200;
            return this.isOllamaRunning;
        } catch (error) {
            console.error('Ollama not running or not accessible:', error);
            this.isOllamaRunning = false;
            return false;
        }
    }

    /**
     * Start Ollama process if not running
     */
    public startOllama(): Promise<boolean> {
        return new Promise((resolve) => {
            exec('ollama serve', (error, stdout, stderr) => {
                if (error) {
                    console.error('Failed to start Ollama:', error);
                    resolve(false);
                    return;
                }

                setTimeout(async () => {
                    const status = await this.checkOllamaStatus();
                    resolve(status);
                }, 3000); // Wait for Ollama to initialize
            });
        });
    }

    /**
     * Check if the model is available
     */
    public async isModelAvailable(model: string = this.model): Promise<boolean> {
        if (!this.isOllamaRunning) {
            await this.checkOllamaStatus();
        }

        if (!this.isOllamaRunning) {
            return false;
        }

        try {
            const response = await axios.get(`${OLLAMA_API_BASE_URL}/tags`);
            const models = response.data.models || [];
            return models.some((m: any) => m.name === model);
        } catch (error) {
            console.error('Failed to check model availability:', error);
            return false;
        }
    }

    /**
     * Pull a model if not available
     */
    public async pullModel(model: string = this.model): Promise<boolean> {
        if (!this.isOllamaRunning) {
            await this.checkOllamaStatus();
        }

        if (!this.isOllamaRunning) {
            return false;
        }

        try {
            const response = await axios.post(`${OLLAMA_API_BASE_URL}/pull`, {
                name: model
            });
            return response.status === 200;
        } catch (error) {
            console.error('Failed to pull model:', error);
            return false;
        }
    }

    /**
     * Generate text using the Ollama API
     */
    public async generate(prompt: string, model: string = this.model): Promise<string> {
        if (!this.isOllamaRunning) {
            await this.checkOllamaStatus();

            if (!this.isOllamaRunning) {
                throw new Error('Ollama is not running. Please start Ollama first.');
            }
        }

        const modelAvailable = await this.isModelAvailable(model);
        if (!modelAvailable) {
            throw new Error(`Model ${model} is not available. Please pull it first.`);
        }

        try {
            const response = await axios.post<OllamaResponse>(`${OLLAMA_API_BASE_URL}/generate`, {
                model,
                prompt,
                stream: false
            });

            return response.data.response;
        } catch (error) {
            console.error('Failed to generate text:', error);
            throw new Error('Failed to generate text with Ollama');
        }
    }

    /**
     * Generate structured data (like JSON) using a specific prompt template
     */
    public async generateStructured<T>(
        prompt: string,
        systemPrompt: string = 'You are a helpful assistant. Respond in JSON format only.',
        model: string = this.model
    ): Promise<T> {
        const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}\n\nJSON Response:`;

        try {
            const response = await this.generate(fullPrompt, model);

            // Extract JSON from the response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Failed to parse JSON from response');
            }

            return JSON.parse(jsonMatch[0]) as T;
        } catch (error) {
            console.error('Failed to generate structured data:', error);
            throw new Error('Failed to generate or parse structured data');
        }
    }

    /**
     * Set the model to use
     */
    public setModel(model: string): void {
        this.model = model;
    }

    /**
     * Get the current model
     */
    public getModel(): string {
        return this.model;
    }
}
