import { useState } from 'react';
import { Search, Plus, Copy, Pencil, Trash2, MessageSquareText, Layers, Rocket, X, Lightbulb } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type Template = {
    id: string;
    title: string;
    category: string;
    iconName: 'message' | 'layers' | 'rocket';
    preview: string;
    uses: number;
};

const ICON_MAP = {
    message: <MessageSquareText className="w-[18px] h-[18px] text-brand" />,
    layers: <Layers className="w-[18px] h-[18px] text-success" />,
    rocket: <Rocket className="w-[18px] h-[18px] text-warning" />,
};

const DEFAULT_TEMPLATES: Template[] = [
    { id: '1', title: 'Redactar respuesta de SLA', category: 'Logística', iconName: 'message', preview: 'Write a formal email to a vendor explaining that they violated the 48-hour SLA for PO-{{PO_NUMBER}}.', uses: 124 },
    { id: '2', title: 'Extraer recargos LCL', category: 'Finanzas', iconName: 'layers', preview: 'Extract all the destination surcharges (THC, Doc Fee, Release) from the attached maritime tariff and format as a JSON table.', uses: 89 },
    { id: '3', title: 'Checklist aéreo DG Clase 3', category: 'Operaciones', iconName: 'rocket', preview: 'Based on our SOPs, list the absolute minimum verification steps required in the warehouse before accepting a UN-{{UN_NUM}} Class 3 liquid shipment.', uses: 45 },
];

function TemplateModal({ template, onSave, onClose }: {
    template: Partial<Template> | null;
    onSave: (t: Template) => void;
    onClose: () => void;
}) {
    const isEdit = !!template?.id;
    const [title, setTitle] = useState(template?.title ?? '');
    const [category, setCategory] = useState(template?.category ?? '');
    const [preview, setPreview] = useState(template?.preview ?? '');

    const handleSave = () => {
        if (!title.trim() || !preview.trim()) { toast.error('El título y el texto son obligatorios.'); return; }
        onSave({
            id: template?.id ?? String(Date.now()),
            title: title.trim(),
            category: category.trim() || 'General',
            iconName: template?.iconName ?? 'message',
            preview: preview.trim(),
            uses: template?.uses ?? 0,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/30 backdrop-blur-[2px]" onClick={onClose}>
            <div className="w-full max-w-lg mx-4 bg-surface rounded-xl border border-line shadow-float" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                    <h3 className="text-[15px] font-semibold text-ink">{isEdit ? 'Editar plantilla' : 'Nueva plantilla'}</h3>
                    <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 hover:bg-surface-3 transition-colors"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-5 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-ink-2">Título</label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Redactar email de SLA" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-ink-2">Categoría</label>
                        <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="Ej: Logística, Finanzas…" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-ink-2">Texto del prompt</label>
                        <textarea
                            value={preview}
                            onChange={e => setPreview(e.target.value)}
                            placeholder="Escribe el prompt. Usa {{VARIABLE}} para placeholders."
                            rows={5}
                            className="w-full bg-surface border border-line-strong text-ink text-[14px] rounded-lg px-3 py-2.5 shadow-xs outline-none focus:border-brand focus:ring-2 focus:ring-[var(--accent-ring)] transition-all placeholder:text-ink-3 resize-none leading-relaxed"
                        />
                    </div>
                </div>
                <div className="px-5 py-3.5 border-t border-line flex justify-end gap-2 bg-surface-2 rounded-b-xl">
                    <button onClick={onClose} className="h-9 px-4 rounded-lg text-[13px] font-medium text-ink-2 hover:bg-surface-3 transition-colors">Cancelar</button>
                    <button onClick={handleSave} className="h-9 px-4 rounded-lg text-[13px] font-medium bg-brand text-ink-on-accent hover:bg-brand-hover transition-colors">Guardar</button>
                </div>
            </div>
        </div>
    );
}

export default function Prompts() {
    const [searchTerm, setSearchTerm] = useState('');
    const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
    const [modalTemplate, setModalTemplate] = useState<Partial<Template> | null | false>(false);

    const filtered = templates.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const copyPrompt = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("¡Plantilla copiada!", { description: "Puedes pegarla directamente en el chat de Atlas." });
    };

    const handleSave = (t: Template) => {
        setTemplates(prev => prev.some(p => p.id === t.id) ? prev.map(p => p.id === t.id ? t : p) : [...prev, t]);
        toast.success(t.uses === 0 ? 'Plantilla creada' : 'Plantilla actualizada');
    };

    const handleDelete = (id: string) => {
        setTemplates(prev => prev.filter(t => t.id !== id));
        toast.success('Plantilla eliminada');
    };

    return (
        <div className="flex-1 w-full overflow-y-auto">
            <div className="mx-auto w-full max-w-5xl px-6 md:px-10 py-10 md:py-12">

                {/* Header */}
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-[26px] font-semibold tracking-tight text-ink">Plantillas</h1>
                        <p className="text-ink-2 mt-1.5 text-[15px]">Prompts reutilizables para estandarizar cómo tu equipo consulta a Atlas.</p>
                    </div>
                    <button
                        onClick={() => setModalTemplate({})}
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-medium text-ink-on-accent shadow-xs hover:bg-brand-hover transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Nueva plantilla
                    </button>
                </div>

                {/* Search */}
                <div className="relative mt-6 w-full max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Buscar por título o categoría…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-surface border border-line-strong text-ink text-sm rounded-lg pl-10 pr-4 h-10 shadow-xs outline-none focus:border-brand focus:ring-2 focus:ring-[var(--accent-ring)] transition-all placeholder:text-ink-3"
                    />
                </div>

                {/* Grid or empty states */}
                {filtered.length === 0 ? (
                    <div className="mt-12 flex flex-col items-center text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-3 mb-4">
                            <Lightbulb className="h-7 w-7 text-ink-3" />
                        </div>
                        {searchTerm ? (
                            <>
                                <h3 className="text-[15px] font-semibold text-ink">Sin resultados</h3>
                                <p className="mt-1 text-sm text-ink-2">No hay plantillas que coincidan con "{searchTerm}".</p>
                                <button onClick={() => setSearchTerm('')} className="mt-3 text-sm text-brand hover:text-brand-hover transition-colors">Limpiar búsqueda</button>
                            </>
                        ) : (
                            <>
                                <h3 className="text-[15px] font-semibold text-ink">Aún no hay plantillas</h3>
                                <p className="mt-1 text-sm text-ink-2 max-w-xs">Crea tu primera plantilla para estandarizar consultas frecuentes.</p>
                                <button onClick={() => setModalTemplate({})} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-medium text-ink-on-accent hover:bg-brand-hover transition-colors">
                                    <Plus className="h-4 w-4" /> Nueva plantilla
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {filtered.map((template) => (
                            <div key={template.id} className="group flex flex-col rounded-xl border border-line bg-surface shadow-card hover:border-line-strong hover:shadow-pop transition-all overflow-hidden">
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 border border-line">
                                            {ICON_MAP[template.iconName]}
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                            <button
                                                onClick={() => setModalTemplate(template)}
                                                aria-label="Editar plantilla"
                                                className="flex h-7 w-7 items-center justify-center rounded-md text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(template.id)}
                                                aria-label="Eliminar plantilla"
                                                className="flex h-7 w-7 items-center justify-center rounded-md text-ink-3 hover:text-danger hover:bg-danger-soft transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-medium text-ink-3 mb-1">{template.category}</span>
                                    <h3 className="text-[15px] font-medium text-ink mb-1.5">{template.title}</h3>
                                    <p className="text-[13px] text-ink-2 leading-relaxed line-clamp-3 flex-1">{template.preview}</p>
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
                )}
            </div>

            {modalTemplate !== false && (
                <TemplateModal
                    template={modalTemplate}
                    onSave={handleSave}
                    onClose={() => setModalTemplate(false)}
                />
            )}
        </div>
    );
}
