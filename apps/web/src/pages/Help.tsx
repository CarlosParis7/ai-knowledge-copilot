import { HelpCircle, ShieldCheck, FileUp, MessageSquare, Wrench, ExternalLink, Anchor, Plane, PackageSearch, ClipboardCheck } from 'lucide-react';

export default function Help() {
    return (
        <div className="flex-1 w-full flex flex-col items-center bg-[#09090B] px-8 py-12 overflow-y-auto">
            <div className="w-full max-w-5xl space-y-12 pb-12">
                
                {/* Header Page */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#ffffff]/10 bg-[#ffffff]/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#A1A1AA]">
                            <HelpCircle className="h-3.5 w-3.5 text-primary" />
                            Help & Resources
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white font-headline">Knowledge Base Guide</h1>
                        <p className="text-[#A1A1AA] text-[15px] pt-1 max-w-2xl leading-relaxed">
                            Built for hybrid logistics operations (PO Box, Ocean & Air freight). Standardize SOPs, Customs, DG compliance, surcharges, and SLAs with fully auditable, source-backed AI responses.
                        </p>
                    </div>

                    <a href="https://supabase.com/docs" target="_blank" rel="noreferrer" className="shrink-0 bg-[#18181B] border border-[#ffffff]/10 text-white hover:bg-[#ffffff]/10 font-semibold rounded-xl shadow-sm h-11 px-5 flex items-center transition-all">
                        Technical Docs
                        <ExternalLink className="ml-2 h-4 w-4 text-[#A1A1AA]" />
                    </a>
                </div>

                <hr className="border-[#ffffff]/5" />

                {/* Core Modifiers */}
                <div>
                    <h2 className="text-[13px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-6">Core Workflows</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="rounded-[20px] border border-[#ffffff]/5 hover:border-[#ffffff]/20 bg-[#18181B] p-6 shadow-sm transition-colors group">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="rounded-xl bg-[#ffffff]/5 border border-[#ffffff]/5 p-3 group-hover:bg-primary/20 group-hover:border-primary/30 transition-colors">
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Best Practices</p>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#52525B]">Security & Privacy</p>
                                </div>
                            </div>
                            <ul className="space-y-2.5 text-[13px] text-[#A1A1AA] leading-relaxed">
                                <li>• Segregate tenants via strict RLS policies.</li>
                                <li>• Avoid uploading PII or raw financial credentials.</li>
                                <li>• Always rely on AI citations for formal auditing.</li>
                            </ul>
                        </div>

                        <div className="rounded-[20px] border border-[#ffffff]/5 hover:border-[#ffffff]/20 bg-[#18181B] p-6 shadow-sm transition-colors group">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="rounded-xl bg-[#ffffff]/5 border border-[#ffffff]/5 p-3 group-hover:bg-primary/20 group-hover:border-primary/30 transition-colors">
                                    <FileUp className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Data Ingestion</p>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#52525B]">SOPs & Tariffs</p>
                                </div>
                            </div>
                            <ul className="space-y-2.5 text-[13px] text-[#A1A1AA] leading-relaxed">
                                <li>• Segment files by routing type (Ocean, Air, Domestic).</li>
                                <li>• Wait for 'Indexed' status before querying specific policies.</li>
                                <li>• Maintain atomic documents rather than giant monolithic manuals.</li>
                            </ul>
                        </div>

                        <div className="rounded-[20px] border border-[#ffffff]/5 hover:border-[#ffffff]/20 bg-[#18181B] p-6 shadow-sm transition-colors group">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="rounded-xl bg-[#ffffff]/5 border border-[#ffffff]/5 p-3 group-hover:bg-primary/20 group-hover:border-primary/30 transition-colors">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Advanced Chat</p>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#52525B]">Prompting</p>
                                </div>
                            </div>
                            <ul className="space-y-2.5 text-[13px] text-[#A1A1AA] leading-relaxed">
                                <li>• Declare explicit Incoterms when asking about surcharges.</li>
                                <li>• Append "cite sources" to guarantee auditable outputs.</li>
                                <li>• Request formats like "Return as a checklist".</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Specific Process Modules */}
                <div>
                    <h2 className="text-[13px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-6">Suggested Interactions</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="rounded-[20px] border border-[#ffffff]/5 bg-[#18181B] p-6 shadow-sm relative overflow-hidden">
                            <Anchor className="absolute -bottom-4 -right-4 h-32 w-32 text-white opacity-[0.03] rotate-12" />
                            <div className="flex items-center gap-3 mb-4">
                                <Anchor className="h-5 w-5 text-[#A1A1AA]" />
                                <h2 className="text-base font-bold text-white tracking-wide">Ocean Freight</h2>
                            </div>
                            <ul className="space-y-3 text-[13px] text-[#A1A1AA] leading-relaxed relative z-10">
                                <li>"Extract destination surcharges for LCL CN→PA (CIF)."</li>
                                <li>"Check minimum BL documentation for specialized cargo."</li>
                            </ul>
                        </div>

                        <div className="rounded-[20px] border border-[#ffffff]/5 bg-[#18181B] p-6 shadow-sm relative overflow-hidden">
                            <Plane className="absolute -bottom-4 -right-4 h-32 w-32 text-white opacity-[0.03] -rotate-12" />
                            <div className="flex items-center gap-3 mb-4">
                                <Plane className="h-5 w-5 text-[#A1A1AA]" />
                                <h2 className="text-base font-bold text-white tracking-wide">Air Freight</h2>
                            </div>
                            <ul className="space-y-3 text-[13px] text-[#A1A1AA] leading-relaxed relative z-10">
                                <li>"Draft an AWB checklist for expedited transit SLA."</li>
                                <li>"Verify DGR Class 3 minimum warehouse acceptance requirements."</li>
                            </ul>
                        </div>

                        <div className="rounded-[20px] border border-[#ffffff]/5 bg-[#18181B] p-6 shadow-sm relative overflow-hidden">
                            <PackageSearch className="absolute -bottom-4 -right-4 h-32 w-32 text-white opacity-[0.03]" />
                            <div className="flex items-center gap-3 mb-4">
                                <PackageSearch className="h-5 w-5 text-[#A1A1AA]" />
                                <h2 className="text-base font-bold text-white tracking-wide">PO Box</h2>
                            </div>
                            <ul className="space-y-3 text-[13px] text-[#A1A1AA] leading-relaxed relative z-10">
                                <li>"List our prohibited items based on latest warehouse policy."</li>
                                <li>"Summarize consolidation and weight calculation rules."</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Troubleshooting */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-[20px] border border-[#ffffff]/5 bg-[#18181B] p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                <Wrench className="h-4 w-4 text-red-400" />
                            </div>
                            <h2 className="text-base font-bold text-white">Troubleshooting</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="rounded-xl border border-[#ffffff]/5 bg-[#09090B]/50 p-5">
                                <p className="font-semibold text-white text-[14px]">"Failed to fetch" on Login</p>
                                <p className="mt-1.5 text-[13px] text-[#A1A1AA] leading-relaxed">
                                    Supabase instance might be offline or environment variables are missing. Switch to the built-in Sandbox mode using <span className="text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded">admin@example.com</span>.
                                </p>
                            </div>

                            <div className="rounded-xl border border-[#ffffff]/5 bg-[#09090B]/50 p-5">
                                <p className="font-semibold text-white text-[14px]">Documents stuck in "Processing"</p>
                                <p className="mt-1.5 text-[13px] text-[#A1A1AA] leading-relaxed">
                                    Verify Edge Functions are deployed. In local development, ensure all database migrations and embedding triggers are successfully applied via CLI.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[20px] border border-[#ffffff]/5 bg-[#18181B] p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-[#ffffff]/5 flex items-center justify-center border border-[#ffffff]/10">
                                <ClipboardCheck className="h-4 w-4 text-[#A1A1AA]" />
                            </div>
                            <h2 className="text-base font-bold text-white">Frequently Asked Questions</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="rounded-xl border border-[#ffffff]/5 bg-[#09090B]/50 p-5">
                                <p className="font-semibold text-white text-[14px]">How secure is my data?</p>
                                <p className="mt-1.5 text-[13px] text-[#A1A1AA] leading-relaxed">
                                    Tenant isolation is strictly enforced via PostgreSQL Row Level Security (RLS). Users can only ever fetch documents inherently mapped to their <code className="font-mono text-[11px] text-[#71717A]">company_id</code>.
                                </p>
                            </div>
                            <div className="rounded-xl border border-[#ffffff]/5 bg-[#09090B]/50 p-5">
                                <p className="font-semibold text-white text-[14px]">How can I improve AI source mapping?</p>
                                <p className="mt-1.5 text-[13px] text-[#A1A1AA] leading-relaxed">
                                    Ingest concise, well formatted documents rather than 200-page scanned PDFs. Tables and explicit markdown headings dramatically improve the semantic chunking algorithms.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
