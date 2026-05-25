"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Send, Loader2, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import TiptapEditor from "@/components/ui/tiptap-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { reportsApi } from "@/services/reportsApi.mjs";
import Sidebar from "@/components/Sidebar";
import { toast } from "@/hooks/use-toast";

export default function EditarLaudoPage() {
    const router = useRouter();
    const params = useParams();
    const patientId = params.id as string;
    const laudoId = params.laudoId as string;

    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
    const autoSaveTimer = useRef<NodeJS.Timeout>();

    const isDelivered = formData.status === "completed";

    useEffect(() => {
        if (!laudoId) { setLoading(false); return; }
        reportsApi.getReportById(laudoId)
            .then((data: any) => {
                const reportData = Array.isArray(data) ? data[0] : data;
                if (reportData) {
                    setFormData({
                        ...reportData,
                        due_at: reportData.due_at ? new Date(reportData.due_at) : null,
                    });
                }
            })
            .catch(() => {
                toast({ title: "Erro ao carregar laudo", variant: "destructive" });
            })
            .finally(() => setLoading(false));
    }, [laudoId]);

    const triggerAutoSave = useCallback((patch: object) => {
        clearTimeout(autoSaveTimer.current);
        setAutoSaveStatus("saving");
        autoSaveTimer.current = setTimeout(async () => {
            try {
                await reportsApi.updateReport(laudoId, {
                    patient_id: formData.patient_id,
                    ...patch,
                });
                setAutoSaveStatus("saved");
                setTimeout(() => setAutoSaveStatus("idle"), 2000);
            } catch {
                setAutoSaveStatus("idle");
                toast({ title: "Erro no salvamento automático", variant: "destructive" });
            }
        }, 2000);
    }, [laudoId, formData.patient_id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [id]: value }));
        triggerAutoSave({ [id]: value });
    };

    const handleSelectChange = (id: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [id]: value }));
        triggerAutoSave({ [id]: value });
    };

    const handleCheckboxChange = (id: string, checked: boolean) => {
        setFormData((prev: any) => ({ ...prev, [id]: checked }));
        triggerAutoSave({ [id]: checked });
    };

    const handleDateChange = (date: Date | undefined) => {
        if (!date) return;
        setFormData((prev: any) => ({ ...prev, due_at: date }));
        triggerAutoSave({ due_at: date.toISOString() });
    };

    const handleEditorChange = (html: string, json: object) => {
        setFormData((prev: any) => ({ ...prev, content_html: html, content_json: json }));
        triggerAutoSave({ content_html: html, content_json: json });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearTimeout(autoSaveTimer.current);
        setIsSubmitting(true);
        try {
            const { id, patient_id, created_at, updated_at, created_by, updated_by, ...updateData } = formData;
            await reportsApi.updateReport(laudoId, {
                ...updateData,
                due_at: formData.due_at instanceof Date ? formData.due_at.toISOString() : formData.due_at,
            });
            toast({ title: "Laudo salvo com sucesso!" });
            router.push(`/doctor/medicos/${patientId}/laudos`);
        } catch {
            toast({ title: "Erro ao salvar laudo", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendToPatient = async () => {
        clearTimeout(autoSaveTimer.current);
        setIsSending(true);
        try {
            await reportsApi.sendToPatient(laudoId, formData.patient_id);
            setFormData((prev: any) => ({ ...prev, status: "entregue" }));
            toast({ title: "Laudo enviado ao paciente com sucesso!" });
        } catch {
            toast({ title: "Erro ao enviar laudo", variant: "destructive" });
        } finally {
            setIsSending(false);
        }
    };

    const statusBadge = {
        draft: <Badge variant="secondary">Rascunho</Badge>,
        completed: <Badge className="bg-green-600 text-white">Entregue</Badge>,
    }[formData.status as string] ?? null;

    if (loading) {
        return (
            <Sidebar>
                <div className="container mx-auto p-4">
                    <Card>
                        <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-1/6" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2"><Skeleton className="h-4 w-1/6" /><Skeleton className="h-24 w-full" /></div>
                            <div className="space-y-2"><Skeleton className="h-4 w-1/6" /><Skeleton className="h-40 w-full" /></div>
                            <div className="flex justify-end space-x-2">
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-24" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Sidebar>
        );
    }

    return (
        <Sidebar>
            <div className="container mx-auto p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CardTitle>Laudo — {formData.order_number}</CardTitle>
                            {statusBadge}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {autoSaveStatus === "saving" && (
                                <><Loader2 className="h-3 w-3 animate-spin" /> Salvando...</>
                            )}
                            {autoSaveStatus === "saved" && (
                                <><CheckCircle className="h-3 w-3 text-green-500" /> Salvo</>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="exam">Exame</Label>
                                    <Input id="exam" value={formData.exam || ''} onChange={handleInputChange} disabled={isDelivered} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="diagnosis">Diagnóstico</Label>
                                    <Input id="diagnosis" value={formData.diagnosis || ''} onChange={handleInputChange} disabled={isDelivered} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cid_code">Código CID</Label>
                                    <Input id="cid_code" value={formData.cid_code || ''} onChange={handleInputChange} disabled={isDelivered} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="requested_by">Solicitado Por</Label>
                                    <Input id="requested_by" value={formData.requested_by || ''} onChange={handleInputChange} disabled={isDelivered} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        onValueChange={(value) => handleSelectChange("status", value)}
                                        value={formData.status}
                                        disabled={isDelivered}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Rascunho</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Data de Vencimento</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={isDelivered}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.due_at ? format(new Date(formData.due_at), "dd/MM/yyyy") : <span>Escolha uma data</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={formData.due_at ? new Date(formData.due_at) : undefined}
                                                onSelect={handleDateChange}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="conclusion">Conclusão</Label>
                                <Textarea id="conclusion" value={formData.conclusion || ''} onChange={handleInputChange} disabled={isDelivered} />
                            </div>

                            <div className="space-y-2">
                                <Label>Conteúdo do Laudo</Label>
                                <div className="rounded-md border border-input">
                                    <TiptapEditor content={formData.content_html || ''} onChange={handleEditorChange} />
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="hide_date"
                                        checked={formData.hide_date}
                                        onCheckedChange={(checked) => handleCheckboxChange("hide_date", !!checked)}
                                        disabled={isDelivered}
                                    />
                                    <Label htmlFor="hide_date">Ocultar Data</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="hide_signature"
                                        checked={formData.hide_signature}
                                        onCheckedChange={(checked) => handleCheckboxChange("hide_signature", !!checked)}
                                        disabled={isDelivered}
                                    />
                                    <Label htmlFor="hide_signature">Ocultar Assinatura</Label>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                {!isDelivered ? (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button type="button" variant="default" className="bg-green-600 hover:bg-green-700" disabled={isSending}>
                                                {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                                Enviar para Paciente
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Enviar laudo ao paciente?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Após o envio, o laudo ficará visível para o paciente e não poderá mais ser editado.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleSendToPatient} className="bg-green-600 hover:bg-green-700">
                                                    Confirmar Envio
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Este laudo já foi entregue ao paciente.</p>
                                )}

                                <div className="flex space-x-2">
                                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                                        Cancelar
                                    </Button>
                                    {!isDelivered && (
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : "Salvar Alterações"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Sidebar>
    );
}