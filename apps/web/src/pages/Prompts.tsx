import { useState } from 'react';
import { Lightbulb, Search, Plus, Copy, MoreHorizontal, MessageSquareText, Layers, Rocket } from 'lucide-react';
import { toast } from 'sonner';

export default function Prompts() {
    const [searchTerm, setSearchTerm] = useState('');

    const templates = [
        {
            id: '1',
            title: 'Draft SLA Response',
            category: 'Logistics',
            icon: <MessageSquareText className="w-5 h-5 text-blue-400" />,
            preview: 'Write a formal email to a vendor explaining that they violated the 48-hour SLA for PO-{{PO_NUMBER}}.',
            uses: 124
        },
        {
            id: '2',
            title: 'Extract LCL Surcharges',
            category: 'Finance',
            icon: <Layers className="w-5 h-5 text-emerald-400" />,
            preview: 'Extract all the destination surcharges (THC, Doc Fee, Release) from the attached maritime tariff and format as a JSON table.',
            uses: 89
        },
        {
            id: '3',
            title: 'DG Class 3 Air Checklist',
            category: 'Operations',
            icon: <Rocket className="w-5 h-5 text-orange-400" />,
            preview: 'Based on our SOPs, list the absolute minimum verification steps required in the warehouse before accepting a UN-{{UN_NUM}} Class 3 liquid shipment.',
            uses: 45
        }
    ];

    const copyPrompt = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Prompt copied to clipboard!", {
            description: "You can paste it directly into Atlas Chat."
        });
    };

    return (
        <div className="flex-1 w-full flex flex-col items-center bg-[#09090B] px-8 py-12 overflow-y-auto">
            <div className="w-full max-w-5xl space-y-12">
                
                {/* Header Page */}
                <div className="flex items-end justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#ffffff]/5 flex items-center justify-center border border-[#ffffff]/10">
                                <Lightbulb className="w-5 h-5 text-amber-400" />
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-white font-headline">Prompt Library</h1>
                        </div>
                        <p className="text-[#A1A1AA] text-[15px] pt-1">Standardize AI interactions across your team with reproducible templates.</p>
                    </div>

                    <button className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-sm h-11 px-5 flex items-center transition-all shadow-primary/20">
                        <Plus className="mr-2 h-4 w-4" />
                        New Template
                    </button>
                </div>

                <hr className="border-[#ffffff]/5" />

                {/* Filters Row */}
                <div className="flex items-center justify-between">
                    <div className="relative w-full max-w-sm group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A] group-focus-within:text-white transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search prompts..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-[#18181B] border border-[#ffffff]/10 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-[#52525B]"
                        />
                    </div>
                </div>

                {/* Prompts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
                    {templates.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase())).map((template) => (
                        <div key={template.id} className="group relative bg-[#18181B] border border-[#ffffff]/5 hover:border-[#ffffff]/20 rounded-[20px] flex flex-col transition-all shadow-sm overflow-hidden">
                            
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#09090B] flex items-center justify-center border border-[#ffffff]/5">
                                        {template.icon}
                                    </div>
                                    <button className="text-[#A1A1AA] hover:text-white p-1 rounded-md hover:bg-[#ffffff]/10 transition-colors">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#52525B] mb-1.5">{template.category}</span>
                                <h3 className="text-base font-bold text-white tracking-wide mb-2">{template.title}</h3>
                                
                                <p className="text-sm text-[#A1A1AA] leading-relaxed line-clamp-3 mb-6 flex-1">
                                    "{template.preview}"
                                </p>
                            </div>

                            <div className="px-5 py-3.5 bg-[#09090B]/40 border-t border-[#ffffff]/5 flex items-center justify-between group-hover:bg-[#09090B]/60 transition-colors">
                                <span className="text-[11px] font-medium text-[#71717A]">{template.uses} uses</span>
                                <button 
                                    onClick={() => copyPrompt(template.preview)}
                                    className="text-xs font-bold text-primary hover:text-white flex items-center gap-1.5 transition-colors"
                                >
                                    <Copy className="w-3.5 h-3.5" /> Copy Prompt
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
