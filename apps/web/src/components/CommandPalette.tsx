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
        { id: '1', title: t('cmd.nav_dashboard'), icon: <Monitor className="w-[18px] h-[18px] text-ink-2" />, category: 'Navigation', action: () => { navigate('/dashboard'); setOpen(false); } },
        { id: '2', title: t('cmd.nav_chat'), icon: <MessageSquare className="w-[18px] h-[18px] text-ink-2" />, category: 'Navigation', action: () => { navigate('/chat'); setOpen(false); } },
        { id: '3', title: t('cmd.nav_documents'), icon: <Library className="w-[18px] h-[18px] text-ink-2" />, category: 'Navigation', action: () => { navigate('/documents'); setOpen(false); } },
        { id: '4', title: t('cmd.nav_prompts'), icon: <Lightbulb className="w-[18px] h-[18px] text-ink-2" />, category: 'Navigation', action: () => { navigate('/prompts'); setOpen(false); } },
        { id: '5', title: t('cmd.nav_settings'), icon: <SettingsIcon className="w-[18px] h-[18px] text-ink-2" />, category: 'Navigation', action: () => { navigate('/settings'); setOpen(false); } },
        { id: '6', title: t('cmd.toggle_demo'), icon: <Monitor className="w-[18px] h-[18px] text-ink-2" />, category: 'Commands', action: () => { toast("Demo Mode Toggled"); setOpen(false); } },
        { id: '7', title: t('cmd.logout'), icon: <LogOut className="w-[18px] h-[18px] text-danger" />, category: 'Danger', action: handleLogout },
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
                className="fixed inset-0 bg-ink/30 transition-opacity animate-in fade-in"
                onClick={() => setOpen(false)}
            ></div>

            {/* Modal */}
            <div
                className="relative w-full max-w-lg bg-surface rounded-xl shadow-float border border-line overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
                onClick={e => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center px-4 h-13 py-3 border-b border-line">
                    <Search className="w-[18px] h-[18px] text-ink-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('cmd.search')}
                        className="flex-1 bg-transparent border-none text-ink text-[15px] outline-none px-3 placeholder:text-ink-3"
                    />
                    <kbd className="px-1.5 py-0.5 bg-surface-2 border border-line rounded text-[10px] font-semibold text-ink-3 uppercase font-mono shrink-0">ESC</kbd>
                </div>

                {/* Results List */}
                <div className="max-h-[300px] overflow-y-auto p-1.5">
                    {filtered.length === 0 ? (
                        <div className="py-10 text-center text-ink-3 text-sm">
                            {t('cmd.no_results')}
                        </div>
                    ) : (
                        <div className="space-y-0.5">
                            {filtered.map((cmd, idx) => (
                                <button
                                    key={cmd.id}
                                    onClick={cmd.action}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                                        idx === selectedIndex ? 'bg-brand-soft text-ink' : 'text-ink-2 hover:bg-surface-2'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {cmd.icon}
                                        <span className="text-sm font-medium text-ink">{cmd.title}</span>
                                    </div>
                                    {idx === selectedIndex && (
                                        <kbd className="px-1.5 py-0.5 bg-surface border border-line rounded text-[10px] font-semibold text-ink-2 font-mono">↵</kbd>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-surface-2 px-4 py-2 border-t border-line flex items-center gap-4 text-[11px] font-medium text-ink-3">
                    <span className="flex items-center gap-1"><kbd className="bg-surface border border-line px-1 rounded">↑</kbd> <kbd className="bg-surface border border-line px-1 rounded">↓</kbd> {t('cmd.to_navigate')}</span>
                    <span className="flex items-center gap-1"><kbd className="bg-surface border border-line px-1 rounded">↵</kbd> {t('cmd.to_select')}</span>
                </div>
            </div>
        </div>
    );
}
