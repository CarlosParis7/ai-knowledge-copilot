import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Plus, Zap, Bookmark, MoreHorizontal, Square, Loader2, Globe, Pencil, Trash2, X, Paperclip, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import * as demo from '@/lib/demoStore';

// ---- Inline modal components ------------------------------------------------

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/30 backdrop-blur-[2px]" onClick={onCancel}>
            <div className="w-full max-w-sm mx-4 bg-surface rounded-xl border border-line shadow-float p-5" onClick={e => e.stopPropagation()}>
                <div className="flex items-start gap-3 mb-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger-soft">
                        <AlertTriangle className="w-[18px] h-[18px] text-danger" />
                    </div>
                    <p className="text-[14px] text-ink leading-snug pt-1.5">{message}</p>
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={onCancel} className="h-9 px-4 rounded-lg text-[13px] font-medium text-ink-2 hover:bg-surface-3 transition-colors">Cancelar</button>
                    <button onClick={onConfirm} className="h-9 px-4 rounded-lg text-[13px] font-medium bg-danger text-white hover:opacity-90 transition-opacity">Eliminar</button>
                </div>
            </div>
        </div>
    );
}

function RenameModal({ initialValue, onSave, onCancel }: { initialValue: string; onSave: (v: string) => void; onCancel: () => void }) {
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => { inputRef.current?.select(); }, []);

    const submit = () => { const v = value.trim(); if (v && v !== initialValue) onSave(v); else onCancel(); };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/30 backdrop-blur-[2px]" onClick={onCancel}>
            <div className="w-full max-w-sm mx-4 bg-surface rounded-xl border border-line shadow-float p-5" onClick={e => e.stopPropagation()}>
                <h3 className="text-[14px] font-semibold text-ink mb-3">Renombrar conversación</h3>
                <Input
                    ref={inputRef}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel(); }}
                    className="mb-4"
                />
                <div className="flex justify-end gap-2">
                    <button onClick={onCancel} className="h-9 px-4 rounded-lg text-[13px] font-medium text-ink-2 hover:bg-surface-3 transition-colors">Cancelar</button>
                    <button onClick={submit} className="h-9 px-4 rounded-lg text-[13px] font-medium bg-brand text-ink-on-accent hover:bg-brand-hover transition-colors">Guardar</button>
                </div>
            </div>
        </div>
    );
}

type ChatSession = {
    id: string;
    title: string;
    created_at?: string;
};

type Citation = {
    document_id? : string;
    title: string;
    snippet: string;
};

type ChatMessage = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at?: string;
    citations?: Citation[];
    is_cached?: boolean;
};

export default function Chat() {
    const queryClient = useQueryClient();
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortRef = useRef<AbortController | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);
    const [sendError, setSendError] = useState<string | null>(null);
    const [webSearch, setWebSearch] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
    const [renameModal, setRenameModal] = useState<{ id: string; title: string } | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const { data: sessions } = useQuery({
        queryKey: ['chat_sessions'],
        queryFn: async () => {
            if (demo.isDemo()) {
                return demo.listSessions().map(({ id, title, created_at }) => ({ id, title, created_at })) satisfies ChatSession[];
            }
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData?.session?.user) return [];

            const { data } = await supabase
                .from('chat_sessions')
                .select('*')
                .eq('user_id', sessionData.session.user.id)
                .order('created_at', { ascending: false });

            return (data || []) as ChatSession[];
        }
    });

    const resolvedActiveSessionId = activeSessionId ?? sessions?.[0]?.id ?? null;

    const { data: fetchedMessages, isLoading: messagesLoading } = useQuery({
        queryKey: ['chat_messages', resolvedActiveSessionId],
        queryFn: async () => {
            if (!resolvedActiveSessionId) return [];
            if (demo.isDemo()) return demo.getMessages(resolvedActiveSessionId) as ChatMessage[];

            const { data } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('session_id', resolvedActiveSessionId)
                .order('created_at', { ascending: true });
            return (data || []) as ChatMessage[];
        },
        enabled: !!resolvedActiveSessionId
    });

    const messages = [...(fetchedMessages || []), ...optimisticMessages];

    const createSession = useMutation({
        mutationFn: async () => {
            if (demo.isDemo()) {
                const s = demo.createSession();
                return { id: s.id, title: s.title };
            }
            const { data: sessionInfo } = await supabase.auth.getSession();
            const user = sessionInfo?.session?.user;
            const { data: profile } = await supabase.from('profiles').select('company_id').eq('user_id', user?.id).single();
            const { data, error } = await supabase
                .from('chat_sessions')
                .insert({
                    company_id: profile?.company_id,
                    user_id: user?.id,
                    title: 'New Conversation'
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['chat_sessions'] });
            setActiveSessionId(data.id);
        }
    });

    const stopStreaming = () => {
        abortRef.current?.abort();
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const messageText = input.trim();
        if (isStreaming) return;
        if (!messageText) return;

        setSendError(null);

        // ---- Demo mode: real client-side retrieval over uploaded docs ----
        if (demo.isDemo()) {
            setInput('');
            // Ensure there's a session to write into.
            let sid = resolvedActiveSessionId;
            if (!sid) {
                const s = demo.createSession();
                sid = s.id;
                setActiveSessionId(sid);
                await queryClient.invalidateQueries({ queryKey: ['chat_sessions'] });
            }

            const userMsg: ChatMessage = { id: `temp-u-${Date.now()}`, role: 'user', content: messageText };
            const thinking: ChatMessage = { id: `temp-a-${Date.now()}`, role: 'assistant', content: '', citations: [] };
            setIsStreaming(true);
            setOptimisticMessages([userMsg, thinking]);

            const result = demo.answer(messageText);
            // Simulate token streaming so it feels alive.
            await new Promise(r => setTimeout(r, 450));
            const words = result.content.split(' ');
            for (let i = 1; i <= words.length; i += 3) {
                setOptimisticMessages([userMsg, { ...thinking, content: words.slice(0, i).join(' '), citations: result.citations }]);
                await new Promise(r => setTimeout(r, 18));
            }

            demo.recordExchange(sid, messageText, result);
            setIsStreaming(false);
            await queryClient.invalidateQueries({ queryKey: ['chat_messages', sid] });
            await queryClient.invalidateQueries({ queryKey: ['chat_sessions'] });
            await queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
            setOptimisticMessages([]);
            return;
        }

        if (!resolvedActiveSessionId) return;
        setInput('');
        setIsStreaming(true);
        const userMsg: ChatMessage = { id: `temp-u-${Date.now()}`, role: 'user', content: messageText };
        const assistantMsg: ChatMessage = { id: `temp-a-${Date.now()}`, role: 'assistant', content: '', citations: [] };

        setOptimisticMessages([userMsg, assistantMsg]);

        const controller = new AbortController();
        abortRef.current = controller;
        let streamedAny = false;

        try {
            const { data: session } = await supabase.auth.getSession();
            const token = session.session?.access_token;

            const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    session_id: resolvedActiveSessionId,
                    message: messageText,
                    web_search: webSearch
                }),
                signal: controller.signal
            });

            if (!res.ok) {
                const status = res.status;
                const reason =
                    status === 401 ? 'Tu sesión expiró. Inicia sesión de nuevo.' :
                    status === 403 ? 'No tienes permiso para esta acción.' :
                    status === 429 ? 'Demasiadas solicitudes. Espera un momento.' :
                    status >= 500 ? 'El servidor tuvo un problema. Intenta de nuevo.' :
                    'No se pudo enviar el mensaje.';
                throw new Error(reason);
            }

            if (res.headers.get('content-type')?.includes('application/json')) {
                const data = await res.json();
                streamedAny = true;
                setOptimisticMessages([userMsg, data]);
            } else {
                const reader = res.body?.getReader();
                const decoder = new TextDecoder();
                if (!reader) throw new Error('No se recibió respuesta del servidor.');

                let currentContent = '';
                let currentCitations: Citation[] = [];

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataStr = line.replace('data: ', '').trim();
                            if (dataStr === '[DONE]') continue;
                            try {
                                const event = JSON.parse(dataStr);
                                if (event.type === 'metadata' && event.citations) {
                                    currentCitations = event.citations;
                                } else if (event.type === 'content_block_delta' && event.delta?.text) {
                                    currentContent += event.delta.text;
                                    streamedAny = true;
                                }
                            } catch {
                                // ignore malformed SSE line
                            }
                        }
                    }

                    setOptimisticMessages([
                        userMsg,
                        { ...assistantMsg, content: currentContent, citations: currentCitations }
                    ]);
                }
            }
        } catch (error: unknown) {
            const aborted = error instanceof DOMException && error.name === 'AbortError';
            if (aborted) {
                // User stopped: keep whatever streamed; only restore input if nothing arrived.
                if (!streamedAny) {
                    setInput(messageText);
                    setOptimisticMessages([]);
                }
            } else {
                // Real failure: restore the text so the user doesn't lose it, surface inline error.
                const message = error instanceof Error ? error.message : 'No se pudo enviar el mensaje.';
                setSendError(message);
                setInput(messageText);
                setOptimisticMessages([]);
            }
        } finally {
            abortRef.current = null;
            setIsStreaming(false);
            await queryClient.invalidateQueries({ queryKey: ['chat_messages', resolvedActiveSessionId] });
            setOptimisticMessages([]);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isStreaming]);

    // Focus the composer when switching conversations (Alex: less friction).
    useEffect(() => {
        textareaRef.current?.focus();
    }, [resolvedActiveSessionId]);

    // Abort any in-flight request on unmount (no memory leak / dangling stream).
    useEffect(() => () => abortRef.current?.abort(), []);

    const handleAttachFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (e.target) e.target.value = '';
        if (!file) return;

        if (demo.isDemo()) {
            const title = file.name.replace(/\.[^/.]+$/, '');
            const doc = demo.addDoc(title);
            toast.success(`"${file.name}" subido. Indexando…`);
            setTimeout(() => {
                demo.markIndexed(doc.id);
                queryClient.invalidateQueries({ queryKey: ['documents'] });
                queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
                toast.success(`"${title}" indexado. Ya puedes preguntarme sobre él.`);
            }, 1800);
            return;
        }

        setUploading(true);
        try {
            const { data: session } = await supabase.auth.getSession();
            const token = session.session?.access_token;

            const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: file.name,
                    title: file.name.replace(/\.[^/.]+$/, ''),
                    mime: file.type || 'application/octet-stream'
                })
            });
            if (!res.ok) throw new Error('No se pudo preparar la subida.');
            const { document_id, signed_url } = await res.json();

            await fetch(signed_url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });

            fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/index-document`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ document_id })
            });

            queryClient.invalidateQueries({ queryKey: ['documents'] });
            toast.success(`"${file.name}" subido. Se está indexando para citarlo.`);
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'No se pudo subir el archivo.');
        } finally {
            setUploading(false);
        }
    };

    const renameSession = useMutation({
        mutationFn: async ({ id, title }: { id: string; title: string }) => {
            if (demo.isDemo()) { demo.renameSession(id, title); return { id, title }; }
            const { error } = await supabase.from('chat_sessions').update({ title }).eq('id', id);
            if (error) throw error;
            return { id, title };
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chat_sessions'] }),
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'No se pudo renombrar.'),
    });

    const deleteSession = useMutation({
        mutationFn: async (id: string) => {
            if (demo.isDemo()) { demo.deleteSession(id); return id; }
            const { error } = await supabase.from('chat_sessions').delete().eq('id', id);
            if (error) throw error;
            return id;
        },
        onSuccess: (id) => {
            if (resolvedActiveSessionId === id) setActiveSessionId(null);
            queryClient.invalidateQueries({ queryKey: ['chat_sessions'] });
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'No se pudo eliminar.'),
    });

    const handleRename = (id: string, current: string) => {
        setMenuOpenId(null);
        setRenameModal({ id, title: current });
    };

    const handleDelete = (id: string) => {
        setMenuOpenId(null);
        setConfirmDeleteId(id);
    };

    return (
        <div className="flex h-[100dvh] w-full bg-canvas overflow-hidden">

            {/* Secondary Sidebar - Conversations */}
            <div className="w-72 h-full border-r border-line bg-surface-2 flex flex-col shrink-0 hidden md:flex z-10">
                <div className="px-4 h-14 flex items-center justify-between sticky top-0 z-10 border-b border-line shrink-0">
                    <h2 className="text-[13px] font-semibold text-ink-2">Historial</h2>
                    <button
                        onClick={() => createSession.mutate()}
                        disabled={createSession.isPending}
                        className="flex h-8 w-8 items-center justify-center text-ink-2 hover:text-ink hover:bg-surface-3 rounded-lg transition-colors"
                        title="Nuevo chat"
                    >
                        <Plus className="w-[18px] h-[18px]" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-3">
                    <div className="px-2.5 space-y-0.5">
                        {sessions?.map((session) => {
                            const isActive = resolvedActiveSessionId === session.id;
                            return (
                                <div
                                    key={session.id}
                                    className={`group relative flex items-center gap-2.5 pl-2.5 pr-1 py-2 rounded-lg text-[13px] transition-colors
                                        ${isActive
                                            ? 'bg-surface text-ink font-medium shadow-xs border border-line'
                                            : 'text-ink-2 hover:bg-surface-3 hover:text-ink border border-transparent'}`}
                                >
                                    <button
                                        onClick={() => setActiveSessionId(session.id)}
                                        className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                                    >
                                        <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand' : 'text-ink-3'}`} />
                                        <span className="truncate">{session.title}</span>
                                    </button>

                                    <button
                                        onClick={() => setMenuOpenId(menuOpenId === session.id ? null : session.id)}
                                        aria-label="Opciones de conversación"
                                        aria-haspopup="menu"
                                        aria-expanded={menuOpenId === session.id}
                                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ink-3 hover:text-ink hover:bg-surface-3 transition-all
                                            ${menuOpenId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100'}`}
                                    >
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>

                                    {menuOpenId === session.id && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setMenuOpenId(null)} aria-hidden="true" />
                                            <div role="menu" className="absolute right-1 top-9 z-50 w-40 rounded-lg border border-line bg-surface shadow-pop py-1">
                                                <button
                                                    role="menuitem"
                                                    onClick={() => handleRename(session.id, session.title)}
                                                    className="flex w-full items-center gap-2 px-3 py-1.5 text-[13px] text-ink hover:bg-surface-2 transition-colors"
                                                >
                                                    <Pencil className="w-3.5 h-3.5 text-ink-3" /> Renombrar
                                                </button>
                                                <button
                                                    role="menuitem"
                                                    onClick={() => handleDelete(session.id)}
                                                    className="flex w-full items-center gap-2 px-3 py-1.5 text-[13px] text-danger hover:bg-danger-soft transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Chat Content */}
            <div className="flex-1 h-full flex flex-col relative bg-canvas items-center">

                {/* Messages Container */}
                <div className="flex-1 w-full overflow-y-auto flex flex-col items-center">
                    <div className="w-full max-w-3xl px-6 py-10 flex flex-col gap-9 min-h-full" aria-live="polite" aria-busy={isStreaming}>

                        {!resolvedActiveSessionId ? (
                            <div className="flex-1 flex items-center justify-center text-ink-2 text-sm">
                                Selecciona o crea una conversación para empezar.
                            </div>
                        ) : messagesLoading ? (
                            <div className="flex justify-center mt-20 text-sm text-ink-2 animate-pulse">Cargando conversación...</div>
                        ) : messages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-brand-soft flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[32px] text-brand">forum</span>
                                </div>
                                <h3 className="text-xl font-semibold text-ink tracking-tight">¿En qué puedo ayudarte hoy?</h3>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className="w-full flex gap-4 group">
                                    {/* Avatar */}
                                    <div className="shrink-0 pt-0.5">
                                        {msg.role === 'user' ? (
                                            <div className="w-8 h-8 rounded-full bg-surface-3 border border-line flex items-center justify-center">
                                                <span className="text-[11px] font-semibold text-ink-2">SA</span>
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-xs">
                                                <span className="material-symbols-outlined text-[18px] text-ink-on-accent" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Area */}
                                    <div className="flex-1 min-w-0 flex flex-col">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="font-semibold text-[14px] text-ink">
                                                {msg.role === 'user' ? 'Tú' : 'Atlas Copilot'}
                                            </span>

                                            {/* Cache Hit Badge */}
                                            {msg.is_cached && (
                                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-success-soft text-success text-[10px] font-semibold uppercase tracking-wide">
                                                    <Zap className="w-3 h-3" /> Cached
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-[15px] leading-relaxed text-ink">
                                            {msg.role === 'assistant' ? (
                                                msg.content === '' && isStreaming ? (
                                                    <div className="flex items-center gap-1.5 h-6" role="status" aria-label="Atlas está escribiendo">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-ink-3 animate-typing-dot"></span>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-ink-3 animate-typing-dot [animation-delay:0.2s]"></span>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-ink-3 animate-typing-dot [animation-delay:0.4s]"></span>
                                                    </div>
                                                ) : (
                                                    <div className="prose max-w-none prose-p:text-ink prose-p:leading-[1.7] prose-li:text-ink prose-pre:bg-surface-2 prose-pre:border prose-pre:border-line prose-headings:text-ink prose-strong:text-ink prose-a:text-brand prose-code:text-ink">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="whitespace-pre-wrap text-ink">{msg.content}</div>
                                            )}
                                        </div>

                                        {/* Citations Panel */}
                                        {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                                            <div className="mt-5 space-y-2.5">
                                                <h4 className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-2">
                                                    <Bookmark className="w-3.5 h-3.5" />
                                                    Fuentes
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                    {msg.citations.map((cit, i) => (
                                                        <div key={i} className="bg-surface border border-line hover:border-line-strong hover:shadow-card transition-all rounded-lg p-3 cursor-pointer">
                                                            <div className="flex items-start gap-2 mb-1.5">
                                                                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded bg-brand-soft shrink-0 text-[11px] font-semibold text-brand">{i + 1}</div>
                                                                <span className="font-medium text-[13px] text-ink leading-tight line-clamp-2">{cit.title}</span>
                                                            </div>
                                                            <p className="text-ink-2 text-xs line-clamp-2 pl-7">
                                                                "{cit.snippet}"
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} className="h-4 w-full" />
                    </div>
                </div>

                {/* Bottom Composer */}
                <div className="w-full px-6 pb-6 pt-3 bg-canvas shrink-0 flex flex-col items-center">
                    {sendError && (
                        <div role="alert" className="w-full max-w-3xl mx-auto mb-2 flex items-center justify-between gap-3 rounded-lg border border-danger/30 bg-danger-soft px-3.5 py-2 text-[13px] text-danger">
                            <span className="flex items-center gap-2 min-w-0">
                                <X className="w-4 h-4 shrink-0" />
                                <span className="truncate">{sendError}</span>
                            </span>
                            <button onClick={() => setSendError(null)} aria-label="Descartar error" className="shrink-0 font-medium hover:underline">Descartar</button>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.txt,.md,.docx"
                        onChange={handleAttachFile}
                    />

                    <form onSubmit={handleSendMessage} className="relative w-full max-w-3xl mx-auto">
                        <div className="relative bg-surface border border-line-strong rounded-2xl shadow-card overflow-hidden flex flex-col transition-all focus-within:border-brand focus-within:ring-2 focus-within:ring-[var(--accent-ring)]">
                            <Textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                placeholder="Pregúntale a Atlas…"
                                className="w-full min-h-[58px] max-h-[240px] bg-transparent border-none shadow-none resize-none px-4 py-4 text-[15px] text-ink placeholder:text-ink-3 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:border-none"
                                disabled={isStreaming}
                            />

                            <div className="px-3 py-2.5 flex justify-between items-center border-t border-line">
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        aria-label="Adjuntar archivo"
                                        title="Adjuntar archivo (PDF, DOCX, TXT, MD)"
                                        className="flex h-8 w-8 items-center justify-center text-ink-3 hover:text-ink hover:bg-surface-2 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {uploading ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <Paperclip className="w-[17px] h-[17px]" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setWebSearch(v => !v)}
                                        aria-pressed={webSearch}
                                        title={webSearch ? 'Búsqueda web activada' : 'Activar búsqueda web'}
                                        className={`flex h-8 items-center gap-1.5 rounded-lg px-2 text-[13px] font-medium transition-colors ${
                                            webSearch ? 'bg-brand-soft text-brand' : 'text-ink-3 hover:text-ink hover:bg-surface-2'
                                        }`}
                                    >
                                        <Globe className="w-4 h-4" />
                                        <span className="hidden sm:inline">Web</span>
                                    </button>
                                </div>

                                {isStreaming ? (
                                    <button
                                        type="button"
                                        onClick={stopStreaming}
                                        aria-label="Detener respuesta"
                                        title="Detener"
                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-line-strong bg-surface text-ink hover:bg-surface-2 transition-colors shadow-xs"
                                    >
                                        <Square className="w-3.5 h-3.5 fill-current" />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={!input.trim()}
                                        aria-label="Enviar mensaje"
                                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-ink-on-accent hover:bg-brand-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
                                    >
                                        <Send className="w-[18px] h-[18px]" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                    <div className="max-w-3xl w-full text-center mt-3">
                        <p className="text-xs text-ink-3">
                            Atlas puede cometer errores. Verifica la información importante con las fuentes citadas.
                        </p>
                    </div>
                </div>
            </div>

        {/* Inline modals */}
        {renameModal && (
            <RenameModal
                initialValue={renameModal.title}
                onSave={(title) => { renameSession.mutate({ id: renameModal.id, title }); setRenameModal(null); }}
                onCancel={() => setRenameModal(null)}
            />
        )}
        {confirmDeleteId && (
            <ConfirmModal
                message="¿Eliminar esta conversación? No se puede deshacer."
                onConfirm={() => { deleteSession.mutate(confirmDeleteId); setConfirmDeleteId(null); }}
                onCancel={() => setConfirmDeleteId(null)}
            />
        )}
    </div>
    );
}
