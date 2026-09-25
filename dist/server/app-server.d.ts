import * as http from "http";
export interface ParsedRequest {
    files: Map<string, {
        fileName: string;
        mimeType: string;
        data: Buffer;
    }>;
    fields: Map<string, string>;
    jsonBody?: any;
}
/**
 * Parses request body (supporting both JSON and Multipart Form-Data)
 */
export declare function parseRequestBody(req: http.IncomingMessage): Promise<ParsedRequest>;
/**
 * Main request listener for Exam Mixer (handles both standalone HTTP and Serverless/Vercel)
 */
export declare function handleExamMixerRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void>;
/**
 * Creates the standalone Node.js HTTP server instance
 */
export declare function createExamMixerServer(): http.Server;
