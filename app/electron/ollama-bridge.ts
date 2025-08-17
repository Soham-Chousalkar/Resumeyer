import { ipcMain } from 'electron';
import axios from 'axios';
import { exec } from 'child_process';

// Default Ollama settings
const OLLAMA_API_BASE_URL = 'http://localhost:11434/api';
const DEFAULT_MODEL = 'llama3.1:8b';

// Check if Ollama is running
async function checkOllamaStatus(): Promise<boolean> {
    try {
        const response = await axios.get(`${OLLAMA_API_BASE_URL}/tags`);
        return response.status === 200;
    } catch (error) {
        console.error('Ollama not running or not accessible:', error);
        return false;
    }
}

// Start Ollama process if not running
function startOllama(): Promise<boolean> {
    return new Promise((resolve) => {
        exec('ollama serve', (error, stdout, stderr) => {
            if (error) {
                console.error('Failed to start Ollama:', error);
                resolve(false);
                return;
            }

            setTimeout(async () => {
                const status = await checkOllamaStatus();
                resolve(status);
            }, 3000); // Wait for Ollama to initialize
        });
    });
}

// Check if model is available
async function isModelAvailable(model: string = DEFAULT_MODEL): Promise<boolean> {
    try {
        const response = await axios.get(`${OLLAMA_API_BASE_URL}/tags`);
        const models = response.data.models || [];
        return models.some((m: any) => m.name === model);
    } catch (error) {
        console.error('Failed to check model availability:', error);
        return false;
    }
}

// Pull a model
async function pullModel(model: string = DEFAULT_MODEL): Promise<boolean> {
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

// Generate text using Ollama
async function generateText(
    prompt: string,
    model: string = DEFAULT_MODEL,
    systemPrompt: string = 'You are a helpful assistant.'
): Promise<string> {
    try {
        const response = await axios.post(`${OLLAMA_API_BASE_URL}/generate`, {
            model,
            prompt: systemPrompt + '\n\n' + prompt,
            stream: false
        });

        return response.data.response;
    } catch (error) {
        console.error('Failed to generate text:', error);
        throw new Error('Failed to generate text with Ollama');
    }
}

// Setup Ollama IPC handlers
export function setupOllamaHandlers() {
    // Check Ollama status
    ipcMain.handle('ollama-check-status', async () => {
        return await checkOllamaStatus();
    });

    // Start Ollama
    ipcMain.handle('ollama-start', async () => {
        return await startOllama();
    });

    // Check model availability
    ipcMain.handle('ollama-check-model', async (_, model) => {
        return await isModelAvailable(model || DEFAULT_MODEL);
    });

    // Pull model
    ipcMain.handle('ollama-pull-model', async (_, model) => {
        return await pullModel(model || DEFAULT_MODEL);
    });

    // Generate text
    ipcMain.handle('ollama-generate', async (_, prompt, model, systemPrompt) => {
        return await generateText(
            prompt,
            model || DEFAULT_MODEL,
            systemPrompt || 'You are a helpful assistant.'
        );
    });

    // Initialize Ollama (check status, start if needed)
    ipcMain.handle('ollama-initialize', async () => {
        const status = await checkOllamaStatus();

        if (!status) {
            console.log('Ollama not running, attempting to start...');
            const started = await startOllama();

            if (!started) {
                return {
                    status: false,
                    message: 'Failed to start Ollama. Make sure it is installed correctly.'
                };
            }
        }

        // Check model availability
        const modelAvailable = await isModelAvailable();

        if (!modelAvailable) {
            console.log(`Model ${DEFAULT_MODEL} not available, pulling...`);
            const pulled = await pullModel();

            if (!pulled) {
                return {
                    status: false,
                    message: `Failed to pull model ${DEFAULT_MODEL}. Make sure you have internet access.`
                };
            }
        }

        return {
            status: true,
            message: `Ollama is running with model ${DEFAULT_MODEL}`
        };
    });
}
