import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { CommandPalette } from '@/components/CommandPalette';
import { useLanguage } from '@/lib/i18n';

export default function MainLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { lang, setLang, t } = useLanguage();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const isDemo = localStorage.getItem('demo-mode') === 'true';

            if (!session && !isDemo) {
                navigate('/login', { replace: true });
            }
            setLoading(false);
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const isDemo = localStorage.getItem('demo-mode') === 'true';
            if (!session && !isDemo) {
                navigate('/login', { replace: true });
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-[100dvh] bg-canvas flex items-center justify-center">
                <div className="w-7 h-7 rounded-full border-[2.5px] border-line-strong border-t-brand animate-spin" />
            </div>
        );
    }

    const navigation = [
        { name: t('nav.dashboard'), href: '/dashboard', icon: 'home' },
        { name: t('nav.chats'), href: '/chat', icon: 'forum' },
        { name: t('nav.knowledge'), href: '/documents', icon: 'library_books' },
        { name: t('nav.sources'), href: '/sources', icon: 'cloud_sync' },
        { name: t('nav.prompts'), href: '/prompts', icon: 'lightbulb' },
    ];

    const handleLogout = async () => {
        localStorage.removeItem('demo-mode');
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const NavItem = ({ href, icon, name }: { href: string; icon: string; name: string }) => {
        const isActive = location.pathname.startsWith(href);
        return (
            <Link
                to={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 h-10 text-[14px] font-medium transition-colors duration-150',
                    isActive
                        ? 'bg-brand-soft text-brand'
                        : 'text-ink-2 hover:bg-surface-3 hover:text-ink'
                )}
            >
                <span
                    className={cn(
                        'material-symbols-outlined text-[21px]',
                        isActive ? 'text-brand' : 'text-ink-3 group-hover:text-ink-2'
                    )}
                    style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" } : undefined}
                >
                    {icon}
                </span>
                <span className="truncate">{name}</span>
            </Link>
        );
    };

    return (
        <div className="bg-canvas text-ink font-body min-h-[100dvh] flex flex-col md:flex-row">
            <CommandPalette />

            {/* ===== Desktop sidebar ===== */}
            <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-[248px] flex-col border-r border-line bg-surface-2 px-3 py-4">
                {/* Brand */}
                <Link to="/dashboard" className="flex items-center gap-2.5 px-2 pb-5 pt-1">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-ink-on-accent shadow-xs">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}>explore</span>
                    </span>
                    <span className="text-[15px] font-semibold tracking-tight text-ink">Atlas Copilot</span>
                </Link>

                <nav className="flex flex-col gap-1">
                    {navigation.map((item) => <NavItem key={item.href} {...item} />)}
                </nav>

                <div className="mt-auto flex flex-col gap-1 border-t border-line pt-3">
                    <NavItem href="/settings" icon="settings" name={t('nav.settings')} />
                    <NavItem href="/ayuda" icon="help" name={t('nav.help')} />

                    <button
                        onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
                        className="flex items-center gap-3 rounded-lg px-3 h-10 text-[14px] font-medium text-ink-2 hover:bg-surface-3 hover:text-ink transition-colors"
                    >
                        <span className="material-symbols-outlined text-[21px] text-ink-3">language</span>
                        <span>{lang === 'en' ? 'English' : 'Español'}</span>
                        <span className="ml-auto text-[11px] font-semibold uppercase text-ink-3">{lang}</span>
                    </button>

                    {/* Account */}
                    <div className="mt-2 flex items-center gap-2.5 rounded-lg px-2 py-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[12px] font-semibold text-brand">SA</div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium text-ink">System Admin</p>
                            <p className="flex items-center gap-1 text-[11px] text-ink-3">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
                                {t('nav.system_online')}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            title={t('nav.logout')}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 hover:bg-danger-soft hover:text-danger transition-colors"
                        >
                            <span className="material-symbols-outlined text-[19px]">logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* ===== Mobile top bar ===== */}
            <header className="md:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-surface-2/95 backdrop-blur px-4">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-ink-on-accent">
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
                    </span>
                    <span className="text-[14px] font-semibold text-ink">Atlas Copilot</span>
                </Link>
                <button
                    onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
                    className="text-[12px] font-semibold uppercase text-ink-2"
                >
                    {lang}
                </button>
            </header>

            {/* ===== Mobile bottom nav ===== */}
            <nav className="md:hidden fixed bottom-0 left-0 z-40 flex h-16 w-full items-stretch justify-around border-t border-line bg-surface-2/95 backdrop-blur safe-area-bottom">
                {[...navigation, { name: t('nav.settings'), href: '/settings', icon: 'settings' }].map((item) => {
                    const isActive = location.pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            aria-current={isActive ? 'page' : undefined}
                            className="flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 px-1"
                        >
                            <span
                                className={cn('material-symbols-outlined text-[22px] leading-none', isActive ? 'text-brand' : 'text-ink-3')}
                                style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 500" } : undefined}
                            >
                                {item.icon}
                            </span>
                            <span className={cn('text-[9px] font-medium truncate max-w-full', isActive ? 'text-brand' : 'text-ink-3')}>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* ===== Main ===== */}
            <main className="flex-1 w-full bg-canvas min-h-[100dvh] flex flex-col md:ml-[248px] max-md:pb-16">
                <div className="flex-1 w-full flex flex-col overflow-hidden">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
