import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, MessageSquare, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

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
        return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>;
    }

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Documents', href: '/documents', icon: FileText },
        { name: 'Chat', href: '/chat', icon: MessageSquare },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    const handleLogout = async () => {
        localStorage.removeItem('demo-mode');
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border pb-4 pt-5 flex flex-col">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent"></div>
                <div className="flex items-center flex-shrink-0 px-4">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mr-3">
                        <MessageSquare className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-lg font-semibold tracking-tight">Knowledge Copilot</span>
                </div>

                <nav className="mt-8 flex-1 space-y-1 px-2">
                    {navigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    isActive
                                        ? 'bg-accent text-accent-foreground'
                                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        isActive ? 'text-accent-foreground' : 'text-muted-foreground group-hover:text-foreground',
                                        'mr-3 flex-shrink-0 h-5 w-5'
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-4 mt-auto space-y-4">
                    <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-3 border border-border/50">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex flex-shrink-0 items-center justify-center text-primary font-medium text-xs">
                            ME
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-foreground truncate">Admin User</p>
                            <p className="text-xs text-muted-foreground truncate">Knowledge Corp</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="group flex w-full items-center px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                        <LogOut className="mr-3 flex-shrink-0 h-5 w-5 opacity-70 group-hover:opacity-100" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="pl-64 flex flex-col flex-1">
                <main className="flex-1 pb-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
