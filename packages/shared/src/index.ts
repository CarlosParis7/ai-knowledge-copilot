import { z } from "zod";
export * from "./ai";

export const CompanySchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, "Name is required"),
    created_at: z.string().datetime(),
});

export type Company = z.infer<typeof CompanySchema>;

export const ProfileSchema = z.object({
    user_id: z.string().uuid(),
    company_id: z.string().uuid().nullable(),
    role: z.enum(["admin", "member"]),
    name: z.string().nullable(),
    created_at: z.string().datetime(),
});

export type Profile = z.infer<typeof ProfileSchema>;

export const DocumentSchema = z.object({
    id: z.string().uuid(),
    company_id: z.string().uuid(),
    title: z.string(),
    storage_path: z.string(),
    mime: z.string(),
    status: z.enum(["uploaded", "processing", "indexed", "error"]),
    created_at: z.string().datetime(),
});

export type Document = z.infer<typeof DocumentSchema>;

export const DocumentChunkSchema = z.object({
    id: z.string().uuid(),
    document_id: z.string().uuid(),
    company_id: z.string().uuid(),
    chunk_index: z.number().int(),
    content: z.string(),
    created_at: z.string().datetime(),
});

export type DocumentChunk = z.infer<typeof DocumentChunkSchema>;

export const ChatSessionSchema = z.object({
    id: z.string().uuid(),
    company_id: z.string().uuid(),
    user_id: z.string().uuid(),
    title: z.string(),
    created_at: z.string().datetime(),
});

export type ChatSession = z.infer<typeof ChatSessionSchema>;

export const ChatMessageSchema = z.object({
    id: z.string().uuid(),
    session_id: z.string().uuid(),
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
    citations: z.any().optional(), // Can refine with CitationSchema later if needed
    created_at: z.string().datetime(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const AIRunSchema = z.object({
    id: z.string().uuid(),
    company_id: z.string().uuid(),
    user_id: z.string().uuid().nullable(),
    type: z.string(),
    model: z.string().nullable(),
    latency_ms: z.number().int().nullable(),
    tokens_in: z.number().int().nullable(),
    tokens_out: z.number().int().nullable(),
    status: z.enum(["success", "error"]),
    error: z.string().nullable(),
    created_at: z.string().datetime(),
});

export type AIRun = z.infer<typeof AIRunSchema>;
