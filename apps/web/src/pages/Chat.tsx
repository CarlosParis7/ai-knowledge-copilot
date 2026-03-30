import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Plus, Search, Map, Zap, Bookmark, MoreHorizontal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

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
    const [isStreaming, setIsStreaming] = useState(false);
    const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);

    const { data: sessions } = useQuery({
        queryKey: ['chat_sessions'],
        queryFn: async () => {
            const isDemo = localStorage.getItem('demo-mode') === 'true';
            if (isDemo) {
                return [
                    { id: 's1', title: 'Exportación Aérea (AWB) + DG', created_at: new Date().toISOString() },
                    { id: 's2', title: 'Marítimo LCL: recargos y cut-offs', created_at: new Date(Date.now() - 3600000).toISOString() },
                ] satisfies ChatSession[];
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
            const isDemo = localStorage.getItem('demo-mode') === 'true';
            if (isDemo && resolvedActiveSessionId === 's1') {
                return [
                    { id: 'm1', role: 'user', content: 'Necesito exportar por aéreo (AWB) una carga DG clase 3. ¿Qué checklist mínimo debo seguir antes de aceptar en almacén y embarcar?', created_at: new Date(Date.now() - 600000).toISOString() },
                    {
                        id: 'm2',
                        role: 'assistant',
                        content: [
                            'Para exportar carga peligrosa (DG Clase 3 - Líquidos Inflamables) por vía aérea, debes cumplir rigurosamente con la reglamentación de IATA DGR. Este es el checklist mínimo operativo:',
                            '',
                            '**1. Identificación y Clasificación**',
                            '• Confirmar el UN Number y Proper Shipping Name.',
                            '• Validar el Grupo de Embalaje (Packing Group I, II, o III).',
                            '',
                            '**2. Documentación Requerida**',
                            '• MSDS (Hoja de Seguridad) vigente (Sección 14 debe autorizar transporte aéreo).',
                            '• Shipper\'s Declaration for Dangerous Goods (DGD) completada y firmada por personal certificado.',
                            '• Factura comercial y Packing List.',
                            '',
                            '**3. Empaque y Etiquetado**',
                            '• El empaque debe ser homologado (UN Specification Packaging).',
                            '• Etiqueta de riesgo primario (Clase 3: Líquido Inflamable) y secundarios (si aplican).',
                            '• Marcas visibles: UN Number, Proper Shipping Name, direcciones remitente/consignatario y marcas de orientación (flechas) si son líquidos.',
                            '',
                            '⚠️ **Acción crítica:** No aceptes la carga en tu almacén ni firmes guías de remisión si la documentación o el empaque presentan cualquier inconsistencia.',
                        ].join('\n'),
                        citations: [
                            { title: 'IATA DGR - Protocolo Operativo', snippet: 'Aceptación de carga peligrosa requiere verificación de DGD, etiquetado Clase 3 y empaques homologados UN.' },
                            { title: 'Almacén SOP', snippet: 'Las cargas DG deben ser segregadas inmediatamente. No aceptar sin MSDS validado por supervisor.' }
                        ],
                        created_at: new Date(Date.now() - 580000).toISOString()
                    },
                ] satisfies ChatMessage[];
            }
            if (isDemo && resolvedActiveSessionId === 's2') {
                return [
                    { id: 'm3', role: 'user', content: 'Para un LCL marítimo CN → PA (Incoterm CIF), ¿qué recargos típicos debo considerar y qué debo confirmar antes del cut-off?', created_at: new Date(Date.now() - 480000).toISOString() },
                    {
                        id: 'm4',
                        role: 'assistant',
                        content: [
                            'En consolidaciones marítimas (LCL) desde China hacia Panamá bajo Incoterm CIF, los riesgos de costos ocultos suelen estar en destino. Te detallo el panorama:',
                            '',
                            '**1. Recargos en Origen (Normalmente Prepaid)**',
                            'Bajo CIF, el proveedor paga el flete principal, pero averigua si incluyeron:',
                            '- BAF (Bunker Adjustment Factor)',
                            '- ENS / AMS (Transmisión de aduanas)',
                            '- Origin Handling Charge (OHC/THC)',
                            '',
                            '**2. Recargos Locales en Panamá (Collect)**',
                            'Estos son los que afectarán a tu comprador y debes transparentar:',
                            '- Terminal Handling Charge (THC) Puerto Balboa/Manzanillo.',
                            '- Desconsolidación en recinto (CFS Charge).',
                            '- Manejo documental (Doc Fee / Release Fee).',
                            '- Port Security e inspecciones posibles (AUPSA, Aduanas).',
                            '',
                            '**3. Checklist Pre Cut-Off**',
                            '• Solicita borrador de MBL/HBL y verifica que se declare peso bruto y CBM correctos.',
                            '• Confirma la partida arancelaria (HS Code) para evitar retenciones.',
                            '• Asegúrate de recibir confirmación de zarpe (Vessel Departure) para calcular la llegada exacta.',
                        ].join('\n'),
                        citations: [
                            { title: 'Guía LCL Latam', snippet: 'Las cargas CIF suelen esconder recargos altísimos en destino. Negociar CFS y THC locales antes de embarque.' },
                        ],
                        is_cached: true,
                        created_at: new Date(Date.now() - 450000).toISOString()
                    },
                ] satisfies ChatMessage[];
            }

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
            const isDemo = localStorage.getItem('demo-mode') === 'true';
            if (isDemo) {
                return { id: `s-new-${Date.now()}`, title: 'New Conversation' };
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

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const messageText = input.trim();
        if (!messageText || !resolvedActiveSessionId || isStreaming) return;

        setInput('');
        
        const isDemo = localStorage.getItem('demo-mode') === 'true';
        if (isDemo) {
            toast.success("Demo Mode: Simulated processing...");
            return;
        }

        setIsStreaming(true);
        const userMsg: ChatMessage = { id: `temp-u-${Date.now()}`, role: 'user', content: messageText };
        const assistantMsg: ChatMessage = { id: `temp-a-${Date.now()}`, role: 'assistant', content: '', citations: [] };
        
        setOptimisticMessages([userMsg, assistantMsg]);

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
                    message: messageText
                })
            });

            if (!res.ok) throw new Error('Failed to send message');

            if (res.headers.get('content-type')?.includes('application/json')) {
                const data = await res.json();
                setOptimisticMessages([userMsg, data]);
            } else {
                const reader = res.body?.getReader();
                const decoder = new TextDecoder();
                if (!reader) throw new Error('No stream available');
                
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
                                }
                            } catch (e) {
                                // ignore
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
            toast.error(error instanceof Error ? error.message : 'Failed to send message');
            setOptimisticMessages([]); 
        } finally {
            setIsStreaming(false);
            await queryClient.invalidateQueries({ queryKey: ['chat_messages', resolvedActiveSessionId] });
            setOptimisticMessages([]);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isStreaming]);

    return (
        <div className="flex h-screen w-full bg-[#09090B] overflow-hidden">
            
            {/* Secondary Sidebar - Conversations */}
            <div className="w-80 h-full border-r border-[#ffffff]/5 bg-[#18181B] flex flex-col shrink-0 hidden md:flex z-10 shadow-xl">
                <div className="p-4 flex items-center justify-between sticky top-0 bg-[#18181B] z-10 border-b border-[#ffffff]/5 shrink-0">
                    <h2 className="text-[13px] uppercase tracking-widest font-bold text-[#A1A1AA]">Chat History</h2>
                    <button 
                        onClick={() => createSession.mutate()}
                        disabled={createSession.isPending}
                        className="text-[#A1A1AA] hover:text-white p-1 hover:bg-[#ffffff]/10 rounded-md transition-colors tooltip-target"
                        title="New Chat"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto pt-4 pb-4 scrollbar-thin scrollbar-thumb-[#3F3F46] scrollbar-track-transparent">
                    <div className="px-3 space-y-1">
                        {sessions?.map((session) => {
                            const isActive = resolvedActiveSessionId === session.id;
                            return (
                                <button
                                    key={session.id}
                                    onClick={() => setActiveSessionId(session.id)}
                                    className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                                        ${isActive 
                                            ? 'bg-[#ffffff]/10 text-white font-medium shadow-sm ring-1 ring-[#ffffff]/5' 
                                            : 'text-[#A1A1AA] hover:bg-[#ffffff]/5 hover:text-[#EBEBEB]'}`}
                                >
                                    <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                                    <span className="truncate flex-1 text-left">{session.title}</span>
                                    {isActive && <MoreHorizontal className="w-4 h-4 opacity-50 hover:opacity-100" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Chat Content */}
            <div className="flex-1 h-full flex flex-col relative bg-[#09090B] items-center">
                
                {/* Messages Container */}
                <div className="flex-1 w-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#3F3F46] scrollbar-track-transparent flex flex-col items-center">
                    <div className="w-full max-w-3xl px-6 py-12 flex flex-col gap-10 min-h-full">
                        
                        {!resolvedActiveSessionId ? (
                            <div className="flex-1 flex items-center justify-center text-[#A1A1AA]">
                                Select or create a session to start.
                            </div>
                        ) : messagesLoading ? (
                            <div className="flex justify-center mt-20 text-sm text-[#A1A1AA] animate-pulse">Loading conversation...</div>
                        ) : messages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-500">
                                <div className="w-16 h-16 rounded-2xl bg-[#ffffff]/5 border border-[#ffffff]/10 flex items-center justify-center shadow-2xl">
                                    <span className="material-symbols-outlined text-4xl text-primary">forum</span>
                                </div>
                                <h3 className="text-2xl font-semibold text-white tracking-tight font-headline">How can I help you today?</h3>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className="w-full flex gap-5 group animate-in slide-in-from-bottom-2 fade-in duration-300">
                                    {/* Avatar */}
                                    <div className="shrink-0 pt-0.5">
                                        {msg.role === 'user' ? (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3F3F46] to-[#52525B] flex items-center justify-center shadow-lg ring-1 ring-[#ffffff]/10">
                                                <span className="text-[11px] font-bold text-white">SA</span>
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center ring-1 ring-primary/40 shadow-lg shadow-primary/10">
                                                <span className="material-symbols-outlined text-[18px] text-primary">explore</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Content Area */}
                                    <div className="flex-1 min-w-0 flex flex-col">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-semibold text-[15px] text-white font-headline">
                                                {msg.role === 'user' ? 'You' : 'Atlas Copilot'}
                                            </span>
                                            
                                            {/* Cache Hit Badge */}
                                            {msg.is_cached && (
                                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold tracking-widest ml-2">
                                                    <Zap className="w-3 h-3" /> Cached
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-[15px] leading-relaxed text-[#D4D4D8]">
                                            {msg.role === 'assistant' ? (
                                                msg.content === '' && isStreaming ? (
                                                    <div className="flex items-center space-x-2 h-6">
                                                        <div className="w-2 h-2 rounded-full bg-[#A1A1AA] animate-bounce"></div>
                                                        <div className="w-2 h-2 rounded-full bg-[#A1A1AA] animate-bounce [animation-delay:-0.15s]"></div>
                                                        <div className="w-2 h-2 rounded-full bg-[#A1A1AA] animate-bounce [animation-delay:-0.3s]"></div>
                                                    </div>
                                                ) : (
                                                    <div className="prose prose-invert max-w-none prose-p:leading-[1.7] prose-pre:bg-[#18181B] prose-pre:border prose-pre:border-[#ffffff]/10 prose-headings:text-white prose-strong:text-white prose-a:text-primary">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="whitespace-pre-wrap font-medium">{msg.content}</div>
                                            )}
                                        </div>

                                        {/* Citations Panel */}
                                        {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                                            <div className="mt-6 space-y-3">
                                                <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#A1A1AA]">
                                                    <Bookmark className="w-3.5 h-3.5" />
                                                    Sources Evaluated
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {msg.citations.map((cit, i) => (
                                                        <div key={i} className="bg-[#18181B] border border-[#ffffff]/5 hover:border-[#ffffff]/20 hover:bg-[#27272A] transition-all duration-200 rounded-xl p-3.5 cursor-pointer shadow-sm">
                                                            <div className="flex items-start gap-2 mb-2">
                                                                <div className="mt-0.5 w-5 h-5 rounded bg-primary/20 flex items-center justify-center shrink-0">
                                                                    <Map className="w-3 h-3 text-primary" />
                                                                </div>
                                                                <span className="font-semibold text-[13px] text-[#EBEBEB] leading-tight line-clamp-2">{cit.title}</span>
                                                            </div>
                                                            <p className="text-[#A1A1AA] text-xs line-clamp-2 pl-7">
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

                {/* Floating Bottom Composer */}
                <div className="w-full px-6 pb-8 pt-4 bg-gradient-to-t from-[#09090B] via-[#09090B] to-transparent shrink-0 flex flex-col items-center">
                    <form onSubmit={handleSendMessage} className="relative group w-full max-w-3xl mx-auto">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-primary-container/30 rounded-[26px] blur-[8px] opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                        <div className="relative bg-[#18181B] border border-[#ffffff]/10 rounded-[24px] shadow-2xl overflow-hidden flex flex-col transition-all focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/40">
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                placeholder="Ask Atlas anything..."
                                className="w-full min-h-[64px] max-h-[240px] bg-transparent border-none resize-none px-6 py-5 text-[15px] text-white placeholder:text-[#52525B] focus:outline-none focus:ring-0 focus-visible:ring-0"
                                disabled={isStreaming}
                            />
                            
                            <div className="px-4 py-3 flex justify-between items-center bg-[#18181B] border-t border-[#ffffff]/5">
                                <div className="flex gap-2 text-[#A1A1AA]">
                                    <button type="button" className="p-2 hover:text-white hover:bg-[#ffffff]/10 rounded-xl transition-colors flex items-center justify-center tooltip-target" title="Add File">
                                        <Plus className="w-5 h-5" />
                                    </button>
                                    <button type="button" className="p-2 hover:text-white hover:bg-[#ffffff]/10 rounded-xl transition-colors flex items-center justify-center tooltip-target" title="Web Search">
                                        <Search className="w-4 h-4" />
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isStreaming}
                                    className="bg-primary text-primary-foreground p-2.5 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-primary/20"
                                >
                                    <Send className="w-5 h-5 ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </form>
                    <div className="max-w-3xl w-full text-center mt-4">
                        <p className="text-xs text-[#52525B]">
                            Atlas is a conversational AI and may produce inaccurate information. Always double check critical data.
                        </p>
                    </div>
                </div>
            </div>
            
        </div>
    );
}
