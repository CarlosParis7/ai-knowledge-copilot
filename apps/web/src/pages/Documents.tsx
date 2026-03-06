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
                    { id: '1', title: 'Employee Handbook 2026', status: 'indexed', created_at: new Date().toISOString() },
                    { id: '2', title: 'Corporate Travel Policy', status: 'indexed', created_at: new Date(Date.now() - 86400000).toISOString() },
                    { id: '3', title: 'Financial Q4 Report', status: 'processing', created_at: new Date(Date.now() - 172800000).toISOString() },
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
                    { id: 'c1', chunk_index: 0, content: 'This section details the standard operating procedures for remote work and office attendance. Employees are expected to maintain professional standards regardless of location.' },
                    { id: 'c2', chunk_index: 1, content: 'Annual leave entitlements are calculated based on years of service. All requests must be submitted through the portal at least two weeks in advance.' },
                    { id: 'c3', chunk_index: 2, content: 'Security protocols for company hardware: Multi-factor authentication is mandatory on all devices containing proprietary software or data.' },
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
                // Simulate network delay for demo impact
                await new Promise(resolve => setTimeout(resolve, 1500));

                toast.success("Demo Mode: Document uploaded and indexed successfully");
                // Note: We don't actually update the list here because it's a static mock
                // but the toast and loading state provide the visual feedback
                return;
            }

            // 1. Get signed URL & document ID from Edge Function
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

            // 2. Upload file directly to Storage using signed URL (via PUT)
            await fetch(signed_url, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            });

            // 3. Trigger indexing (Async)
            fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/index-document`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ document_id })
            });

            // Immediately invalidate to show 'uploaded' or 'processing' status
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            toast.success("Document uploaded successfully");

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Upload failed');
        } finally {
            setUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Documents</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage your company's knowledge base.</p>
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
                            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
                            Upload Document
                        </label>
                    </Button>
                </div>
            </div>

            <div className="border border-border/50 rounded-xl bg-card shadow-sm overflow-hidden relative">
                {isLoading ? (
                    <div className="divide-y divide-border/50">
                        <div className="bg-muted/30 h-12 w-full"></div>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex px-6 py-4 items-center">
                                <div className="h-4 w-48 shimmer-bg rounded mr-auto"></div>
                                <div className="h-4 w-24 shimmer-bg rounded mx-8"></div>
                                <div className="h-8 w-16 shimmer-bg rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : documents?.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-sm font-medium text-foreground">No documents</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Upload your first document to get started.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted/50">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground sm:pl-6">Name</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">Status</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">Date added</th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                            {documents?.map((doc) => (
                                <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-foreground sm:pl-6">
                                        <div className="flex items-center">
                                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                            {doc.title}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <div className="flex items-center">
                                            {doc.status === 'indexed' && <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5" />}
                                            {doc.status === 'processing' && <Loader2 className="h-4 w-4 text-blue-500 animate-spin mr-1.5" />}
                                            {doc.status === 'error' && <AlertCircle className="h-4 w-4 text-destructive mr-1.5" />}
                                            {doc.status === 'uploaded' && <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2" />}
                                            <span className="capitalize text-muted-foreground">{doc.status}</span>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                                        {format(new Date(doc.created_at), 'MMM d, yyyy')}
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedDocId(doc.id)}>View Chunks</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Chunk Viewer Slide-over */}
            {selectedDocId && (
                <div className="fixed inset-0 z-[60] overflow-hidden bg-background/80 backdrop-blur-sm flex justify-end transition-all">
                    <div className="w-full max-w-md bg-card border-l border-border h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                            <h3 className="font-semibold flex items-center">
                                <AlignLeft className="h-4 w-4 mr-2" />
                                Document Chunks
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedDocId(null)} className="h-8 w-8 rounded-full">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loadingChunks ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-24 shimmer-bg rounded-lg border border-border/50"></div>
                                    ))}
                                </div>
                            ) : chunks?.length === 0 ? (
                                <div className="text-center text-muted-foreground p-8">No chunks found. Is the document indexed?</div>
                            ) : (
                                chunks?.map(chunk => (
                                    <div key={chunk.id} className="bg-muted/40 border border-border/50 rounded-lg p-3 text-sm">
                                        <div className="text-xs text-muted-foreground mb-2 flex items-center justify-between opacity-70">
                                            <span>Chunk #{chunk.chunk_index + 1}</span>
                                            <span className="font-mono">{chunk.id.substring(0, 8)}</span>
                                        </div>
                                        <p className="text-foreground leading-relaxed whitespace-pre-wrap line-clamp-[10]">{chunk.content}</p>
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
