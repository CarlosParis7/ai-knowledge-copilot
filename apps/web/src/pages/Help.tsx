import { ShieldCheck, FileUp, MessageSquare, Wrench, ExternalLink, Anchor, Plane, PackageSearch, ClipboardCheck } from 'lucide-react';

export default function Help() {
    const workflows = [
        {
            icon: ShieldCheck,
            title: 'Buenas prácticas',
            sub: 'Seguridad y privacidad',
            items: [
                'Separa los inquilinos con políticas RLS estrictas.',
                'Evita subir datos personales o credenciales financieras.',
                'Apóyate en las citas de la IA para auditorías formales.',
            ],
        },
        {
            icon: FileUp,
            title: 'Ingesta de datos',
            sub: 'SOPs y tarifas',
            items: [
                'Segmenta los archivos por tipo de ruta (marítimo, aéreo, local).',
                "Espera el estado 'Indexado' antes de consultar políticas.",
                'Mantén documentos atómicos, no manuales monolíticos.',
            ],
        },
        {
            icon: MessageSquare,
            title: 'Chat avanzado',
            sub: 'Prompts',
            items: [
                'Declara los Incoterms al preguntar por recargos.',
                'Añade "cita las fuentes" para resultados auditables.',
                'Pide formatos como "Devuélvelo como checklist".',
            ],
        },
    ];

    const interactions = [
        { icon: Anchor, title: 'Carga marítima', items: ['"Extrae recargos de destino para LCL CN→PA (CIF)."', '"Revisa la documentación mínima de BL para carga especializada."'] },
        { icon: Plane, title: 'Carga aérea', items: ['"Redacta un checklist de AWB para tránsito SLA expedito."', '"Verifica los requisitos de aceptación en almacén para DGR Clase 3."'] },
        { icon: PackageSearch, title: 'PO Box', items: ['"Lista los artículos prohibidos según la política de almacén vigente."', '"Resume las reglas de consolidación y cálculo de peso."'] },
    ];

    return (
        <div className="flex-1 w-full overflow-y-auto">
            <div className="mx-auto w-full max-w-4xl px-6 md:px-10 py-10 md:py-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-[26px] font-semibold tracking-tight text-ink">Guía</h1>
                        <p className="text-ink-2 mt-1.5 text-[15px] max-w-2xl leading-relaxed">
                            Diseñado para operaciones logísticas híbridas (PO Box, carga marítima y aérea). Estandariza SOPs, aduanas, cumplimiento DG, recargos y SLAs con respuestas respaldadas por fuentes.
                        </p>
                    </div>
                    <a href="https://supabase.com/docs" target="_blank" rel="noreferrer" className="shrink-0 inline-flex h-10 items-center gap-2 rounded-lg border border-line-strong bg-surface px-4 text-sm font-medium text-ink shadow-xs hover:bg-surface-2 transition-colors">
                        Documentación técnica
                        <ExternalLink className="h-4 w-4 text-ink-3" />
                    </a>
                </div>

                {/* Core workflows */}
                <h2 className="mt-10 text-[13px] font-semibold uppercase tracking-wide text-ink-3">Flujos principales</h2>
                <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
                    {workflows.map((w) => (
                        <div key={w.title} className="rounded-xl border border-line bg-surface p-5 shadow-card">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft">
                                    <w.icon className="h-[18px] w-[18px] text-brand" />
                                </div>
                                <div>
                                    <p className="text-[14px] font-medium text-ink">{w.title}</p>
                                    <p className="text-[12px] text-ink-3">{w.sub}</p>
                                </div>
                            </div>
                            <ul className="space-y-2 text-[13px] text-ink-2 leading-relaxed">
                                {w.items.map((it) => <li key={it} className="flex gap-2"><span className="text-ink-3">·</span>{it}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Suggested interactions */}
                <h2 className="mt-10 text-[13px] font-semibold uppercase tracking-wide text-ink-3">Interacciones sugeridas</h2>
                <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
                    {interactions.map((s) => (
                        <div key={s.title} className="rounded-xl border border-line bg-surface p-5 shadow-card">
                            <div className="flex items-center gap-2.5 mb-3">
                                <s.icon className="h-[18px] w-[18px] text-ink-3" />
                                <h3 className="text-[14px] font-medium text-ink">{s.title}</h3>
                            </div>
                            <ul className="space-y-2.5 text-[13px] text-ink-2 leading-relaxed">
                                {s.items.map((it) => <li key={it}>{it}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Troubleshooting & FAQ */}
                <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-danger-soft">
                                <Wrench className="h-4 w-4 text-danger" />
                            </div>
                            <h2 className="text-[15px] font-semibold text-ink">Solución de problemas</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="rounded-lg border border-line bg-surface-2 p-4">
                                <p className="font-medium text-ink text-[14px]">"Failed to fetch" al iniciar sesión</p>
                                <p className="mt-1 text-[13px] text-ink-2 leading-relaxed">
                                    Supabase puede estar apagado o faltan variables de entorno. Usa el modo Sandbox con <span className="font-mono text-[12px] text-brand bg-brand-soft px-1.5 py-0.5 rounded">admin@example.com</span>.
                                </p>
                            </div>
                            <div className="rounded-lg border border-line bg-surface-2 p-4">
                                <p className="font-medium text-ink text-[14px]">Documentos atascados en "Processing"</p>
                                <p className="mt-1 text-[13px] text-ink-2 leading-relaxed">
                                    Verifica que las Edge Functions estén desplegadas y las migraciones aplicadas con la CLI de Supabase.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-3">
                                <ClipboardCheck className="h-4 w-4 text-ink-2" />
                            </div>
                            <h2 className="text-[15px] font-semibold text-ink">Preguntas frecuentes</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="rounded-lg border border-line bg-surface-2 p-4">
                                <p className="font-medium text-ink text-[14px]">¿Qué tan seguros están mis datos?</p>
                                <p className="mt-1 text-[13px] text-ink-2 leading-relaxed">
                                    El aislamiento por inquilino se aplica con Row Level Security de PostgreSQL. Cada usuario solo accede a los documentos de su <code className="font-mono text-[12px] text-ink-2">company_id</code>.
                                </p>
                            </div>
                            <div className="rounded-lg border border-line bg-surface-2 p-4">
                                <p className="font-medium text-ink text-[14px]">¿Cómo mejoro el mapeo de fuentes?</p>
                                <p className="mt-1 text-[13px] text-ink-2 leading-relaxed">
                                    Sube documentos concisos y bien formateados. Las tablas y los encabezados markdown mejoran el chunking semántico.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
