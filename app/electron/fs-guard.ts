import * as path from 'path';
import * as fs from 'fs';

// Base directory for all file operations
const RESUME_BASE_PATH = 'D:\\UD\\Resume-CL';

/**
 * Ensures that file operations are restricted to the allowed directory
 */
export class FileSystemGuard {
    /**
     * Verifies if a path is within the allowed directory
     * @param targetPath Path to verify
     * @returns Normalized path if valid
     * @throws Error if path is outside allowed directory
     */
    static validatePath(targetPath: string): string {
        const normalizedPath = path.normalize(targetPath);
        if (!normalizedPath.startsWith(RESUME_BASE_PATH)) {
            throw new Error(`Access denied: Path outside of allowed directory: ${targetPath}`);
        }
        return normalizedPath;
    }

    /**
     * Creates a directory if it doesn't exist
     * @param dirPath Directory path to create
     * @returns The created directory path
     */
    static async createDirectory(dirPath: string): Promise<string> {
        const validPath = this.validatePath(dirPath);

        if (!fs.existsSync(validPath)) {
            await fs.promises.mkdir(validPath, { recursive: true });
        }

        return validPath;
    }

    /**
     * Lists files and directories in a given path
     * @param dirPath Directory to list
     * @returns Array of file/directory entries
     */
    static async listDirectory(dirPath: string): Promise<{ name: string, isDirectory: boolean, path: string }[]> {
        const validPath = this.validatePath(dirPath);

        try {
            const entries = await fs.promises.readdir(validPath, { withFileTypes: true });
            return entries.map(entry => ({
                name: entry.name,
                isDirectory: entry.isDirectory(),
                path: path.join(dirPath, entry.name)
            }));
        } catch (error) {
            console.error(`Error listing directory ${dirPath}:`, error);
            return [];
        }
    }

    /**
     * Gets the base directory path
     * @returns The base directory path
     */
    static getBasePath(): string {
        return RESUME_BASE_PATH;
    }
}
