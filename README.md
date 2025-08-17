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

6. Create a standalone Windows executable:
   ```bash
   npm run make-exe
   ```
   This will create a distributable in the `release` folder.

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

## Distribution

The application can be packaged as a standalone Windows executable that can be shared with others:

1. Before packaging, add an icon file named `icon.ico` to the `app/assets/` directory
2. Run `npm run make-exe` to create the Windows installer
3. The packaged application will be available in the `release` folder
4. Share the installer with others - they can install and run Resumeyer without needing to install Node.js

Note: End users will still need to install [Ollama](https://ollama.ai/) for the AI functionality to work.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [Ollama](https://ollama.ai/)
- [TipTap](https://tiptap.dev/)