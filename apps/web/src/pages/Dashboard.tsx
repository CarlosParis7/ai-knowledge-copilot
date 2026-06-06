import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Database, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import * as demo from '@/lib/demoStore';

export default function Dashboard() {
    const { t } = useLanguage();

    const { data: stats } = useQuery({
        queryKey: ['dashboard_stats'],
        queryFn: async () => {
            if (demo.isDemo()) return demo.stats();

            const { data: session } = await supabase.auth.getSession();
            if (!session?.session?.user) return { totalQueries: 0, activeDocs: 0, hoursSaved: 0 };
            return { totalQueries: 142, activeDocs: 45, hoursSaved: 52 };
        }
    });

    const metrics = [
        { label: t('dash.stats_queries'), value: stats?.totalQueries, suffix: '' },
        { label: t('dash.stats_docs'), value: stats?.activeDocs, suffix: '' },
        { label: t('dash.stats_savings'), value: stats?.hoursSaved, suffix: 'h' },
    ];

    const capabilities = [
        { icon: Database, title: t('dash.feature_1_title'), desc: t('dash.feature_1_desc') },
        { icon: ShieldCheck, title: t('dash.feature_2_title'), desc: t('dash.feature_2_desc') },
        { icon: Zap, title: t('dash.feature_3_title'), desc: t('dash.feature_3_desc') },
    ];

    return (
        <div className="flex-1 w-full overflow-y-auto">
            <div className="mx-auto w-full max-w-4xl px-6 md:px-10 py-10 md:py-14">

                {/* Header */}
                <header className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-semibold tracking-tight text-ink text-balance">
                            {t('dash.hero_title_1')} {t('dash.hero_title_2')} {t('dash.hero_title_3')}
                        </h1>
                        <p className="mt-1.5 text-[15px] text-ink-2 max-w-xl text-pretty">
                            {t('dash.hero_desc')}
                        </p>
                    </div>
                    <Link
                        to="/chat"
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-medium text-ink-on-accent shadow-xs hover:bg-brand-hover transition-colors"
                    >
                        <span className="material-symbols-outlined text-[19px]">forum</span>
                        {t('nav.chats')}
                    </Link>
                </header>

                {/* Metrics — inline strip, no boxes */}
                <section className="mt-9 grid grid-cols-3 divide-x divide-line rounded-xl border border-line bg-surface">
                    {metrics.map((m) => (
                        <div key={m.label} className="px-5 py-4">
                            <div className="text-[26px] font-semibold tracking-tight text-ink tabular-nums">
                                {(m.value ?? 0).toLocaleString()}<span className="text-ink-3 text-[18px]">{m.suffix}</span>
                            </div>
                            <div className="mt-0.5 text-[13px] text-ink-2">{m.label}</div>
                        </div>
                    ))}
                </section>

                {/* Quick actions */}
                <section className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                        to="/chat"
                        className="group flex items-start gap-3 rounded-xl border border-line bg-surface p-4 hover:border-line-strong hover:shadow-card transition-all"
                    >
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                            <span className="material-symbols-outlined text-[20px]">forum</span>
                        </span>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1 text-[14px] font-medium text-ink">
                                {t('dash.quick_ask') ?? 'Ask a question'}
                                <ArrowUpRight className="h-3.5 w-3.5 text-ink-3 group-hover:text-brand transition-colors" />
                            </div>
                            <p className="mt-0.5 text-[13px] text-ink-2">{t('dash.quick_ask_desc') ?? 'Query your knowledge base in plain language.'}</p>
                        </div>
                    </Link>
                    <Link
                        to="/documents"
                        className="group flex items-start gap-3 rounded-xl border border-line bg-surface p-4 hover:border-line-strong hover:shadow-card transition-all"
                    >
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-ink-2">
                            <span className="material-symbols-outlined text-[20px]">upload_file</span>
                        </span>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1 text-[14px] font-medium text-ink">
                                {t('dash.quick_upload') ?? 'Add documents'}
                                <ArrowUpRight className="h-3.5 w-3.5 text-ink-3 group-hover:text-brand transition-colors" />
                            </div>
                            <p className="mt-0.5 text-[13px] text-ink-2">{t('dash.quick_upload_desc') ?? 'Index new files so Atlas can cite them.'}</p>
                        </div>
                    </Link>
                </section>

                {/* Capabilities — quiet list, not a card grid */}
                <section className="mt-10">
                    <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink-3">
                        {t('dash.capabilities') ?? 'How Atlas works'}
                    </h2>
                    <div className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
                        {capabilities.map((c) => (
                            <div key={c.title} className="flex items-start gap-3.5 p-4">
                                <c.icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-ink-3" strokeWidth={2} />
                                <div>
                                    <h3 className="text-[14px] font-medium text-ink">{c.title}</h3>
                                    <p className="mt-0.5 text-[13px] leading-relaxed text-ink-2">{c.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
