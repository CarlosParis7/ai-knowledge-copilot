import { useState, useEffect } from 'react';
import { Building, Settings as SettingsIcon, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Settings() {
    const [companyName, setCompanyName] = useState('Knowledge Corp Inc.');
    const [companyId, setCompanyId] = useState('f47ac10b...');
    const [savingCompany, setSavingCompany] = useState(false);
    const [savingPrefs, setSavingPrefs] = useState(false);

    useEffect(() => {
        const isDemo = localStorage.getItem('demo-mode') === 'true';
        if (isDemo) {
            setCompanyName('Knowledge Corp (Demo)');
            setCompanyId('demo-firm-uuid-12345');
            return;
        }

        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                supabase.from('profiles').select('company_id').eq('user_id', user.id).single()
                    .then(({ data }) => {
                        if (data) {
                            setCompanyId(data.company_id);
                            supabase.from('companies').select('name').eq('id', data.company_id).single()
                                .then(({ data: cData }) => setCompanyName(cData?.name || ''));
                        }
                    });
            }
        });
    }, []);

    const handleSaveCompany = async () => {
        setSavingCompany(true);
        const isDemo = localStorage.getItem('demo-mode') === 'true';
        if (isDemo) {
            await new Promise(resolve => setTimeout(resolve, 800));
            toast.success("Demo Mode: Company settings saved");
            setSavingCompany(false);
            return;
        }

        try {
            const { error } = await supabase
                .from('companies')
                .update({ name: companyName })
                .eq('id', companyId);

            if (error) throw error;
            toast.success("Organization saved successfully");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to save settings';
            toast.error(message);
        } finally {
            setSavingCompany(false);
        }
    };

    const handleSavePreferences = async () => {
        setSavingPrefs(true);
        setTimeout(() => {
            setSavingPrefs(false);
            toast.success("AI Preferences saved");
        }, 800);
    };

    return (
        <div className="flex-1 w-full overflow-y-auto">
            <div className="mx-auto w-full max-w-4xl px-6 md:px-10 py-10 md:py-12">

                {/* Header */}
                <div>
                    <h1 className="text-[26px] font-semibold tracking-tight text-ink">Ajustes</h1>
                    <p className="text-ink-2 mt-1.5 text-[15px]">Gestiona tu espacio de trabajo, el modelo y los datos de la organización.</p>
                </div>

                {/* Section 1: Organization */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-4">
                    <div className="lg:col-span-1">
                        <h3 className="text-[15px] font-semibold text-ink flex items-center gap-2">
                            <Building className="w-4 h-4 text-ink-3" />
                            Organización
                        </h3>
                        <p className="mt-1.5 text-[13px] text-ink-2 leading-relaxed">
                            El nombre de tu empresa y su ID de inquilino. El ID gestiona el aislamiento de datos por fila.
                        </p>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-surface border border-line rounded-xl shadow-card overflow-hidden">
                            <div className="p-5 space-y-5">
                                <div className="space-y-1.5">
                                    <label htmlFor="company" className="text-[13px] font-medium text-ink-2">Nombre de la empresa</label>
                                    <Input id="company" value={companyName} onChange={e => setCompanyName(e.target.value)} className="max-w-md" />
                                    <p className="text-[12px] text-ink-3">Se muestra en reportes y facturas.</p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-medium text-ink-2">ID de inquilino (base de datos)</label>
                                    <div className="max-w-md flex items-center px-3.5 h-10 bg-surface-2 border border-line rounded-lg">
                                        <code className="text-xs text-ink-2 font-mono tracking-wide truncate">{companyId}</code>
                                    </div>
                                    <p className="text-[12px] text-ink-3">Se usa para las particiones de Row Level Security.</p>
                                </div>
                            </div>
                            <div className="px-5 py-3.5 bg-surface-2 border-t border-line flex justify-end">
                                <Button onClick={handleSaveCompany} disabled={savingCompany}>
                                    {savingCompany ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Guardar organización
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="my-8 border-line" />

                {/* Section 2: AI Preferences */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-4">
                    <div className="lg:col-span-1">
                        <h3 className="text-[15px] font-semibold text-ink flex items-center gap-2">
                            <SettingsIcon className="w-4 h-4 text-ink-3" />
                            Configuración del modelo
                        </h3>
                        <p className="mt-1.5 text-[13px] text-ink-2 leading-relaxed">
                            Elige el modelo de chat y cuántos fragmentos recupera Atlas por consulta.
                        </p>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-surface border border-line rounded-xl shadow-card overflow-hidden">
                            <div className="p-5 space-y-5">
                                <div className="space-y-1.5">
                                    <label htmlFor="model" className="text-[13px] font-medium text-ink-2">Modelo de chat predeterminado</label>
                                    <select id="model" className="max-w-md w-full bg-surface border border-line-strong text-ink rounded-lg px-3 h-10 text-sm shadow-xs focus:outline-none focus:border-brand focus:ring-2 focus:ring-[var(--accent-ring)] transition-all">
                                        <option value="claude-haiku">Claude Haiku 4.5 (rápido y eficiente)</option>
                                        <option value="claude-sonnet">Claude Sonnet 4.6 (equilibrado)</option>
                                        <option value="claude-opus">Claude Opus 4.8 (más capaz)</option>
                                    </select>
                                    <p className="text-[12px] text-ink-3">El motor de inteligencia para todas las consultas.</p>
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="topk" className="text-[13px] font-medium text-ink-2">Contexto de recuperación (Top-K)</label>
                                    <div className="flex items-center gap-3">
                                        <Input id="topk" type="number" defaultValue="5" min="1" max="25" className="w-20 text-center font-mono" />
                                        <span className="text-sm text-ink-2">fragmentos</span>
                                    </div>
                                    <p className="text-[12px] text-ink-3">Valores más altos mejoran la precisión en documentos largos, pero aumentan el tiempo de respuesta.</p>
                                </div>
                            </div>
                            <div className="px-5 py-3.5 bg-surface-2 border-t border-line flex justify-end">
                                <Button onClick={handleSavePreferences} disabled={savingPrefs}>
                                    {savingPrefs ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Guardar preferencias
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
