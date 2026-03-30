import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { CommandPalette } from '@/components/CommandPalette';

export default function MainLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

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
        return <div className="min-h-screen bg-[#09090B] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>;
    }

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: 'home' },
        { name: 'Chats', href: '/chat', icon: 'chat_bubble' },
        { name: 'Knowledge', href: '/documents', icon: 'library_books' },
        { name: 'Sources', href: '/sources', icon: 'cloud_queue' },
        { name: 'Prompts', href: '/prompts', icon: 'lightbulb' },
    ];

    /* 
     * Bottom Actions are hardcoded directly into the layout below 
     * for granular mobile-responsive control.
     */

    const handleLogout = async () => {
        localStorage.removeItem('demo-mode');
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <div className="bg-[#09090B] text-[#EBEBEB] font-body selection:bg-primary/30 min-h-[100dvh] flex flex-col md:flex-row">
            <CommandPalette />
            
            {/* Nav Rail Component - Fixed left on Desktop, Fixed bottom on Mobile */}
            <aside className="fixed z-[60] bg-[#18181B] flex 
                              md:left-0 md:top-0 md:h-screen md:w-[72px] md:flex-col md:border-r md:border-t-0 border-[#ffffff]/5 py-2 md:py-6
                              max-md:bottom-0 max-md:left-0 max-md:w-full max-md:h-[68px] max-md:flex-row max-md:border-t max-md:border-none shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-none justify-around md:justify-start items-center">
                
                {/* Logo (Desktop Only) */}
                <div className="hidden md:flex w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-container items-center justify-center shadow-lg shadow-primary/20 md:mb-8 shrink-0 cursor-default" title="Atlas Copilot">
                    <span className="material-symbols-outlined text-white text-[22px]">explore</span>
                </div>
                
                {/* Primary Nav */}
                <nav className="flex md:flex-1 md:flex-col flex-row items-center justify-around md:justify-start w-full md:space-y-3 space-x-1 md:space-x-0 px-2 md:px-0">
                    {navigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    isActive
                                        ? 'bg-[#ffffff]/10 text-white shadow-sm ring-1 ring-[#ffffff]/5'
                                        : 'text-[#A1A1AA] hover:text-white md:hover:bg-[#ffffff]/5',
                                    'group relative flex h-11 w-11 md:h-11 md:w-11 items-center justify-center rounded-xl transition-all duration-200 hover:z-[100]'
                                )}
                            >
                                <span className={cn(
                                    "material-symbols-outlined text-[24px] transition-colors",
                                    isActive ? "text-primary" : "text-[#A1A1AA] md:group-hover:text-white"
                                )}>{item.icon}</span>
                                
                                {/* Tooltip (Desktop Only) */}
                                <div className="hidden md:absolute md:left-full md:ml-4 md:group-hover:block z-[100] whitespace-nowrap bg-[#27272A] border border-[#ffffff]/10 px-3 py-1.5 text-xs font-semibold text-white rounded-lg shadow-xl shadow-black/50 pointer-events-none origin-left animate-in md:fade-in md:zoom-in-95 duration-100">
                                    {item.name}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions (Desktop Only / Condensed on Mobile) */}
                <div className="flex md:w-full md:flex-col flex-row items-center md:space-y-3 space-x-1 md:space-x-0 px-2 md:px-0 md:mt-auto shrink-0 justify-center">
                    
                    {/* Settings Icon - hidden on mobile, placed elsewhere ideally or kept */}
                    <Link
                        to="/settings"
                        className={cn(
                            location.pathname.startsWith('/settings')
                                ? 'bg-[#ffffff]/10 text-white shadow-sm ring-1 ring-[#ffffff]/5'
                                : 'text-[#A1A1AA] hover:text-white md:hover:bg-[#ffffff]/5',
                            'hidden md:flex group relative h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 hover:z-[100]'
                        )}
                    >
                        <span className="material-symbols-outlined text-[24px]">settings</span>
                        <div className="hidden md:absolute md:left-full md:ml-4 md:group-hover:block z-[100] whitespace-nowrap bg-[#27272A] border border-[#ffffff]/10 px-3 py-1.5 text-xs font-semibold text-white rounded-lg shadow-xl shadow-black/50 pointer-events-none">
                            Settings
                        </div>
                    </Link>

                    {/* Desktop Utility (Help, Logout, Ping) - Hidden on Mobile to save space */}
                    <div className="hidden md:flex flex-col items-center w-full space-y-3">
                        <Link to="/ayuda" className="text-[#A1A1AA] hover:text-white group relative flex h-11 w-11 items-center justify-center rounded-xl hover:bg-[#ffffff]/5 transition-all">
                            <span className="material-symbols-outlined text-[24px]">help</span>
                            <div className="absolute left-full ml-4 hidden group-hover:block z-[100] whitespace-nowrap bg-[#27272A] border border-[#ffffff]/10 px-3 py-1.5 text-xs font-semibold text-white rounded-lg shadow-xl shadow-black/50 pointer-events-none">Help</div>
                        </Link>
                        
                        {/* User Profile / Logout */}
                        <div className="relative group pt-4 hover:z-[100]">
                            <button onClick={handleLogout} className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#3F3F46] to-[#52525B] flex items-center justify-center text-white font-bold text-[11px] ring-2 ring-[#18181B] hover:ring-[#ffffff]/20 shadow-lg transition-all focus:outline-none">SA</button>
                            <div className="absolute left-full ml-4 hidden group-hover:block z-[100] whitespace-nowrap bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-500 rounded-lg shadow-xl pointer-events-none origin-left animate-in fade-in zoom-in-95 duration-100">Log out</div>
                        </div>

                        {/* Ping Status */}
                        <div className="pt-2">
                            <span className="relative flex h-2 w-2" title="System Online">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                        </div>
                    </div>

                    {/* Mobile Settings Access - Replacing User Avatar */}
                    <div className="md:hidden flex relative group items-center justify-center h-11 w-11 text-[#A1A1AA] hover:text-white transition-colors" onClick={() => navigate('/settings')}>
                       <span className={cn("material-symbols-outlined text-[24px]", location.pathname.startsWith('/settings') && "text-white")}>settings</span>
                    </div>

                </div>
            </aside>

            {/* Edge to Edge Main Area */}
            {/* mb-[68px] prevents content from hiding behind the bottom bar on mobile */}
            {/* md:mb-0 removes it for desktop */}
            <main className="flex-1 w-full bg-[#09090B] overflow-hidden min-h-[100dvh] max-md:pb-[68px] md:ml-[72px] md:w-[calc(100%-72px)] flex flex-col relative">
                <div className="flex-1 w-full h-full flex flex-col items-stretch overflow-hidden">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
