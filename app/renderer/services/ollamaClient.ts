import { ipcRenderer } from 'electron';

export class OllamaClient {
    private isInitialized: boolean = false;
    private defaultModel: string = 'llama3.1:8b';

    /**
     * Initialize the Ollama connection
     * @returns Status object with success flag and message
     */
    async initialize(): Promise<{ status: boolean; message: string }> {
        try {
            const result = await ipcRenderer.invoke('ollama-initialize');
            this.isInitialized = result.status;
            return result;
        } catch (error) {
            console.error('Failed to initialize Ollama:', error);
            this.isInitialized = false;
            return {
                status: false,
                message: `Failed to initialize Ollama: ${error}`
            };
        }
    }

    /**
     * Check if Ollama is available
     * @returns True if Ollama is running
     */
    async checkStatus(): Promise<boolean> {
        try {
            return await ipcRenderer.invoke('ollama-check-status');
        } catch (error) {
            console.error('Failed to check Ollama status:', error);
            return false;
        }
    }

    /**
     * Start Ollama if it's not running
     * @returns True if Ollama was started successfully
     */
    async startOllama(): Promise<boolean> {
        try {
            return await ipcRenderer.invoke('ollama-start');
        } catch (error) {
            console.error('Failed to start Ollama:', error);
            return false;
        }
    }

    /**
     * Generate text using Ollama
     * @param prompt The prompt to send to Ollama
     * @param model Optional model name
     * @param systemPrompt Optional system prompt
     * @returns Generated text
     */
    async generate(
        prompt: string,
        model?: string,
        systemPrompt?: string
    ): Promise<string> {
        if (!this.isInitialized) {
            const initResult = await this.initialize();
            if (!initResult.status) {
                throw new Error(`Ollama is not initialized: ${initResult.message}`);
            }
        }

        try {
            return await ipcRenderer.invoke(
                'ollama-generate',
                prompt,
                model || this.defaultModel,
                systemPrompt
            );
        } catch (error) {
            console.error('Failed to generate text with Ollama:', error);
            throw new Error(`Failed to generate text with Ollama: ${error}`);
        }
    }

    /**
     * Generate structured data (like JSON) using Ollama
     * @param prompt The prompt to send to Ollama
     * @param systemPrompt Optional system prompt
     * @param model Optional model name
     * @returns Parsed JSON object
     */
    async generateJSON<T>(
        prompt: string,
        systemPrompt: string = 'You are a helpful assistant. Respond in valid JSON format only.',
        model?: string
    ): Promise<T> {
        const response = await this.generate(prompt, model, systemPrompt);

        try {
            // Try to extract JSON from the response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON object found in response');
            }

            return JSON.parse(jsonMatch[0]) as T;
        } catch (error) {
            console.error('Failed to parse JSON from response:', error);
            throw new Error(`Failed to parse JSON from Ollama response: ${error}`);
        }
    }

    /**
     * Set the default model
     * @param model The model name to use by default
     */
    setDefaultModel(model: string): void {
        this.defaultModel = model;
    }

    /**
     * Get the default model
     * @returns The current default model name
     */
    getDefaultModel(): string {
        return this.defaultModel;
    }
}
