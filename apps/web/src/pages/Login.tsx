import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowRight, Box } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        supabase.auth
            .getSession()
            .then(({ data: { session } }) => {
                if (session) {
                    navigate('/dashboard');
                }
            })
            .catch(() => { });
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPassword = password.trim();
        const isDemoAccount = normalizedEmail === 'admin@example.com' && normalizedPassword === 'password';

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: normalizedEmail,
                password: normalizedPassword,
            });

            if (error) {
                if (isDemoAccount) {
                    localStorage.setItem('demo-mode', 'true');
                    toast.success("Demo Mode: Access Granted");
                    navigate('/dashboard');
                } else {
                    toast.error(error.message);
                    setLoading(false);
                }
            } else {
                toast.success("Welcome back!");
                navigate('/dashboard');
            }
        } catch (err: unknown) {
            if (isDemoAccount) {
                localStorage.setItem('demo-mode', 'true');
                toast.success("Demo Mode: Access Granted");
                navigate('/dashboard');
            } else {
                const message = err instanceof Error ? err.message : "Failed to connect to authentication server";
                toast.error(message);
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-6 relative overflow-hidden">
            
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10 flex flex-col items-center">
                
                {/* Brand Logo & Headline */}
                <div className="flex flex-col items-center mb-10 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ffffff]/10 to-[#ffffff]/5 border border-[#ffffff]/10 shadow-[0_0_40px_rgba(255,255,255,0.05)] flex items-center justify-center">
                        <Box className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold tracking-tight text-white font-headline">{t('login.title')}</h1>
                        <p className="mt-2 text-[15px] text-[#A1A1AA]">{t('login.subtitle')}</p>
                    </div>
                </div>

                {/* Login Card */}
                <div className="w-full bg-[#18181B]/80 backdrop-blur-xl border border-[#ffffff]/10 rounded-2xl p-8 shadow-2xl">
                    <form className="space-y-5" onSubmit={handleLogin}>
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold uppercase tracking-widest text-[#A1A1AA]">{t('login.email')}</label>
                            <Input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="h-11 bg-[#09090B] border-[#ffffff]/10 text-white placeholder:text-[#52525B] focus-visible:ring-primary/50 focus-visible:border-primary/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-[13px] font-bold uppercase tracking-widest text-[#A1A1AA]">{t('login.password')}</label>
                                <a href="#" className="text-xs font-semibold text-primary hover:text-white transition-colors">{t('login.forgot')}</a>
                            </div>
                            <Input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="h-11 bg-[#09090B] border-[#ffffff]/10 text-white placeholder:text-[#52525B] focus-visible:ring-primary/50 focus-visible:border-primary/50"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 mt-2 text-primary-foreground font-semibold bg-primary hover:bg-primary/90 rounded-xl transition-all shadow-lg shadow-primary/20"
                        >
                            {loading ? t('login.button_loading') : t('login.button')}
                        </Button>
                    </form>

                    <div className="mt-8 flex items-center gap-4">
                        <div className="flex-1 h-px bg-[#ffffff]/10"></div>
                        <span className="text-xs font-semibold uppercase tracking-widest text-[#52525B]">{t('login.guest_access')}</span>
                        <div className="flex-1 h-px bg-[#ffffff]/10"></div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            localStorage.setItem('demo-mode', 'true');
                            toast.success("Sandbox environment activated");
                            navigate('/dashboard');
                        }}
                        className="w-full h-11 mt-6 flex items-center justify-center gap-2 text-[14px] font-semibold text-white bg-[#ffffff]/5 hover:bg-[#ffffff]/10 border border-[#ffffff]/10 rounded-xl transition-all group"
                    >
                        {t('login.demo')}
                        <ArrowRight className="w-4 h-4 text-[#A1A1AA] group-hover:text-white transition-colors group-hover:translate-x-1" />
                    </button>
                </div>
                
                {/* Footer terms */}
                <p className="mt-8 text-xs text-[#52525B] text-center max-w-[280px]">
                    {t('login.terms')}
                </p>
            </div>
            
        </div>
    );
}
