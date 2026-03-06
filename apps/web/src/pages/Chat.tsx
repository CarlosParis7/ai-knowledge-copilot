import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Plus, Bot, User, Bookmark } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

export default function Chat() {
    const queryClient = useQueryClient();
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch Sessions
    const { data: sessions } = useQuery({
        queryKey: ['chat_sessions'],
        queryFn: async () => {
            const isDemo = localStorage.getItem('demo-mode') === 'true';
            if (isDemo) {
                return [
                    { id: 's1', title: 'Corporate Policy Questions', created_at: new Date().toISOString() },
                    { id: 's2', title: 'Q4 Financial Analysis', created_at: new Date(Date.now() - 3600000).toISOString() },
                ];
            }
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData?.session?.user) return [];

            const { data } = await supabase
                .from('chat_sessions')
                .select('*')
                .eq('user_id', sessionData.session.user.id)
                .order('created_at', { ascending: false });

            return data || [];
        }
    });

    // Fetch Messages for active session
    const { data: messages, isLoading: messagesLoading } = useQuery({
        queryKey: ['chat_messages', activeSessionId],
        queryFn: async () => {
            if (!activeSessionId) return [];
            const isDemo = localStorage.getItem('demo-mode') === 'true';
            if (isDemo && activeSessionId === 's1') {
                return [
                    { id: 'm1', role: 'user', content: 'What is our corporate travel policy?', created_at: new Date(Date.now() - 600000).toISOString() },
                    {
                        id: 'm2',
                        role: 'assistant',
                        content: 'According to the **Corporate Travel Policy**, employees are entitled to a daily stipend for meals and incidental expenses. Business class travel is only permitted for flights longer than 8 hours.',
                        citations: [{ title: 'Corporate Travel Policy.pdf', snippet: 'Daily stipend is $75/day. Business class requires VP approval for <8h and is standard for >8h.' }],
                        created_at: new Date(Date.now() - 580000).toISOString()
                    },
                ];
            }

            const { data } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('session_id', activeSessionId)
                .order('created_at', { ascending: true });
            return data || [];
        },
        enabled: !!activeSessionId
    });

    // Create new session
    const createSession = useMutation({
        mutationFn: async () => {
            const isDemo = localStorage.getItem('demo-mode') === 'true';
            if (isDemo) {
                return { id: `s-new-${Date.now()}`, title: 'New Chat Session' };
            }

            const { data: sessionInfo } = await supabase.auth.getSession();
            const user = sessionInfo?.session?.user;

            const { data: profile } = await supabase.from('profiles').select('company_id').eq('user_id', user?.id).single();

            const { data, error } = await supabase
                .from('chat_sessions')
                .insert({
                    company_id: profile?.company_id,
                    user_id: user?.id,
                    title: 'New Chat Session'
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

    // Send message
    const sendMessage = useMutation({
        mutationFn: async (messageText: string) => {
            const isDemo = localStorage.getItem('demo-mode') === 'true';
            if (isDemo) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                // Add message to mock state or just trigger success
                // In a real mock we'd update a local state with the user message + AI response
                // For this demo, we'll just indicate success
                return { success: true };
            }

            const { data: session } = await supabase.auth.getSession();
            const token = session.session?.access_token;

            const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    session_id: activeSessionId,
                    message: messageText
                })
            });

            if (!res.ok) throw new Error('Failed to send message');
            return res.json();
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to send message');
        },
        onSuccess: () => {
            const isDemo = localStorage.getItem('demo-mode') === 'true';
            if (isDemo) {
                toast.success("Demo Mode: AI response generated");
            }
            queryClient.invalidateQueries({ queryKey: ['chat_messages', activeSessionId] });
            setInput('');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !activeSessionId) return;

        // Optimistically update list isn't needed here if we just refresh, but
        // for production we'd add an optimistic update
        sendMessage.mutate(input);
    };

    useEffect(() => {
        if (sessions && sessions.length > 0 && !activeSessionId) {
            setActiveSessionId(sessions[0].id);
        }
    }, [sessions, activeSessionId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, sendMessage.isPending]);

    return (
        <div className="flex h-[calc(100vh-2rem)] py-8 px-8 max-w-7xl mx-auto gap-6 lg:gap-8">
            {/* Sidebar - Sessions */}
            <div className="w-80 flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden hidden md:flex">
                <div className="p-4 border-b border-border bg-muted/30">
                    <Button
                        className="w-full justify-start font-medium"
                        variant="default"
                        onClick={() => createSession.mutate()}
                        disabled={createSession.isPending}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Chat Session
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {sessions?.map((session) => (
                        <button
                            key={session.id}
                            onClick={() => setActiveSessionId(session.id)}
                            className={`w-full text-left px-3 py-3 rounded-md mb-1 flex items-center transition-colors text-sm
                ${activeSessionId === session.id
                                    ? 'bg-accent text-accent-foreground font-medium'
                                    : 'text-muted-foreground hover:bg-muted font-normal'}`}
                        >
                            <MessageSquare className="h-4 w-4 mr-3 opacity-70" />
                            <span className="truncate">{session.title}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden relative">
                {!activeSessionId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                        <Bot className="h-12 w-12 mb-4 opacity-20" />
                        <p>Select or create a chat session to begin.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                            {messagesLoading ? (
                                <div className="flex justify-center my-8 text-sm text-muted-foreground">Loading history...</div>
                            ) : messages?.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="bg-primary/10 p-4 rounded-full">
                                        <Bot className="h-8 w-8 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-foreground">How can I help you today?</h3>
                                        <p className="text-muted-foreground text-sm max-w-sm mt-1">
                                            Ask me anything about your uploaded documents. I'll search your knowledge base to find the answer.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                messages?.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`flex max-w-[85%] sm:max-w-2xl gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {/* Avatar */}
                                            <div className="flex-shrink-0">
                                                {msg.role === 'user' ? (
                                                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                                                        <User className="h-4 w-4 text-primary-foreground" />
                                                    </div>
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-accent border border-border flex items-center justify-center">
                                                        <Bot className="h-4 w-4 text-accent-foreground" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Bubble */}
                                            <div className={`rounded-xl px-4 py-3 text-sm ${msg.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted/50 border border-border/50 text-foreground'
                                                }`}>
                                                <div className="whitespace-pre-wrap leading-relaxed">
                                                    {msg.role === 'assistant' ? (
                                                        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground prose-p:leading-relaxed prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border">
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                {msg.content}
                                                            </ReactMarkdown>
                                                        </div>
                                                    ) : (
                                                        msg.content
                                                    )}
                                                </div>

                                                {/* Citations */}
                                                {msg.citations && msg.citations.length > 0 && (
                                                    <div className="mt-4 pt-3 border-t border-border/50">
                                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center">
                                                            <Bookmark className="h-3 w-3 mr-1" />
                                                            Sources
                                                        </p>
                                                        <div className="space-y-2">
                                                            {msg.citations.map((cit: any, i: number) => (
                                                                <div key={i} className="bg-background rounded border border-border p-2 text-xs">
                                                                    <div className="font-medium text-foreground mb-1 truncate">{cit.title}</div>
                                                                    <div className="text-muted-foreground line-clamp-2">"{cit.snippet}"</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            {sendMessage.isPending && (
                                <div className="flex gap-4 justify-start">
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="h-8 w-8 rounded-full bg-accent border border-border flex items-center justify-center animate-pulse">
                                                <Bot className="h-4 w-4 text-accent-foreground" />
                                            </div>
                                        </div>
                                        <div className="rounded-xl px-4 py-3 text-sm bg-muted/50 border border-border text-foreground flex items-center space-x-2">
                                            <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"></div>
                                            <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-border bg-card">
                            <form onSubmit={handleSubmit} className="relative flex items-end gap-2 max-w-3xl mx-auto">
                                <Textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask a question about your documents..."
                                    className="min-h-[56px] resize-none pr-12 focus-visible:ring-1 bg-background"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="absolute right-2 bottom-2 h-10 w-10 shrink-0"
                                    disabled={!input.trim() || sendMessage.isPending}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                            <div className="text-center mt-2">
                                <p className="text-[10px] text-muted-foreground">
                                    AI Knowledge Copilot can make mistakes. Verify important information.
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
