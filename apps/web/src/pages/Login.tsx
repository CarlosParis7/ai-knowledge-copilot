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
        <div className="min-h-[100dvh] flex items-center justify-center p-6">
            <div className="w-full max-w-[400px] flex flex-col items-center">

                {/* Brand Logo & Headline */}
                <div className="flex flex-col items-center mb-8 gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand text-ink-on-accent shadow-pop flex items-center justify-center">
                        <Box className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('login.title')}</h1>
                        <p className="mt-1.5 text-[15px] text-ink-2">{t('login.subtitle')}</p>
                    </div>
                </div>

                {/* Login Card */}
                <div className="w-full bg-surface border border-line rounded-xl p-7 shadow-card">
                    <form className="space-y-4" onSubmit={handleLogin}>
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-[13px] font-medium text-ink-2">{t('login.email')}</label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-[13px] font-medium text-ink-2">{t('login.password')}</label>
                                <a href="#" className="text-[13px] font-medium text-brand hover:text-brand-hover transition-colors">{t('login.forgot')}</a>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <Button type="submit" disabled={loading} size="lg" className="w-full mt-1">
                            {loading ? t('login.button_loading') : t('login.button')}
                        </Button>
                    </form>

                    <div className="mt-6 flex items-center gap-3">
                        <div className="flex-1 h-px bg-line"></div>
                        <span className="text-[12px] font-medium text-ink-3">{t('login.guest_access')}</span>
                        <div className="flex-1 h-px bg-line"></div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            localStorage.setItem('demo-mode', 'true');
                            toast.success("Sandbox environment activated");
                            navigate('/dashboard');
                        }}
                        className="w-full h-11 mt-4 flex items-center justify-center gap-2 text-[14px] font-medium text-ink bg-surface hover:bg-surface-2 border border-line-strong rounded-lg transition-colors group"
                    >
                        {t('login.demo')}
                        <ArrowRight className="w-4 h-4 text-ink-3 group-hover:text-ink-2 transition-transform group-hover:translate-x-0.5" />
                    </button>
                </div>

                {/* Footer terms */}
                <p className="mt-7 text-[12px] leading-relaxed text-ink-3 text-center max-w-[300px]">
                    {t('login.terms')}
                </p>
            </div>
        </div>
    );
}
