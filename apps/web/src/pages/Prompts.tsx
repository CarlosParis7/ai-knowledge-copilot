import { useState } from 'react';
import { Search, Plus, Copy, MoreHorizontal, MessageSquareText, Layers, Rocket } from 'lucide-react';
import { toast } from 'sonner';

export default function Prompts() {
    const [searchTerm, setSearchTerm] = useState('');

    const templates = [
        {
            id: '1',
            title: 'Redactar respuesta de SLA',
            category: 'Logística',
            icon: <MessageSquareText className="w-[18px] h-[18px] text-brand" />,
            preview: 'Write a formal email to a vendor explaining that they violated the 48-hour SLA for PO-{{PO_NUMBER}}.',
            uses: 124
        },
        {
            id: '2',
            title: 'Extraer recargos LCL',
            category: 'Finanzas',
            icon: <Layers className="w-[18px] h-[18px] text-success" />,
            preview: 'Extract all the destination surcharges (THC, Doc Fee, Release) from the attached maritime tariff and format as a JSON table.',
            uses: 89
        },
        {
            id: '3',
            title: 'Checklist aéreo DG Clase 3',
            category: 'Operaciones',
            icon: <Rocket className="w-[18px] h-[18px] text-warning" />,
            preview: 'Based on our SOPs, list the absolute minimum verification steps required in the warehouse before accepting a UN-{{UN_NUM}} Class 3 liquid shipment.',
            uses: 45
        }
    ];

    const copyPrompt = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("¡Plantilla copiada!", {
            description: "Puedes pegarla directamente en el chat de Atlas."
        });
    };

    return (
        <div className="flex-1 w-full overflow-y-auto">
            <div className="mx-auto w-full max-w-5xl px-6 md:px-10 py-10 md:py-12">

                {/* Header */}
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-[26px] font-semibold tracking-tight text-ink">Plantillas</h1>
                        <p className="text-ink-2 mt-1.5 text-[15px]">Plantillas reutilizables para estandarizar cómo tu equipo consulta a Atlas.</p>
                    </div>
                    <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-medium text-ink-on-accent shadow-xs hover:bg-brand-hover transition-colors">
                        <Plus className="h-4 w-4" />
                        Nueva plantilla
                    </button>
                </div>

                {/* Search */}
                <div className="relative mt-6 w-full max-w-sm group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" />
                    <input
                        type="text"
                        placeholder="Buscar plantillas…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-surface border border-line-strong text-ink text-sm rounded-lg pl-10 pr-4 h-10 shadow-xs outline-none focus:border-brand focus:ring-2 focus:ring-[var(--accent-ring)] transition-all placeholder:text-ink-3"
                    />
                </div>

                {/* Prompts grid */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {templates.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase())).map((template) => (
                        <div key={template.id} className="group flex flex-col rounded-xl border border-line bg-surface shadow-card hover:border-line-strong hover:shadow-pop transition-all overflow-hidden">
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 border border-line">
                                        {template.icon}
                                    </div>
                                    <button className="text-ink-3 hover:text-ink p-1 rounded-md hover:bg-surface-2 transition-colors">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                                <span className="text-[11px] font-medium text-ink-3 mb-1">{template.category}</span>
                                <h3 className="text-[15px] font-medium text-ink mb-1.5">{template.title}</h3>
                                <p className="text-[13px] text-ink-2 leading-relaxed line-clamp-3 flex-1">
                                    {template.preview}
                                </p>
                            </div>
                            <div className="px-4 py-3 bg-surface-2 border-t border-line flex items-center justify-between">
                                <span className="text-[12px] text-ink-3">{template.uses} usos</span>
                                <button
                                    onClick={() => copyPrompt(template.preview)}
                                    className="text-[13px] font-medium text-brand hover:text-brand-hover flex items-center gap-1.5 transition-colors"
                                >
                                    <Copy className="w-3.5 h-3.5" /> Copiar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
