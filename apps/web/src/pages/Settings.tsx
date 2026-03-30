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
        <div className="flex-1 w-full flex flex-col items-center bg-[#09090B] px-8 py-12 overflow-y-auto">
            <div className="w-full max-w-5xl space-y-12">
                
                {/* Header Page */}
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white font-headline">Settings</h1>
                    <p className="text-[#A1A1AA] mt-2 text-[15px]">Manage your workspace preferences, models, and organization data.</p>
                </div>

                <hr className="border-[#ffffff]/5" />

                {/* Section 1: Organization */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="col-span-1 space-y-2">
                        <h3 className="text-base font-semibold text-white flex items-center gap-2">
                            <Building className="w-4 h-4 text-[#A1A1AA]" />
                            Organization
                        </h3>
                        <p className="text-sm text-[#A1A1AA] leading-relaxed">
                            Update your company's identifier and display name. Your tenant ID is securely used for all data isolation.
                        </p>
                    </div>

                    <div className="col-span-2">
                        <div className="bg-[#18181B] border border-[#ffffff]/10 rounded-[16px] shadow-sm overflow-hidden">
                            <div className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#EBEBEB]">Company Name</label>
                                    <Input 
                                        value={companyName} 
                                        onChange={e => setCompanyName(e.target.value)} 
                                        className="max-w-md bg-[#09090B] border-[#ffffff]/10 text-white focus-visible:ring-primary/40 focus-visible:border-primary/40 rounded-lg shadow-inner"
                                    />
                                    <p className="text-[13px] text-[#71717A] mt-1.5">This name will be displayed on reports and invoices.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#EBEBEB]">Database Tenant ID</label>
                                    <div className="max-w-md flex items-center justify-between px-4 py-2 bg-[#09090B] border border-[#ffffff]/5 rounded-lg">
                                        <code className="text-xs text-[#A1A1AA] font-mono tracking-wide">{companyId}</code>
                                    </div>
                                    <p className="text-[13px] text-[#71717A] mt-1.5">Unique identifier used for Row Level Security partitions.</p>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-[#09090B]/50 border-t border-[#ffffff]/5 flex justify-end">
                                <Button 
                                    onClick={handleSaveCompany} 
                                    disabled={savingCompany}
                                    className="bg-white text-black hover:bg-[#EBEBEB] font-semibold rounded-lg shadow-sm"
                                >
                                    {savingCompany && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {!savingCompany && <Save className="mr-2 h-4 w-4" />}
                                    Save Organization
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="border-[#ffffff]/5" />

                {/* Section 2: AI Preferences */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                    <div className="col-span-1 space-y-2">
                        <h3 className="text-base font-semibold text-white flex items-center gap-2">
                            <SettingsIcon className="w-4 h-4 text-[#A1A1AA]" />
                            Model Configuration
                        </h3>
                        <p className="text-sm text-[#A1A1AA] leading-relaxed">
                            Fine tune the behavior of the conversational copilot. Select specific LLM models and adjust context chunking limits.
                        </p>
                    </div>

                    <div className="col-span-2">
                        <div className="bg-[#18181B] border border-[#ffffff]/10 rounded-[16px] shadow-sm overflow-hidden">
                            <div className="p-6 space-y-8">
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-[#EBEBEB]">Default Chat Model</label>
                                    <select className="max-w-md w-full bg-[#09090B] border border-[#ffffff]/10 text-white rounded-lg px-3 py-2.5 text-sm shadow-inner focus:outline-none focus:ring-1 focus:ring-primary/40 transition-shadow">
                                        <option value="claude-3-haiku">Claude 3.5 Haiku (Fast & Efficient)</option>
                                        <option value="claude-3-sonnet">Claude 3.5 Sonnet (Balanced default)</option>
                                        <option value="gpt-4o">GPT-4o (Strong analytic)</option>
                                    </select>
                                    <p className="text-[13px] text-[#71717A]">Determines the active intelligence backend for all generic queries.</p>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-[#EBEBEB]">Retrieval Context (Top-K)</label>
                                    <div className="flex items-center space-x-3">
                                        <Input 
                                            type="number" 
                                            defaultValue="5" 
                                            min="1" max="25" 
                                            className="w-20 bg-[#09090B] border-[#ffffff]/10 text-white rounded-lg shadow-inner text-center font-mono focus-visible:ring-primary/40 focus-visible:border-primary/40" 
                                        />
                                        <span className="text-sm font-medium text-[#A1A1AA]">vector chunks</span>
                                    </div>
                                    <p className="text-[13px] text-[#71717A]">Higher counts improve accuracy on long documents but increase TTFT (Time To First Token).</p>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-[#09090B]/50 border-t border-[#ffffff]/5 flex justify-end">
                                <Button 
                                    onClick={handleSavePreferences} 
                                    disabled={savingPrefs}
                                    className="bg-white text-black hover:bg-[#EBEBEB] font-semibold rounded-lg shadow-sm"
                                >
                                    {savingPrefs && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {!savingPrefs && <Save className="mr-2 h-4 w-4" />}
                                    Save Preferences
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
