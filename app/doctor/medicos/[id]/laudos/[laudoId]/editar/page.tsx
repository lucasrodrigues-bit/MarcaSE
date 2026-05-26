"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Send, Loader2, CheckCircle, AlertTriangle, X } from "lucide-react";
import { format } from "date-fns";
import TiptapEditor from "@/components/ui/tiptap-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { reportsApi } from "@/services/reportsApi.mjs";
import { api } from "@/services/api.mjs";
import Sidebar from "@/components/Sidebar";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const formatCPF = (v: string) => {
    const d = (v ?? "").replace(/\D/g, "");
    if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    return v || "—";
};

const calcAge = (birthDate: string) => {
    if (!birthDate) return null;
    const dob = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
};

const formatDateBR = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR", { timeZone: "UTC" });
};

const safeISOString = (d: Date | null | undefined) => {
    if (!(d instanceof Date) || isNaN(d.getTime())) return null;
    return d.toISOString();
};

export default function EditarLaudoPage() {
    const router = useRouter();
    const params = useParams();
    const patientId = params.id as string;
    const laudoId = params.laudoId as string;

    const [formData, setFormData] = useState<any>({});
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [hasUnsaved, setHasUnsaved] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

    const autoSaveTimer = useRef<NodeJS.Timeout>();
    const formDataRef = useRef<any>({});
    const isSavingRef = useRef(false);

    const isDelivered = formData.status === "completed";

    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    useEffect(() => {
        if (!laudoId) { setLoading(false); return; }

        Promise.all([
            reportsApi.getReportById(laudoId),
            api.get(`/rest/v1/patients?id=eq.${patientId}&select=full_name,cpf,birth_date,health_plan`),
        ])
            .then(([reportData, patientData]: any[]) => {
                const report = Array.isArray(reportData) ? reportData[0] : reportData;
                if (report) {
                    setFormData({
                        ...report,
                        due_at: report.due_at ? new Date(report.due_at) : null,
                    });
                }
                const pt = Array.isArray(patientData) ? patientData[0] : patientData;
                if (pt) setPatient(pt);
            })
            .catch(() => {
                toast({ title: "Erro ao carregar laudo", variant: "destructive" });
            })
            .finally(() => setLoading(false));
    }, [laudoId, patientId]);

    const triggerAutoSave = useCallback((patch: object) => {
        clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = setTimeout(async () => {
            if (isSavingRef.current) return;
            const pid = formDataRef.current.patient_id;
            if (!pid) return;
            setAutoSaveStatus("saving");
            try {
                await reportsApi.updateReport(laudoId, { patient_id: pid, ...patch });
                setAutoSaveStatus("saved");
                setHasUnsaved(false);
                setTimeout(() => setAutoSaveStatus("idle"), 2000);
            } catch {
                setAutoSaveStatus("idle");
                toast({ title: "Erro no salvamento automático", variant: "destructive" });
            }
        }, 2000);
    }, [laudoId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [id]: value }));
        setHasUnsaved(true);
        triggerAutoSave({ [id]: value });
    };

    const handleSelectChange = (id: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [id]: value }));
        setHasUnsaved(true);
        triggerAutoSave({ [id]: value });
    };

    const handleSwitchChange = (id: string, checked: boolean) => {
        setFormData((prev: any) => ({ ...prev, [id]: checked }));
        setHasUnsaved(true);
        triggerAutoSave({ [id]: checked });
    };

    const handleDateChange = (date: Date | undefined) => {
        if (!date) return;
        setFormData((prev: any) => ({ ...prev, due_at: date }));
        setHasUnsaved(true);
        triggerAutoSave({ due_at: date.toISOString() });
    };

    const handleEditorChange = (html: string, json: object) => {
        setFormData((prev: any) => ({ ...prev, content_html: html, content_json: json }));
        setHasUnsaved(true);
        triggerAutoSave({ content_html: html, content_json: json });
    };

    const buildPayload = (fd: any) => ({
        patient_id: fd.patient_id,
        status: fd.status,
        exam: fd.exam || null,
        requested_by: fd.requested_by || null,
        cid_code: fd.cid_code || null,
        diagnosis: fd.diagnosis || null,
        conclusion: fd.conclusion || null,
        content_html: fd.content_html || null,
        content_json: fd.content_json || null,
        hide_date: !!fd.hide_date,
        hide_signature: !!fd.hide_signature,
        due_at: safeISOString(fd.due_at),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearTimeout(autoSaveTimer.current);
        isSavingRef.current = true;
        setIsSubmitting(true);
        try {
            await reportsApi.updateReport(laudoId, buildPayload(formData));
            setHasUnsaved(false);
            toast({ title: "Laudo salvo com sucesso!" });
            router.push(`/doctor/medicos/${patientId}/laudos`);
        } catch {
            toast({ title: "Erro ao salvar laudo", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
            isSavingRef.current = false;
        }
    };

    const handleSendToPatient = async () => {
        clearTimeout(autoSaveTimer.current);
        isSavingRef.current = true;
        setIsSending(true);
        try {
            await reportsApi.sendToPatient(laudoId, formData.patient_id);
            setFormData((prev: any) => ({ ...prev, status: "completed" }));
            setHasUnsaved(false);
            toast({ title: "Laudo liberado ao paciente com sucesso!" });
        } catch {
            toast({ title: "Erro ao liberar laudo", variant: "destructive" });
        } finally {
            setIsSending(false);
            isSavingRef.current = false;
        }
    };

    const statusBadge = {
        draft: <Badge variant="secondary">Rascunho</Badge>,
        completed: <Badge className="bg-green-600 text-white">Liberado</Badge>,
    }[formData.status as string] ?? null;

    const age = patient?.birth_date ? calcAge(patient.birth_date) : null;

    if (loading) {
        return (
            <Sidebar>
                <div className="container mx-auto p-4">
                    <Card>
                        <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
                        <CardContent className="space-y-6">
                            <Skeleton className="h-12 w-full" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-1/6" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ))}
                            </div>
                            <Skeleton className="h-64 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </Sidebar>
        );
    }

    return (
        <Sidebar>
            <div className="container mx-auto p-4">
                <Card className="overflow-hidden">
                    {/* Cabeçalho fixo com dados do paciente */}
                    <div className="sticky top-0 z-10 bg-muted/60 backdrop-blur border-b px-6 py-3 flex flex-wrap gap-x-8 gap-y-1 text-sm">
                        {patient ? (
                            <>
                                <span><strong>Paciente:</strong> {patient.full_name || "—"}</span>
                                {patient.birth_date && (
                                    <span>
                                        <strong>Nasc.:</strong> {formatDateBR(patient.birth_date)}
                                        {age !== null && ` (${age} anos)`}
                                    </span>
                                )}
                                <span><strong>CPF:</strong> {formatCPF(patient.cpf)}</span>
                                {patient.health_plan && (
                                    <span><strong>Convênio:</strong> {patient.health_plan}</span>
                                )}
                            </>
                        ) : (
                            <span className="text-muted-foreground italic">Dados do paciente indisponíveis</span>
                        )}
                    </div>

                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex items-center gap-3">
                            <CardTitle>Laudo — {formData.order_number}</CardTitle>
                            {statusBadge}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                {autoSaveStatus === "saving" && (
                                    <><Loader2 className="h-3 w-3 animate-spin" /> Salvando...</>
                                )}
                                {autoSaveStatus === "saved" && (
                                    <><CheckCircle className="h-3 w-3 text-green-500" /> Salvo</>
                                )}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                title="Fechar"
                                onClick={() => router.push(`/doctor/medicos/${patientId}/laudos`)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Alertas de toggles ativos */}
                            {(formData.hide_date || formData.hide_signature) && (
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-md text-orange-700 dark:text-orange-400 text-sm">
                                    <AlertTriangle className="h-4 w-4 shrink-0" />
                                    <span>
                                        Atenção: {[
                                            formData.hide_date && "data",
                                            formData.hide_signature && "assinatura"
                                        ].filter(Boolean).join(" e ")}{" "}
                                        {(formData.hide_date && formData.hide_signature) ? "estão ocultos" : "está oculto"} no documento final.
                                    </span>
                                </div>
                            )}

                            {/* Campos do formulário */}
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
                                            <SelectItem value="completed">Liberado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Data de Vencimento</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={isDelivered}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.due_at && !isNaN(new Date(formData.due_at).getTime())
                                                    ? format(new Date(formData.due_at), "dd/MM/yyyy")
                                                    : <span>Escolha uma data</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={formData.due_at && !isNaN(new Date(formData.due_at).getTime()) ? new Date(formData.due_at) : undefined}
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

                            {/* Editor de texto — só monta após carregar o laudo */}
                            <div className="space-y-2">
                                <Label>Conteúdo do Laudo</Label>
                                <div className="rounded-md border border-input overflow-hidden">
                                    {formData.id ? (
                                        <TiptapEditor
                                            content={formData.content_html || ''}
                                            onChange={handleEditorChange}
                                            editable={!isDelivered}
                                        />
                                    ) : (
                                        <div className="min-h-[320px] p-5 bg-muted/10 flex items-center justify-center text-muted-foreground text-sm">
                                            Carregando conteúdo do laudo...
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Controles do rodapé */}
                            <div className="flex flex-wrap items-center gap-6 pt-2 border-t">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="hide_date"
                                        checked={!!formData.hide_date}
                                        onCheckedChange={(checked) => handleSwitchChange("hide_date", checked)}
                                        disabled={isDelivered}
                                        className={cn(formData.hide_date && "data-[state=checked]:bg-orange-500")}
                                    />
                                    <Label
                                        htmlFor="hide_date"
                                        className={cn("cursor-pointer", formData.hide_date && "text-orange-600 dark:text-orange-400 font-medium")}
                                    >
                                        Ocultar data
                                    </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="hide_signature"
                                        checked={!!formData.hide_signature}
                                        onCheckedChange={(checked) => handleSwitchChange("hide_signature", checked)}
                                        disabled={isDelivered}
                                        className={cn(formData.hide_signature && "data-[state=checked]:bg-orange-500")}
                                    />
                                    <Label
                                        htmlFor="hide_signature"
                                        className={cn("cursor-pointer", formData.hide_signature && "text-orange-600 dark:text-orange-400 font-medium")}
                                    >
                                        Ocultar assinatura
                                    </Label>
                                </div>
                            </div>

                            {/* Botões de ação */}
                            <div className="flex justify-between items-center">
                                {!isDelivered ? (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                type="button"
                                                className="bg-green-600 hover:bg-green-700"
                                                disabled={isSending}
                                            >
                                                {isSending
                                                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    : <Send className="mr-2 h-4 w-4" />}
                                                Liberar Laudo
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Liberar laudo ao paciente?</AlertDialogTitle>
                                                <AlertDialogDescription asChild>
                                                    <div className="space-y-2">
                                                        <p>
                                                            Após liberado, o laudo ficará visível para o paciente e{" "}
                                                            <strong>não poderá mais ser editado</strong>.
                                                        </p>
                                                        {(formData.hide_date || formData.hide_signature) && (
                                                            <p className="flex items-start gap-2 text-orange-600 dark:text-orange-400 text-sm">
                                                                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                                                                O documento será liberado sem{" "}
                                                                {[
                                                                    formData.hide_date && "data",
                                                                    formData.hide_signature && "assinatura"
                                                                ].filter(Boolean).join(" e ")}.
                                                            </p>
                                                        )}
                                                    </div>
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleSendToPatient}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    Confirmar Liberação
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Este laudo foi liberado e está visível para o paciente.
                                    </p>
                                )}

                                <div className="flex gap-2">
                                    {hasUnsaved && !isDelivered ? (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button type="button" variant="outline" disabled={isSubmitting}>
                                                    Cancelar
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Você tem alterações não salvas. Ao cancelar, elas serão perdidas.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Continuar editando</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => router.push(`/doctor/medicos/${patientId}/laudos`)}
                                                        className="bg-destructive hover:bg-destructive/90"
                                                    >
                                                        Descartar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={isSubmitting}
                                            onClick={() => router.push(`/doctor/medicos/${patientId}/laudos`)}
                                        >
                                            {isDelivered ? "Voltar" : "Cancelar"}
                                        </Button>
                                    )}
                                    {!isDelivered && (
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting
                                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                                                : "Salvar Laudo"}
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
