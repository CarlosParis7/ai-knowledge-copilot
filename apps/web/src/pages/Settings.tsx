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
            toast.success("Company settings saved");
        } catch (err: any) {
            toast.error(err.message || 'Failed to save settings');
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
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-1 text-sm">Manage your company and AI preferences.</p>
            </div>

            <div className="space-y-6">
                <div className="border border-border rounded-xl bg-card overflow-hidden">
                    <div className="px-6 py-5 border-b border-border bg-muted/30">
                        <h3 className="text-lg font-medium leading-6 text-foreground flex items-center">
                            <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                            Company Info
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Update your organization's domain and name settings.
                        </p>
                    </div>
                    <div className="px-6 py-6 space-y-6">
                        <div className="grid grid-cols-3 gap-4 border-b border-border pb-6">
                            <div className="col-span-1 text-sm font-medium text-foreground">Company Name</div>
                            <div className="col-span-2 max-w-md">
                                <Input value={companyName} onChange={e => setCompanyName(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 text-sm font-medium text-foreground">Company ID</div>
                            <div className="col-span-2">
                                <code className="text-xs bg-muted px-2 py-1 rounded">{companyId}</code>
                                <p className="text-xs text-muted-foreground mt-2">This is the tenant identifier for Row Level Security.</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-muted/30 flex justify-end">
                        <Button onClick={handleSaveCompany} disabled={savingCompany}>
                            {savingCompany && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {!savingCompany && <Save className="mr-2 h-4 w-4" />}
                            Save Changes
                        </Button>
                    </div>
                </div>

                <div className="border border-border rounded-xl bg-card overflow-hidden">
                    <div className="px-6 py-5 border-b border-border bg-muted/30">
                        <h3 className="text-lg font-medium leading-6 text-foreground flex items-center">
                            <SettingsIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                            AI Preferences
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Configure models and parameters for document retrieval.
                        </p>
                    </div>
                    <div className="px-6 py-6 space-y-6">
                        <div className="grid grid-cols-3 gap-4 border-b border-border pb-6">
                            <div className="col-span-1">
                                <div className="text-sm font-medium text-foreground">Language Model</div>
                                <div className="text-xs text-muted-foreground mt-1">Select the Claude version to use for chat.</div>
                            </div>
                            <div className="col-span-2 max-w-md">
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                                    <option value="claude-3-haiku">Claude 3 Haiku (Fast)</option>
                                    <option value="claude-3-sonnet">Claude 3.5 Sonnet (Balanced)</option>
                                    <option value="claude-3-opus">Claude 3 Opus (Powerful)</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <div className="text-sm font-medium text-foreground">Top-K Retrieval</div>
                                <div className="text-xs text-muted-foreground mt-1">Number of document chunks to supply to the prompt.</div>
                            </div>
                            <div className="col-span-2 max-w-md flex items-center space-x-4">
                                <Input type="number" defaultValue="5" min="1" max="20" className="w-24" />
                                <span className="text-sm text-muted-foreground">chunks</span>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-muted/30 flex justify-end">
                        <Button onClick={handleSavePreferences} disabled={savingPrefs}>
                            {savingPrefs && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {!savingPrefs && <Save className="mr-2 h-4 w-4" />}
                            Save Preferences
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
