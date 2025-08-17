# Resumeyer

Resumeyer is a local-first desktop application that automatically tailors resumes and cover letters based on job descriptions using local LLMs (Ollama).

## Features

- **Local-First**: All processing happens on your machine using Ollama for LLM capabilities
- **Resume Tailoring**: Automatically suggests edits to match your resume with job descriptions
- **Document Management**: Browse and organize your resume and cover letter files
- **PDF/DOCX Support**: View and export documents in multiple formats
- **Job Description Parsing**: Extract key information from job descriptions
- **URL Parsing**: Import job descriptions directly from URLs

## Tech Stack

- **Electron**: Cross-platform desktop application framework
- **React & TypeScript**: Frontend UI
- **TipTap (ProseMirror)**: Rich text editing
- **Ollama**: Local Large Language Model integration
- **PDF/DOCX Processing**: Document format support

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- [Ollama](https://ollama.ai/) installed locally

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Soham-Chousalkar/Resumeyer.git
   cd Resumeyer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the application in development mode:
   ```bash
   npm run dev
   ```

4. Build the application:
   ```bash
   npm run build
   ```

5. Package the application:
   ```bash
   npm run dist
   ```

## Usage

1. Launch the application
2. Browse your resume files from the left panel
3. Select a resume to edit in the center panel
4. Load a job description by URL or paste it in the right panel
5. Use the "Tailor Resume" feature to get AI-powered suggestions
6. Apply suggested changes as needed
7. Export your tailored resume as PDF or DOCX

## Project Structure

- `/app/electron`: Electron main process code
- `/app/renderer`: React components and frontend code
- `/app/services`: Shared services for document processing
- `/app/models`: Data models and interfaces

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [Ollama](https://ollama.ai/)
- [TipTap](https://tiptap.dev/)