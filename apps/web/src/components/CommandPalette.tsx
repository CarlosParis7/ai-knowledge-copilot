import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Monitor, Library, Settings as SettingsIcon, Lightbulb, MessageSquare, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n';

interface CommandItem {
    id: string;
    title: string;
    icon: React.ReactNode;
    action: () => void;
    category: string;
}

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useLanguage();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen(true);
            }
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleLogout = async () => {
        localStorage.removeItem('demo-mode');
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const commands: CommandItem[] = [
        { id: '1', title: t('cmd.nav_dashboard'), icon: <Monitor className="w-4 h-4 text-primary" />, category: 'Navigation', action: () => { navigate('/dashboard'); setOpen(false); } },
        { id: '2', title: t('cmd.nav_chat'), icon: <MessageSquare className="w-4 h-4 text-emerald-400" />, category: 'Navigation', action: () => { navigate('/chat'); setOpen(false); } },
        { id: '3', title: t('cmd.nav_documents'), icon: <Library className="w-4 h-4 text-blue-400" />, category: 'Navigation', action: () => { navigate('/documents'); setOpen(false); } },
        { id: '4', title: t('cmd.nav_prompts'), icon: <Lightbulb className="w-4 h-4 text-amber-400" />, category: 'Navigation', action: () => { navigate('/prompts'); setOpen(false); } },
        { id: '5', title: t('cmd.nav_settings'), icon: <SettingsIcon className="w-4 h-4 text-[#A1A1AA]" />, category: 'Navigation', action: () => { navigate('/settings'); setOpen(false); } },
        { id: '6', title: t('cmd.toggle_demo'), icon: <Monitor className="w-4 h-4 text-[#A1A1AA]" />, category: 'Commands', action: () => { toast("Demo Mode Toggled"); setOpen(false); } },
        { id: '7', title: t('cmd.logout'), icon: <LogOut className="w-4 h-4 text-red-400" />, category: 'Danger', action: handleLogout },
    ];

    const filtered = commands.filter(cmd => cmd.title.toLowerCase().includes(search.toLowerCase()) || cmd.category.toLowerCase().includes(search.toLowerCase()));

    useEffect(() => {
        if (open) {
            setSearch('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filtered.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filtered[selectedIndex]) {
                filtered[selectedIndex].action();
            }
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in"
                onClick={() => setOpen(false)}
            ></div>

            {/* Modal */}
            <div 
                className="relative w-full max-w-lg bg-[#18181B] rounded-2xl shadow-2xl border border-[#ffffff]/10 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center px-4 py-3 border-b border-[#ffffff]/5">
                    <Search className="w-5 h-5 text-[#A1A1AA]" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('cmd.search')}
                        className="flex-1 bg-transparent border-none text-white text-[15px] outline-none px-4 placeholder:text-[#52525B]"
                    />
                    <div className="flex items-center gap-1.5 shrink-0">
                        <kbd className="px-2 py-1 bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-md text-[10px] font-bold text-[#A1A1AA] uppercase font-mono">ESC</kbd>
                    </div>
                </div>

                {/* Results List */}
                <div className="max-h-[300px] overflow-y-auto p-2">
                    {filtered.length === 0 ? (
                        <div className="py-10 text-center text-[#52525B] text-sm">
                            {t('cmd.no_results')}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filtered.map((cmd, idx) => (
                                <button
                                    key={cmd.id}
                                    onClick={cmd.action}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                                        idx === selectedIndex ? 'bg-primary/10 text-white' : 'text-[#A1A1AA] hover:bg-[#ffffff]/5 hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1 rounded-lg ${idx === selectedIndex ? 'bg-primary/20' : 'bg-transparent'}`}>
                                            {cmd.icon}
                                        </div>
                                        <span className="text-sm font-medium">{cmd.title}</span>
                                    </div>
                                    {idx === selectedIndex && (
                                        <kbd className="px-1.5 py-0.5 bg-[#ffffff]/10 rounded text-[10px] font-bold text-white uppercase font-mono">↵</kbd>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-[#09090B]/50 px-4 py-2 border-t border-[#ffffff]/5 flex items-center gap-4 text-[11px] font-medium text-[#52525B]">
                    <span className="flex items-center gap-1"><kbd className="bg-[#ffffff]/5 px-1 rounded">↑</kbd> <kbd className="bg-[#ffffff]/5 px-1 rounded">↓</kbd> {t('cmd.to_navigate')}</span>
                    <span className="flex items-center gap-1"><kbd className="bg-[#ffffff]/5 px-1 rounded">↵</kbd> {t('cmd.to_select')}</span>
                </div>
            </div>

        </div>
    );
}
