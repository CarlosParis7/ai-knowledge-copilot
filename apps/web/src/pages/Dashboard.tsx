import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Send, FileText, Zap } from 'lucide-react';

export default function Dashboard() {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');

    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const isDemo = localStorage.getItem('demo-mode') === 'true';
            if (isDemo) {
                return { documents: 12 };
            }

            const { data: session } = await supabase.auth.getSession();
            if (!session?.session?.user) return null;

            const { data: profile } = await supabase
                .from('profiles')
                .select('company_id')
                .eq('user_id', session.session.user.id)
                .single();

            if (!profile?.company_id) return null;

            const { count } = await supabase.from('documents').select('id', { count: 'exact', head: true }).eq('company_id', profile.company_id);
            return { documents: count || 0 };
        }
    });

    const handlePromptSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            navigate(`/chat?q=${encodeURIComponent(prompt)}`);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-[#09090B]">
                <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    const quickActions = [
        { icon: <FileText className="w-4 h-4" />, label: 'Summarize recent documents' },
        { icon: <Search className="w-4 h-4" />, label: 'Search workspace knowledge' },
        { icon: <Zap className="w-4 h-4" />, label: 'Compare policy differences' }
    ];

    const recentChats = [
        { title: "SLA requirements for US PO Box routing", time: "2h ago", id: "1", icon: 'bolt' },
        { title: "Checklist for air freight DG Class 3", time: "5h ago", id: "2", icon: 'flight_takeoff' },
        { title: "LCL Maritime typical surcharges for CN to PA CIF", time: "Yesterday", id: "3", icon: 'directions_boat' },
    ];

    return (
        <div className="flex-1 w-full flex flex-col items-center bg-[#09090B] px-6">
            
            {/* Centered Area */}
            <div className="w-full max-w-3xl flex-1 flex flex-col justify-center min-h-[55vh] pt-12 pb-8">
                
                {/* Hero Section */}
                <div className="w-full text-center space-y-4 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-4xl md:text-[44px] font-bold tracking-tight text-white font-headline leading-tight">
                        What do you want to solve today?
                    </h1>
                    <p className="text-[#A1A1AA] text-lg max-w-xl mx-auto">
                        Search your connected knowledge base to get fast, verifiable answers.
                    </p>
                </div>

                {/* Main Composer */}
                <form onSubmit={handlePromptSubmit} className="relative group w-full animate-in zoom-in-95 fade-in duration-700 delay-150">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary-container/20 rounded-[28px] blur-[12px] opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                    <div className="relative bg-[#18181B] border border-[#ffffff]/10 rounded-[24px] shadow-2xl overflow-hidden flex flex-col transition-all focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/40">
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handlePromptSubmit(e);
                                }
                            }}
                            placeholder="Ask Atlas anything..."
                            className="w-full min-h-[140px] bg-transparent border-none resize-none px-6 py-5 text-lg text-white placeholder:text-[#52525B] focus:outline-none focus:ring-0"
                            autoFocus
                        />
                        <div className="px-5 py-3 flex justify-between items-center bg-[#18181B] border-t border-[#ffffff]/5">
                            <div className="flex gap-2 text-[#A1A1AA]">
                                <button type="button" className="p-2.5 hover:text-white hover:bg-[#ffffff]/10 rounded-xl transition-colors flex items-center justify-center tooltip-target" title="Add File">
                                    <Plus className="w-5 h-5" />
                                </button>
                                <button type="button" className="p-2.5 hover:text-white hover:bg-[#ffffff]/10 rounded-xl transition-colors flex items-center justify-center tooltip-target" title="Search web">
                                    <Search className="w-4 h-4" />
                                </button>
                            </div>
                            <button 
                                type="submit" 
                                disabled={!prompt.trim()}
                                className="bg-primary text-primary-foreground p-3 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-primary/20"
                            >
                                <Send className="w-5 h-5 ml-0.5" />
                            </button>
                        </div>
                    </div>
                </form>

                {/* Quick Actions */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-8 animate-in fade-in zoom-in-95 duration-700 delay-300">
                    {quickActions.map((action, i) => (
                        <button key={i} onClick={() => setPrompt(action.label)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18181B] border border-[#ffffff]/10 text-sm font-medium text-[#A1A1AA] hover:text-white hover:border-[#ffffff]/25 hover:bg-[#27272A] transition-all cursor-pointer shadow-sm">
                            <span className="text-primary/70">{action.icon}</span>
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bottom Section - Recent History & Sources Grid */}
            <div className="w-full max-w-5xl pb-16 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-500">
                
                {/* Recent Chats */}
                <div className="col-span-1 md:col-span-2 flex flex-col space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#A1A1AA]">Recent Conversations</h3>
                        <Link to="/chat" className="text-xs font-semibold text-primary hover:text-white transition-colors">View All</Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {recentChats.map((chat) => (
                            <Link to={`/chat/${chat.id}`} key={chat.id} className="flex items-start gap-4 p-4 rounded-2xl bg-[#18181B] border border-[#ffffff]/5 hover:border-[#ffffff]/20 hover:bg-[#27272A] transition-all group shadow-sm">
                                <div className="w-10 h-10 rounded-[14px] bg-[#ffffff]/5 flex items-center justify-center text-[#A1A1AA] group-hover:text-primary transition-colors shrink-0">
                                    <span className="material-symbols-outlined text-[20px]">{chat.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <p className="text-[14px] font-semibold text-[#EBEBEB] leading-tight line-clamp-2 group-hover:text-white transition-colors">{chat.title}</p>
                                    <p className="text-xs text-[#71717A] mt-1.5 font-medium">{chat.time}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Workspace Context Stats */}
                <div className="col-span-1 flex flex-col space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#A1A1AA] px-1">Knowledge Source</h3>
                    <div className="bg-[#18181B] border border-[#ffffff]/5 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-full group hover:border-[#ffffff]/20 hover:bg-[#27272A] transition-all shadow-sm">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -mr-16 -mt-16 group-hover:bg-primary/20 transition-all"></div>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-[14px] bg-primary/20 text-primary flex items-center justify-center ring-1 ring-primary/30">
                                <span className="material-symbols-outlined text-[20px]">library_books</span>
                            </div>
                            <span className="text-sm font-semibold text-white tracking-wide">Connected</span>
                        </div>
                        
                        <div>
                            <div className="flex items-baseline gap-2">
                                <h4 className="text-5xl font-extrabold text-white font-headline tracking-tighter shadow-sm">{stats?.documents ?? 0}</h4>
                                <span className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-widest">Docs</span>
                            </div>
                            
                            <div className="mt-5 border-t border-[#ffffff]/10 pt-4 flex justify-between items-center">
                                <span className="text-xs text-[#71717A] font-medium">Synced today</span>
                                <Link to="/documents" className="text-xs font-bold text-primary hover:text-white transition-colors flex items-center gap-1 uppercase tracking-widest">
                                    Manage <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
