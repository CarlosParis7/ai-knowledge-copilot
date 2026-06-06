import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { FileUp, FileText, Loader2, CheckCircle2, AlertCircle, X, AlignLeft, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import * as demo from '@/lib/demoStore';

export default function Documents() {
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

    const { data: documents, isLoading } = useQuery({
        queryKey: ['documents'],
        queryFn: async () => {
            if (demo.isDemo()) return demo.listDocs();
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
            if (demo.isDemo()) return demo.getChunks(selectedDocId);
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
            if (demo.isDemo()) {
                const title = file.name.replace(/\.[^/.]+$/, '');
                const doc = demo.addDoc(title);
                queryClient.invalidateQueries({ queryKey: ['documents'] });
                toast.success(`"${file.name}" subido. Indexando…`);
                // Simulate the indexing pipeline finishing.
                setTimeout(() => {
                    demo.markIndexed(doc.id);
                    queryClient.invalidateQueries({ queryKey: ['documents'] });
                    queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
                    toast.success(`"${title}" indexado y listo para consultar`);
                }, 1800);
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

    const handleDeleteDoc = (id: string, title: string) => {
        if (!window.confirm(`¿Eliminar "${title}"? No se puede deshacer.`)) return;
        if (demo.isDemo()) {
            demo.removeDoc(id);
            if (selectedDocId === id) setSelectedDocId(null);
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
            toast.success('Documento eliminado');
            return;
        }
        supabase.from('documents').delete().eq('id', id).then(({ error }) => {
            if (error) { toast.error(error.message); return; }
            if (selectedDocId === id) setSelectedDocId(null);
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            toast.success('Documento eliminado');
        });
    };

    const statusStyles: Record<string, string> = {
        indexed: 'bg-success-soft text-success',
        processing: 'bg-brand-soft text-brand',
        error: 'bg-danger-soft text-danger',
        uploaded: 'bg-warning-soft text-warning',
    };

    return (
        <div className="flex-1 w-full overflow-y-auto">
            <div className="mx-auto w-full max-w-5xl px-6 md:px-10 py-10 md:py-12">

                {/* Header Page */}
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-[26px] font-semibold tracking-tight text-ink">Base de conocimiento</h1>
                        <p className="text-ink-2 mt-1.5 text-[15px]">Sube y gestiona los documentos que Atlas cita en sus respuestas.</p>
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
                        <Button asChild disabled={uploading}>
                            <label htmlFor="file-upload" className="cursor-pointer">
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                                Subir documento
                            </label>
                        </Button>
                    </div>
                </div>

                {/* Documents Table */}
                <div className="mt-8 border border-line rounded-xl bg-surface shadow-card overflow-hidden">
                    {isLoading ? (
                        <div className="divide-y divide-line">
                            <div className="bg-surface-2 h-11 w-full" />
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex px-5 py-3.5 items-center gap-4">
                                    <div className="h-4 w-48 shimmer-bg rounded mr-auto" />
                                    <div className="h-4 w-24 shimmer-bg rounded" />
                                    <div className="h-4 w-16 shimmer-bg rounded" />
                                </div>
                            ))}
                        </div>
                    ) : documents?.length === 0 ? (
                        <div className="p-16 text-center flex flex-col items-center">
                            <div className="h-14 w-14 rounded-2xl bg-surface-3 flex items-center justify-center mb-4">
                                <FileText className="h-7 w-7 text-ink-3" />
                            </div>
                            <h3 className="text-[15px] font-semibold text-ink tracking-tight">Aún no hay documentos</h3>
                            <p className="mt-1 text-sm text-ink-2 max-w-xs">Sube un archivo PDF, DOCX, TXT o MD y Atlas lo indexará para poder citarlo.</p>
                        </div>
                    ) : (
                        <table className="min-w-full">
                            <thead className="bg-surface-2 border-b border-line">
                                <tr>
                                    <th scope="col" className="py-3 pl-5 pr-3 text-left text-[12px] font-semibold text-ink-2">Archivo</th>
                                    <th scope="col" className="px-3 py-3 text-left text-[12px] font-semibold text-ink-2">Estado</th>
                                    <th scope="col" className="px-3 py-3 text-left text-[12px] font-semibold text-ink-2">Fecha</th>
                                    <th scope="col" className="relative py-3 pl-3 pr-5"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {documents?.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-surface-2 transition-colors">
                                        <td className="py-3.5 pl-5 pr-3 text-sm font-medium text-ink">
                                            <div className="flex items-center gap-2.5">
                                                <FileText className="h-4 w-4 text-ink-3 shrink-0" />
                                                <span className="truncate max-w-md">{doc.title}</span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3.5 text-sm">
                                            <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[12px] font-medium capitalize ${statusStyles[doc.status] ?? 'bg-surface-3 text-ink-2'}`}>
                                                {doc.status === 'indexed' && <CheckCircle2 className="h-3.5 w-3.5" />}
                                                {doc.status === 'processing' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                                {doc.status === 'error' && <AlertCircle className="h-3.5 w-3.5" />}
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3.5 text-sm text-ink-2">
                                            {format(new Date(doc.created_at), 'MMM d, yyyy')}
                                        </td>
                                        <td className="relative whitespace-nowrap py-3.5 pl-3 pr-5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedDocId(doc.id)} className="text-brand hover:text-brand-hover">
                                                    Ver fragmentos
                                                </Button>
                                                <button
                                                    onClick={() => handleDeleteDoc(doc.id, doc.title)}
                                                    aria-label={`Eliminar ${doc.title}`}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 hover:text-danger hover:bg-danger-soft transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
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
                <div className="fixed inset-0 z-50 overflow-hidden bg-ink/20 flex justify-end" onClick={() => setSelectedDocId(null)}>
                    <div
                        className="w-full max-w-md bg-surface border-l border-line h-full flex flex-col shadow-float animate-in slide-in-from-right duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-5 h-14 border-b border-line flex items-center justify-between bg-surface-2 shrink-0">
                            <h3 className="font-semibold text-[15px] text-ink flex items-center gap-2">
                                <AlignLeft className="h-4 w-4 text-ink-3" />
                                Fragmentos vectoriales
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedDocId(null)} className="h-8 w-8 rounded-lg">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {loadingChunks ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-24 shimmer-bg rounded-lg border border-line" />
                                    ))}
                                </div>
                            ) : chunks?.length === 0 ? (
                                <div className="text-center text-ink-2 text-sm p-8">No se encontraron fragmentos. ¿El documento está indexado?</div>
                            ) : (
                                chunks?.map(chunk => (
                                    <div key={chunk.id} className="bg-surface-2 border border-line rounded-lg p-3.5 text-sm">
                                        <div className="text-xs text-ink-2 mb-2 flex items-center justify-between font-medium">
                                            <span>Chunk #{chunk.chunk_index + 1}</span>
                                            <span className="font-mono bg-surface-3 px-1.5 py-0.5 rounded text-[10px] text-ink-3">{chunk.id.substring(0, 8)}</span>
                                        </div>
                                        <p className="text-ink leading-relaxed whitespace-pre-wrap">{chunk.content}</p>
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
