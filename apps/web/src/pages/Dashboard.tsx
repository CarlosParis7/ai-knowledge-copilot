import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { FileText, MessageSquare, Database, Activity } from 'lucide-react';

export default function Dashboard() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const isDemo = localStorage.getItem('demo-mode') === 'true';
            if (isDemo) {
                return {
                    documents: 12,
                    sessions: 48,
                    aiRunsToday: 156,
                };
            }

            const { data: session } = await supabase.auth.getSession();
            if (!session?.session?.user) return null;

            const { data: profile } = await supabase
                .from('profiles')
                .select('company_id')
                .eq('user_id', session.session.user.id)
                .single();

            if (!profile?.company_id) return null;

            const [docsResp, sessionsResp, runsResp] = await Promise.all([
                supabase.from('documents').select('id', { count: 'exact', head: true }).eq('company_id', profile.company_id),
                supabase.from('chat_sessions').select('id', { count: 'exact', head: true }).eq('company_id', profile.company_id),
                supabase.from('ai_runs').select('id', { count: 'exact', head: true }).eq('company_id', profile.company_id).gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
            ]);

            return {
                documents: docsResp.count || 0,
                sessions: sessionsResp.count || 0,
                aiRunsToday: runsResp.count || 0,
            };
        }
    });

    const statCards = [
        { name: 'Indexed Documents', value: stats?.documents ?? '-', icon: Database },
        { name: 'Chat Sessions', value: stats?.sessions ?? '-', icon: MessageSquare },
        { name: 'AI API Calls (Today)', value: stats?.aiRunsToday ?? '-', icon: Activity },
        { name: 'Pending Uploads', value: '0', icon: FileText },
    ];

    if (isLoading) {
        return (
            <div className="p-8 space-y-6">
                <div className="h-8 w-48 shimmer-bg rounded"></div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 shimmer-bg rounded-xl border border-border/50"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-1 text-sm">Overview of your knowledge base performance.</p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((item) => (
                    <div
                        key={item.name}
                        className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/40"
                    >
                        {/* Subtle background glow on hover */}
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl -z-10 blur"></div>

                        <dt>
                            <div className="absolute rounded-lg bg-primary/10 p-3 ring-1 ring-primary/20 group-hover:bg-primary/20 transition-colors">
                                <item.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                            </div>
                            <p className="ml-16 truncate text-sm font-medium text-muted-foreground">
                                {item.name}
                            </p>
                        </dt>
                        <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
                            <p className="text-2xl font-semibold text-foreground">{item.value}</p>
                        </dd>
                    </div>
                ))}
            </div>
        </div>
    );
}
