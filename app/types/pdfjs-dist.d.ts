declare module 'pdfjs-dist' {
    interface PDFDocumentProxy {
        numPages: number;
        getPage(pageIndex: number): Promise<PDFPageProxy>;
    }

    interface PDFPageProxy {
        getTextContent(): Promise<TextContent>;
    }

    interface TextContent {
        items: TextItem[];
    }

    interface TextItem {
        str: string;
    }

    interface GetDocumentParams {
        data: Uint8Array;
    }

    export function getDocument(params: GetDocumentParams): PDFDocumentLoadingTask;

    interface PDFDocumentLoadingTask {
        promise: Promise<PDFDocumentProxy>;
    }

    interface GlobalWorkerOptions {
        workerSrc: string;
    }
}

