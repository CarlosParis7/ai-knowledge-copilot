import { useState } from 'react';
import { Cloud, Link as LinkIcon, Globe, Database, Settings2, Plus, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Sources() {
    const [connectingId, setConnectingId] = useState<string | null>(null);

    const integrations = [
        {
            id: 'google-drive',
            name: 'Google Drive',
            description: 'Sync folders, Docs, Sheets, and Slides automatically.',
            icon: <Cloud className="w-8 h-8 text-[#0F9D58]" />, // Approximation of Drive color
            status: 'connected',
            lastSync: '10 mins ago',
            tag: 'Files'
        },
        {
            id: 'notion',
            name: 'Notion',
            description: 'Connect standard Notion databases and nested pages.',
            icon: <Database className="w-8 h-8 text-white" />,
            status: 'disconnected',
            tag: 'Wiki'
        },
        {
            id: 'web-crawler',
            name: 'Web Crawler',
            description: 'Scrape internal URLs, help centers, or public websites.',
            icon: <Globe className="w-8 h-8 text-blue-400" />,
            status: 'disconnected',
            tag: 'Custom'
        },
        {
            id: 'confluence',
            name: 'Confluence',
            description: 'Enterprise wiki sync for Atlassian power users.',
            icon: <LinkIcon className="w-8 h-8 text-[#0052CC]" />,
            status: 'disconnected',
            tag: 'Wiki'
        }
    ];

    const handleConnect = (id: string, name: string) => {
        setConnectingId(id);
        setTimeout(() => {
            setConnectingId(null);
            toast.success(`Demo Mode: Oauth flow for ${name} initiated`, {
                description: "In production, this would open standard OAuth consent."
            });
        }, 1200);
    };

    return (
        <div className="flex-1 w-full flex flex-col items-center bg-[#09090B] px-8 py-12 overflow-y-auto">
            <div className="w-full max-w-5xl space-y-12">
                
                {/* Header Page */}
                <div className="flex items-end justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#ffffff]/5 flex items-center justify-center border border-[#ffffff]/10">
                                <span className="material-symbols-outlined text-[20px] text-primary">cloud_queue</span>
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-white font-headline">Data Sources</h1>
                        </div>
                        <p className="text-[#A1A1AA] text-[15px] pt-1">Connect external platforms to continuously sync institutional knowledge.</p>
                    </div>

                    <button className="bg-[#18181B] border border-[#ffffff]/10 text-white hover:bg-[#ffffff]/10 font-semibold rounded-xl shadow-sm h-11 px-5 flex items-center transition-all">
                        <Settings2 className="mr-2 h-4 w-4 text-[#A1A1AA]" />
                        Manage Syncs
                    </button>
                </div>

                <hr className="border-[#ffffff]/5" />

                {/* Integrations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                    {integrations.map((integration) => (
                        <div key={integration.id} className="group relative bg-[#18181B] border border-[#ffffff]/5 hover:border-[#ffffff]/20 rounded-[20px] p-6 flex flex-col transition-all shadow-sm">
                            
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-[#ffffff]/5 flex items-center justify-center border border-[#ffffff]/5 shadow-inner">
                                    {integration.icon}
                                </div>
                                <span className="text-[11px] font-bold uppercase tracking-widest text-[#52525B] bg-[#ffffff]/5 px-2.5 py-1 rounded-md">
                                    {integration.tag}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <h3 className="text-[17px] font-bold text-white tracking-wide">{integration.name}</h3>
                                    {integration.status === 'connected' && (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    )}
                                </div>
                                <p className="text-sm text-[#A1A1AA] leading-relaxed pr-4">
                                    {integration.description}
                                </p>
                            </div>

                            {/* Actions / Footers */}
                            <div className="mt-8 pt-5 border-t border-[#ffffff]/5 flex items-center justify-between">
                                {integration.status === 'connected' ? (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                            <span className="text-xs font-semibold text-emerald-500 tracking-wide uppercase">Synced</span>
                                            <span className="text-[11px] text-[#52525B] ml-1">• {integration.lastSync}</span>
                                        </div>
                                        <button className="text-xs font-bold text-[#A1A1AA] hover:text-white transition-colors">
                                            Configure
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-xs font-semibold text-[#52525B] tracking-wide uppercase">Not Connected</span>
                                        <button 
                                            onClick={() => handleConnect(integration.id, integration.name)}
                                            disabled={connectingId === integration.id}
                                            className="text-[13px] font-bold text-primary hover:text-white transition-colors flex items-center gap-1 group-hover:translate-x-1 duration-200"
                                        >
                                            {connectingId === integration.id ? 'Connecting...' : 'Connect'} 
                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    <button onClick={() => toast("Requesting custom integration...")} className="group relative bg-[#09090B] border-2 border-dashed border-[#ffffff]/10 hover:border-primary/40 rounded-[20px] p-6 flex flex-col items-center justify-center transition-all min-h-[220px]">
                        <div className="w-12 h-12 rounded-full bg-[#ffffff]/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6 text-[#A1A1AA] group-hover:text-white" />
                        </div>
                        <h3 className="text-[15px] font-bold text-[#A1A1AA] group-hover:text-white transition-colors">Request New Source</h3>
                        <p className="text-xs text-[#52525B] mt-1">API, Database, or SaaS Integration</p>
                    </button>
                </div>

            </div>
        </div>
    );
}
