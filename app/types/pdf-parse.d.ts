declare module 'pdf-parse' {
    interface PDFData {
        text: string;
        numpages: number;
        info: Record<string, any>;
        metadata: Record<string, any>;
        version: string;
        encrypted: boolean;
        pdfChunk: Uint8Array;
    }

    export default function (dataBuffer: Buffer | Uint8Array, options?: {
        pagerender?: (pageData: any) => Promise<string>,
        max?: number,
        version?: string
    }): Promise<PDFData>;
}

