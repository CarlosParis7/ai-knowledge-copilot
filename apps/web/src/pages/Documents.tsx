import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { FileUp, FileText, Loader2, CheckCircle2, AlertCircle, X, AlignLeft } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Documents() {
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

    const { data: documents, isLoading } = useQuery({
        queryKey: ['documents'],
        queryFn: async () => {
            const isDemo = localStorage.getItem('demo-mode') === 'true';
            if (isDemo) {
                return [
                    { id: '1', title: 'SOP Consolidación LCL (Almacén) - 2026', status: 'indexed', created_at: new Date().toISOString() },
                    { id: '2', title: 'Guía Aduanas - Documentación por país (Resumen interno)', status: 'indexed', created_at: new Date(Date.now() - 86400000).toISOString() },
                    { id: '3', title: 'IATA DGR (Mercancías peligrosas) - Checklist operativo', status: 'processing', created_at: new Date(Date.now() - 172800000).toISOString() },
                ];
            }
            const { data } = await supabase
                .from('documents')
                .select('*')
                .order('created_at', { ascending: false });
            return data || [];
        }
    });

    const { data: chunks, isLoading: loadingChunks } = useQuery({
        queryKey: ['document_chunks', selectedDocId],
        queryFn: async () => {
            if (!selectedDocId) return [];
            const isDemo = localStorage.getItem('demo-mode') === 'true';
            if (isDemo) {
                return [
                    { id: 'c1', chunk_index: 0, content: 'LCL: Verificar peso/volumen, cubicaje y condiciones de empaque. Confirmar cut-off de consolidación y documentación mínima: factura, packing list, instrucciones de embarque.' },
                    { id: 'c2', chunk_index: 1, content: 'Aduanas: validar HS (si aplica), país de origen/destino, restricciones, y requisitos de permisos. No proceder si falta documentación o hay sanciones.' },
                    { id: 'c3', chunk_index: 2, content: 'DG (IATA/IMDG): confirmar clase, UN number, MSDS, empaque homologado y etiquetado. Exigir aprobación antes de aceptación en almacén.' },
                ];
            }
            const { data } = await supabase
                .from('document_chunks')
                .select('id, chunk_index, content')
                .eq('document_id', selectedDocId)
                .order('chunk_index', { ascending: true });
            return data || [];
        },
        enabled: !!selectedDocId
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const isDemo = localStorage.getItem('demo-mode') === 'true';
            if (isDemo) {
                await new Promise(resolve => setTimeout(resolve, 1500));
                toast.success("Demo Mode: Document uploaded and indexed successfully");
                return;
            }

            const { data: session } = await supabase.auth.getSession();
            const token = session.session?.access_token;

            const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filename: file.name,
                    title: file.name.replace(/\.[^/.]+$/, ""),
                    mime: file.type || 'application/octet-stream'
                })
            });

            const { document_id, signed_url } = await res.json();

            await fetch(signed_url, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            });

            fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/index-document`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ document_id })
            });

            queryClient.invalidateQueries({ queryKey: ['documents'] });
            toast.success("Document uploaded successfully");

        } catch (error: unknown) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Upload failed';
            toast.error(message);
        } finally {
            setUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    return (
        <div className="flex-1 w-full flex flex-col items-center bg-[#09090B] px-8 py-12 overflow-y-auto">
            <div className="w-full max-w-5xl space-y-12">
                
                {/* Header Page */}
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white font-headline">Knowledge Base</h1>
                        <p className="text-[#A1A1AA] mt-2 text-[15px]">Upload and manage documents that Atlas uses to generate answers.</p>
                    </div>

                    <div>
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept=".pdf,.txt,.md,.docx"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                        <Button asChild disabled={uploading} className="bg-white text-black hover:bg-[#EBEBEB] font-semibold rounded-lg shadow-sm h-11 px-5">
                            <label htmlFor="file-upload" className="cursor-pointer flex items-center">
                                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-black" /> : <FileUp className="mr-2 h-4 w-4 text-black" />}
                                <span className="text-black">Subir documento</span>
                            </label>
                        </Button>
                    </div>
                </div>

                <hr className="border-[#ffffff]/5" />

                {/* Documents Table */}
                <div className="border border-[#ffffff]/10 rounded-[16px] bg-[#18181B] shadow-sm overflow-hidden relative">
                    {isLoading ? (
                        <div className="divide-y divide-[#ffffff]/5">
                            <div className="bg-[#09090B]/50 h-12 w-full"></div>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex px-6 py-4 items-center">
                                    <div className="h-4 w-48 bg-[#ffffff]/5 animate-pulse rounded mr-auto"></div>
                                    <div className="h-4 w-24 bg-[#ffffff]/5 animate-pulse rounded mx-8"></div>
                                    <div className="h-8 w-16 bg-[#ffffff]/5 animate-pulse rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : documents?.length === 0 ? (
                        <div className="p-16 text-center flex flex-col items-center">
                            <div className="h-16 w-16 rounded-2xl bg-[#ffffff]/5 flex items-center justify-center mb-4">
                                <FileText className="h-8 w-8 text-[#A1A1AA]" />
                            </div>
                            <h3 className="text-lg font-semibold text-white tracking-tight">No documents indexed</h3>
                            <p className="mt-1 text-sm text-[#A1A1AA]">Upload a document to train your Workspace Copilot.</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-[#ffffff]/5">
                            <thead className="bg-[#09090B]/50">
                                <tr>
                                    <th scope="col" className="py-4 pl-6 pr-3 text-left text-[13px] font-bold uppercase tracking-widest text-[#A1A1AA]">Filename</th>
                                    <th scope="col" className="px-3 py-4 text-left text-[13px] font-bold uppercase tracking-widest text-[#A1A1AA]">Status</th>
                                    <th scope="col" className="px-3 py-4 text-left text-[13px] font-bold uppercase tracking-widest text-[#A1A1AA]">Date Added</th>
                                    <th scope="col" className="relative py-4 pl-3 pr-6">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ffffff]/5 bg-[#18181B]">
                                {documents?.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-[#27272A]/50 transition-colors">
                                        <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-white">
                                            <div className="flex items-center">
                                                <FileText className="h-4 w-4 mr-3 text-primary opacity-80" />
                                                {doc.title}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                            <div className="flex items-center font-medium">
                                                {doc.status === 'indexed' && <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />}
                                                {doc.status === 'processing' && <Loader2 className="h-4 w-4 text-blue-400 animate-spin mr-2" />}
                                                {doc.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500 mr-2" />}
                                                {doc.status === 'uploaded' && <div className="h-2 w-2 rounded-full bg-yellow-500 mx-1 mr-3" />}
                                                <span className="capitalize text-[#EBEBEB]">{doc.status}</span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-[#A1A1AA]">
                                            {format(new Date(doc.created_at), 'MMM d, yyyy')}
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedDocId(doc.id)} className="text-primary hover:text-white hover:bg-[#ffffff]/10">
                                                View Chunks
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Chunk Viewer Slide-over */}
            {selectedDocId && (
                <div className="fixed inset-0 z-[60] overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end transition-all">
                    <div className="w-full max-w-md bg-[#18181B] border-l border-[#ffffff]/10 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                        <div className="p-5 border-b border-[#ffffff]/10 flex items-center justify-between bg-[#09090B]">
                            <h3 className="font-semibold text-white flex items-center">
                                <AlignLeft className="h-4 w-4 mr-2 text-primary" />
                                Vector Chunks
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedDocId(null)} className="h-8 w-8 rounded-full text-[#A1A1AA] hover:text-white hover:bg-[#ffffff]/10">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {loadingChunks ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-24 bg-[#ffffff]/5 animate-pulse rounded-xl border border-[#ffffff]/10"></div>
                                    ))}
                                </div>
                            ) : chunks?.length === 0 ? (
                                <div className="text-center text-[#A1A1AA] p-8">No chunks found. Is the document indexed?</div>
                            ) : (
                                chunks?.map(chunk => (
                                    <div key={chunk.id} className="bg-[#27272A]/50 border border-[#ffffff]/5 rounded-xl p-4 text-sm shadow-sm transition-all hover:bg-[#27272A] hover:border-[#ffffff]/10">
                                        <div className="text-xs text-[#A1A1AA] mb-2 flex items-center justify-between font-medium">
                                            <span>Chunk #{chunk.chunk_index + 1}</span>
                                            <span className="font-mono bg-[#ffffff]/5 px-2 py-0.5 rounded text-[10px]">{chunk.id.substring(0, 8)}</span>
                                        </div>
                                        <p className="text-[#EBEBEB] leading-relaxed whitespace-pre-wrap">{chunk.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
