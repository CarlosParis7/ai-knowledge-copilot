/**
 * Demo store — a fully client-side, offline simulation of the RAG backend.
 *
 * When `localStorage['demo-mode'] === 'true'`, the app runs without Supabase:
 * documents, chunks, chat sessions and messages all live here in localStorage,
 * and a lightweight keyword-overlap "retrieval" answers questions over whatever
 * the user has uploaded. No network, no API keys, no cost — but the full
 * upload → index → chat → cite loop actually works.
 */

export type DemoChunk = { id: string; chunk_index: number; content: string };
export type DemoDoc = {
    id: string;
    title: string;
    status: 'processing' | 'indexed';
    created_at: string;
    chunks: DemoChunk[];
};
export type DemoCitation = { title: string; snippet: string; document_id?: string };
export type DemoMessage = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
    citations?: DemoCitation[];
    is_cached?: boolean;
};
export type DemoSession = { id: string; title: string; created_at: string; messages: DemoMessage[] };

type DemoState = {
    docs: DemoDoc[];
    sessions: DemoSession[];
    queryCount: number;
};

const KEY = 'atlas-demo-state-v1';

export function isDemo(): boolean {
    return localStorage.getItem('demo-mode') === 'true';
}

const uid = (p = '') => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const now = () => new Date().toISOString();

// ---- Seed: realistic logistics content so a fresh demo is never empty ----
function seed(): DemoState {
    const mk = (title: string, status: DemoDoc['status'], paras: string[], offsetDays = 0): DemoDoc => ({
        id: uid('doc-'),
        title,
        status,
        created_at: new Date(Date.now() - offsetDays * 86400000).toISOString(),
        chunks: paras.map((content, i) => ({ id: uid('ch-'), chunk_index: i, content })),
    });

    return {
        queryCount: 842,
        docs: [
            mk('SOP Consolidación LCL (Almacén) 2026', 'indexed', [
                'Para consolidación LCL: verificar peso bruto, volumen y cubicaje antes de aceptar la carga en almacén. Confirmar el cut-off de consolidación y la documentación mínima: factura comercial, packing list e instrucciones de embarque.',
                'No aceptar carga sin packing list válido. Las dimensiones deben coincidir con lo declarado; cualquier discrepancia mayor al 5% requiere re-medición y aprobación del supervisor de almacén.',
                'Para envíos CIF desde China hacia Panamá, transparentar los recargos de destino: THC en puerto Balboa o Manzanillo, desconsolidación CFS y manejo documental (Doc Fee / Release Fee).',
            ]),
            mk('Guía Aduanas - Documentación por país', 'indexed', [
                'Antes de despachar: validar la partida arancelaria (HS Code), el país de origen y destino, y las restricciones o permisos aplicables. No proceder si falta documentación o existen sanciones vigentes.',
                'Panamá: la inspección puede involucrar a Aduanas y AUPSA. Mantener disponible el certificado de origen y la factura comercial para liberación rápida.',
            ]),
            mk('IATA DGR - Mercancías peligrosas (Checklist)', 'indexed', [
                'Para carga peligrosa DG Clase 3 (líquidos inflamables) por vía aérea: confirmar UN Number, Proper Shipping Name y grupo de embalaje (Packing Group I, II o III).',
                'Documentación DG requerida: MSDS vigente con sección 14 autorizando transporte aéreo, y la Shipper\'s Declaration for Dangerous Goods firmada por personal certificado.',
                'Empaque homologado (UN Specification). Etiqueta de riesgo primario Clase 3 y marcas visibles: UN Number, Proper Shipping Name, direcciones y flechas de orientación para líquidos. No aceptar si hay cualquier inconsistencia.',
            ]),
        ],
        sessions: [],
    };
}

function load(): DemoState {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) {
            const seeded = seed();
            localStorage.setItem(KEY, JSON.stringify(seeded));
            return seeded;
        }
        return JSON.parse(raw) as DemoState;
    } catch {
        const seeded = seed();
        localStorage.setItem(KEY, JSON.stringify(seeded));
        return seeded;
    }
}

function save(state: DemoState) {
    localStorage.setItem(KEY, JSON.stringify(state));
}

// ---- Documents ----
export function listDocs(): DemoDoc[] {
    return load().docs;
}

export function getChunks(docId: string): DemoChunk[] {
    return load().docs.find(d => d.id === docId)?.chunks ?? [];
}

/** Simulate upload: split the filename into a placeholder chunk set, mark processing, then indexed. */
export function addDoc(title: string): DemoDoc {
    const state = load();
    const doc: DemoDoc = {
        id: uid('doc-'),
        title,
        status: 'processing',
        created_at: now(),
        chunks: [
            { id: uid('ch-'), chunk_index: 0, content: `Documento "${title}" recibido. El contenido se segmenta en fragmentos semánticos de ~800-1200 caracteres con solapamiento para preservar el contexto.` },
            { id: uid('ch-'), chunk_index: 1, content: `Este es contenido de demostración para "${title}". En producción, el texto real del archivo se extrae, se divide y se convierte en embeddings vectoriales para búsqueda semántica.` },
        ],
    };
    state.docs.unshift(doc);
    save(state);
    return doc;
}

/** Flip a processing doc to indexed (called after a simulated delay). */
export function markIndexed(docId: string) {
    const state = load();
    const doc = state.docs.find(d => d.id === docId);
    if (doc) { doc.status = 'indexed'; save(state); }
}

export function removeDoc(docId: string) {
    const state = load();
    state.docs = state.docs.filter(d => d.id !== docId);
    save(state);
}

// ---- Sessions ----
export function listSessions(): DemoSession[] {
    return load().sessions;
}

export function getMessages(sessionId: string): DemoMessage[] {
    return load().sessions.find(s => s.id === sessionId)?.messages ?? [];
}

export function createSession(title = 'Nueva conversación'): DemoSession {
    const state = load();
    const session: DemoSession = { id: uid('s-'), title, created_at: now(), messages: [] };
    state.sessions.unshift(session);
    save(state);
    return session;
}

export function renameSession(id: string, title: string) {
    const state = load();
    const s = state.sessions.find(x => x.id === id);
    if (s) { s.title = title; save(state); }
}

export function deleteSession(id: string) {
    const state = load();
    state.sessions = state.sessions.filter(s => s.id !== id);
    save(state);
}

// ---- Stats ----
export function stats() {
    const state = load();
    const activeDocs = state.docs.filter(d => d.status === 'indexed').length;
    return {
        totalQueries: state.queryCount,
        activeDocs,
        hoursSaved: Math.round(state.queryCount * 0.37),
    };
}

// ---- Retrieval + answer (the offline "RAG") ----
const STOP = new Set(['the', 'a', 'an', 'de', 'la', 'el', 'los', 'las', 'un', 'una', 'y', 'o', 'que', 'en', 'para', 'por', 'con', 'del', 'al', 'es', 'son', 'cómo', 'como', 'qué', 'cual', 'cuál', 'mi', 'su', 'lo', 'se', 'me', 'te']);

function tokenize(s: string): string[] {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9áéíóúñ\s]/gi, ' ').split(/\s+/)
        .filter(w => w.length > 2 && !STOP.has(w));
}

type Scored = { doc: DemoDoc; chunk: DemoChunk; score: number };

/** Keyword-overlap retrieval over indexed chunks. Returns top-K scored chunks. */
export function retrieve(query: string, k = 3): Scored[] {
    const qTokens = new Set(tokenize(query));
    if (qTokens.size === 0) return [];
    const scored: Scored[] = [];
    for (const doc of load().docs) {
        if (doc.status !== 'indexed') continue;
        for (const chunk of doc.chunks) {
            const cTokens = tokenize(chunk.content);
            let hits = 0;
            for (const t of cTokens) if (qTokens.has(t)) hits++;
            const score = hits / Math.sqrt(cTokens.length || 1);
            if (hits > 0) scored.push({ doc, chunk, score });
        }
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, k);
}

/** Produce a grounded answer + citations from retrieved chunks. */
export function answer(query: string): { content: string; citations: DemoCitation[] } {
    const top = retrieve(query, 3);

    if (top.length === 0) {
        return {
            content: `No encontré información sobre eso en los documentos indexados. Prueba subir un documento relevante en **Base de conocimiento**, o reformula la pregunta con términos que aparezcan en tus archivos.`,
            citations: [],
        };
    }

    const lead = top[0];
    const supporting = top.slice(1);

    let content = `Según **${lead.doc.title}**:\n\n${lead.chunk.content}`;
    if (supporting.length > 0) {
        content += `\n\n**Contexto adicional:**\n` + supporting.map(s => `- ${s.chunk.content}`).join('\n');
    }
    content += `\n\n_Respuesta generada sobre ${top.length} fragmento(s) recuperado(s). Revisa las fuentes citadas._`;

    // De-duplicate citations by document
    const seen = new Set<string>();
    const citations: DemoCitation[] = [];
    for (const s of top) {
        if (seen.has(s.doc.id)) continue;
        seen.add(s.doc.id);
        citations.push({
            document_id: s.doc.id,
            title: s.doc.title,
            snippet: s.chunk.content.slice(0, 140) + (s.chunk.content.length > 140 ? '…' : ''),
        });
    }
    return { content, citations };
}

/** Persist a user+assistant exchange into a session; bumps the query counter. */
export function recordExchange(sessionId: string, userText: string, assistant: { content: string; citations: DemoCitation[] }) {
    const state = load();
    const s = state.sessions.find(x => x.id === sessionId);
    if (!s) return;
    s.messages.push({ id: uid('m-'), role: 'user', content: userText, created_at: now() });
    s.messages.push({ id: uid('m-'), role: 'assistant', content: assistant.content, created_at: now(), citations: assistant.citations });
    // First user message becomes the session title
    if (s.title === 'Nueva conversación' && userText.trim()) {
        s.title = userText.trim().slice(0, 48);
    }
    state.queryCount += 1;
    save(state);
}
