import { z } from "zod";

export const CitationSchema = z.object({
    document_id: z.string(),
    chunk_id: z.string(),
    title: z.string(),
    snippet: z.string(),
});

export type Citation = z.infer<typeof CitationSchema>;

export const AIResponseSchema = z.object({
    answer: z.string(),
    citations: z.array(CitationSchema),
});

export type AIResponse = z.infer<typeof AIResponseSchema>;

export interface AIClient {
    generateResponse(prompt: string, context: string[]): Promise<AIResponse>;
    generateEmbedding(text: string): Promise<number[]>;
    generateEmbeddings?(texts: string[]): Promise<number[][]>;
}
