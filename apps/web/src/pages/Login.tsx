import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                navigate('/dashboard');
            }
        });
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const isDemoAccount = email === 'admin@example.com' && password === 'password';

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                // If it's a demo account and it failed (likely due to no backend), bypass
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
        } catch (err: any) {
            // Demo Bypass for thrown network errors
            if (isDemoAccount) {
                localStorage.setItem('demo-mode', 'true');
                toast.success("Demo Mode: Access Granted");
                navigate('/dashboard');
            } else {
                toast.error(err.message || "Failed to connect to authentication server");
                setLoading(false);
            }
        }
    };

    return (
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center mb-6">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-card to-background flex items-center justify-center border border-border/50 shadow-2xl">
                        <Bot className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                </div>
            </div>
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-foreground">
                Knowledge Copilot
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
                Sign in to manage your AI knowledge base
            </p>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="glass-card sm:rounded-2xl sm:px-10 py-8 px-4 w-full">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-medium text-foreground">
                                Email address
                            </label>
                            <div className="mt-1">
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground">
                                Password
                            </label>
                            <div className="mt-1">
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Error state handled via Sonner toast */}

                        <div>
                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-semibold shadow-sm"
                                disabled={loading}
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </div>

                        <div className="mt-4 text-center">
                            <p className="text-xs text-muted-foreground">
                                Use <code className="bg-muted px-1 py-0.5 rounded">admin@example.com / password</code> for demo
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
