import { useState } from 'react';
import { Cloud, Link as LinkIcon, Globe, Database, Settings2, Plus, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Sources() {
    const [connectingId, setConnectingId] = useState<string | null>(null);

    const integrations = [
        {
            id: 'google-drive',
            name: 'Google Drive',
            description: 'Sincroniza carpetas, Docs, Sheets y Slides automáticamente.',
            icon: <Cloud className="w-5 h-5 text-[#0F9D58]" />,
            status: 'connected',
            lastSync: '10 mins ago',
            tag: 'Files',
        },
        {
            id: 'notion',
            name: 'Notion',
            description: 'Conecta bases de datos de Notion y páginas anidadas.',
            icon: <Database className="w-5 h-5 text-ink" />,
            status: 'disconnected',
            tag: 'Wiki',
        },
        {
            id: 'web-crawler',
            name: 'Web Crawler',
            description: 'Rastrea URLs internas, centros de ayuda o sitios públicos.',
            icon: <Globe className="w-5 h-5 text-brand" />,
            status: 'disconnected',
            tag: 'Custom',
        },
        {
            id: 'confluence',
            name: 'Confluence',
            description: 'Sincronización de wiki empresarial para usuarios de Atlassian.',
            icon: <LinkIcon className="w-5 h-5 text-[#0052CC]" />,
            status: 'disconnected',
            tag: 'Wiki',
        },
    ];

    const handleConnect = (id: string, name: string) => {
        setConnectingId(id);
        setTimeout(() => {
            setConnectingId(null);
            toast.success(`Demo Mode: Oauth flow for ${name} initiated`, {
                description: 'In production, this would open standard OAuth consent.',
            });
        }, 1200);
    };

    return (
        <div className="flex-1 w-full overflow-y-auto">
            <div className="mx-auto w-full max-w-3xl px-6 md:px-10 py-10 md:py-12">

                {/* Header */}
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-[26px] font-semibold tracking-tight text-ink">Integraciones</h1>
                        <p className="text-ink-2 mt-1.5 text-[15px]">Conecta plataformas externas para mantener tu base de conocimiento sincronizada.</p>
                    </div>
                    <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-line-strong bg-surface px-4 text-sm font-medium text-ink shadow-xs hover:bg-surface-2 transition-colors">
                        <Settings2 className="h-4 w-4 text-ink-3" />
                        Gestionar
                    </button>
                </div>

                {/* Integration list */}
                <div className="mt-8 divide-y divide-line rounded-xl border border-line bg-surface shadow-card overflow-hidden">
                    {integrations.map((integration) => (
                        <div key={integration.id} className="flex items-center gap-4 p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 border border-line">
                                {integration.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[15px] font-medium text-ink">{integration.name}</h3>
                                    <span className="rounded bg-surface-3 px-1.5 py-0.5 text-[11px] font-medium text-ink-2">{integration.tag}</span>
                                    {integration.status === 'connected' && (
                                        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-success">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Sincronizado · {integration.lastSync}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-0.5 text-[13px] text-ink-2 truncate">{integration.description}</p>
                            </div>
                            {integration.status === 'connected' ? (
                                <button className="shrink-0 text-[13px] font-medium text-ink-2 hover:text-ink transition-colors">Configurar</button>
                            ) : (
                                <button
                                    onClick={() => handleConnect(integration.id, integration.name)}
                                    disabled={connectingId === integration.id}
                                    className="shrink-0 inline-flex items-center gap-1 text-[13px] font-medium text-brand hover:text-brand-hover transition-colors disabled:opacity-60"
                                >
                                    {connectingId === integration.id ? 'Conectando…' : 'Conectar'}
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => toast('Requesting custom integration…')}
                    className="mt-3 group flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-surface px-4 py-4 text-[14px] font-medium text-ink-2 hover:border-brand hover:text-brand transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Solicitar una nueva fuente
                </button>
            </div>
        </div>
    );
}
