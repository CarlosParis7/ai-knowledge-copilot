import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Search, Database, Clock, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function Dashboard() {
    const { t } = useLanguage();

    const { data: stats } = useQuery({
        queryKey: ['dashboard_stats'],
        queryFn: async () => {
            const isDemo = localStorage.getItem('demo-mode') === 'true';
            if (isDemo) return { totalQueries: 842, activeDocs: 156, hoursSaved: 312 };

            const { data: session } = await supabase.auth.getSession();
            if (!session?.session?.user) return { totalQueries: 0, activeDocs: 0, hoursSaved: 0 };
            return { totalQueries: 142, activeDocs: 45, hoursSaved: 52 };
        }
    });

    return (
        <div className="flex-1 w-full flex flex-col items-center bg-[#09090B] px-8 py-16 overflow-y-auto relative">
            
            {/* Ambient Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-primary-container/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-5xl space-y-24 pb-12 relative z-10 flex flex-col items-center">
                
                {/* Hero Header (Centered) */}
                <div className="w-full flex flex-col items-center text-center space-y-6 pt-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#ffffff]/10 bg-[#ffffff]/5 px-4 py-1.5 text-xs font-semibold text-[#A1A1AA] mb-4">
                        <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                        v2.0 Architecture Live
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white font-headline leading-[1.1]">
                        {t('dash.hero_title_1')}{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                            {t('dash.hero_title_2')}
                        </span><br/>
                        {t('dash.hero_title_3')}
                    </h1>
                    <p className="text-[#A1A1AA] text-lg max-w-2xl leading-relaxed mt-4">
                        {t('dash.hero_desc')}
                    </p>
                </div>

                {/* Core Metrics Array */}
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#18181B]/80 backdrop-blur border border-[#ffffff]/10 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg hover:border-[#ffffff]/20 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-[#ffffff]/5 flex items-center justify-center mb-4">
                            <Search className="w-6 h-6 text-[#A1A1AA]" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">{stats?.totalQueries?.toLocaleString() || '0'}</h3>
                        <p className="text-[#52525B] text-sm uppercase tracking-widest font-semibold">{t('dash.stats_queries')}</p>
                    </div>

                    <div className="bg-gradient-to-b from-[#18181B] to-[#09090B] border border-[#ffffff]/10 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg hover:border-[#ffffff]/20 transition-all ring-1 ring-primary/20">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 ring-1 ring-primary/40">
                            <Database className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">{stats?.activeDocs?.toLocaleString() || '0'}</h3>
                        <p className="text-primary/80 text-sm uppercase tracking-widest font-bold">{t('dash.stats_docs')}</p>
                    </div>

                    <div className="bg-[#18181B]/80 backdrop-blur border border-[#ffffff]/10 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg hover:border-[#ffffff]/20 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-[#ffffff]/5 flex items-center justify-center mb-4">
                            <Clock className="w-6 h-6 text-[#A1A1AA]" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">{stats?.hoursSaved?.toLocaleString() || '0'}</h3>
                        <p className="text-[#52525B] text-sm uppercase tracking-widest font-semibold">{t('dash.stats_savings')}</p>
                    </div>
                </div>

                <hr className="w-full border-[#ffffff]/5" />

                {/* System Capabilities */}
                <div className="w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-[#ffffff]/5 border border-[#ffffff]/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <Database className="h-5 w-5 text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white tracking-wide">{t('dash.feature_1_title')}</h3>
                            <p className="text-[#A1A1AA] text-sm leading-relaxed">
                                {t('dash.feature_1_desc')}
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-[#ffffff]/5 border border-[#ffffff]/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <ShieldCheck className="h-5 w-5 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white tracking-wide">{t('dash.feature_2_title')}</h3>
                            <p className="text-[#A1A1AA] text-sm leading-relaxed">
                                {t('dash.feature_2_desc')}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-[#ffffff]/5 border border-[#ffffff]/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <Zap className="h-5 w-5 text-amber-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white tracking-wide">{t('dash.feature_3_title')}</h3>
                            <p className="text-[#A1A1AA] text-sm leading-relaxed">
                                {t('dash.feature_3_desc')}
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
