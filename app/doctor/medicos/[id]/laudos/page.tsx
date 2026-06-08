'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api.mjs';
import { reportsApi } from '@/services/reportsApi.mjs';
import Sidebar from '@/components/Sidebar';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Pencil, Send, Trash2, Loader2, Printer } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const formatPhone = (v: string) => {
    const d = (v ?? "").replace(/\D/g, "").substring(0, 11);
    if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    return d;
};

export default function LaudosPage() {
    const [patient, setPatient] = useState<any>(null);
    const [laudos, setLaudos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const router = useRouter();
    const patientId = params.id as string;

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Dialogs state
    const [liberarTarget, setLiberarTarget] = useState<any>(null);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const [deleteConfirmStep, setDeleteConfirmStep] = useState(0);
    const [isActioning, setIsActioning] = useState(false);

    const fetchData = useCallback(async () => {
        if (!patientId) return;
        setLoading(true);
        try {
            const [patientData, laudosData] = await Promise.all([
                api.get(`/rest/v1/patients?id=eq.${patientId}&select=*`).then((r: any) => r?.[0]),
                reportsApi.getReports(patientId),
            ]);
            setPatient(patientData);
            setLaudos(Array.isArray(laudosData) ? laudosData : []);
        } catch {
            toast({ title: "Erro ao carregar dados", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentItems = laudos.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(laudos.length / itemsPerPage);

    const handleLiberarConfirm = async () => {
        if (!liberarTarget) return;
        setIsActioning(true);
        try {
            await reportsApi.sendToPatient(liberarTarget.id, patientId);
            toast({ title: "Laudo liberado com sucesso!" });
            await fetchData();
        } catch {
            toast({ title: "Erro ao liberar laudo", variant: "destructive" });
        } finally {
            setIsActioning(false);
            setLiberarTarget(null);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setIsActioning(true);
        try {
            await reportsApi.deleteReport(deleteTarget.id);
            toast({ title: "Laudo excluído." });
            await fetchData();
        } catch {
            toast({ title: "Erro ao excluir laudo", variant: "destructive" });
        } finally {
            setIsActioning(false);
            setDeleteTarget(null);
            setDeleteConfirmStep(0);
        }
    };

    return (
        <Sidebar>
            <div className="container mx-auto p-4">
                {loading ? (
                    <p className="text-muted-foreground text-center py-10">Carregando...</p>
                ) : (
                    <>
                        {patient && (
                            <Card className="mb-4">
                                <CardHeader>
                                    <CardTitle>Informações do Paciente</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p><strong>Nome:</strong> {patient.full_name}</p>
                                    <p><strong>Email:</strong> {patient.email}</p>
                                    <p><strong>Telefone:</strong> {formatPhone(patient.phone_mobile ?? "")}</p>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Laudos do Paciente</CardTitle>
                                <Link href={`/doctor/medicos/${patientId}/laudos/novo`}>
                                    <Button>Criar Novo Laudo</Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nº Pedido</TableHead>
                                            <TableHead>Exame</TableHead>
                                            <TableHead>Diagnóstico</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Criado em</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentItems.length > 0 ? (
                                            currentItems.map((laudo) => (
                                                <TableRow key={laudo.id}>
                                                    <TableCell className="font-mono text-sm">{laudo.order_number || "—"}</TableCell>
                                                    <TableCell>{laudo.exam || "—"}</TableCell>
                                                    <TableCell>{laudo.diagnosis || "—"}</TableCell>
                                                    <TableCell>
                                                        {laudo.status === 'draft' && <Badge variant="secondary">Rascunho</Badge>}
                                                        {laudo.status === 'completed' && <Badge className="bg-green-600 text-white">Liberado</Badge>}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground text-sm">
                                                        {new Date(laudo.created_at).toLocaleDateString("pt-BR")}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                    <span className="sr-only">Ações</span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() => router.push(`/doctor/medicos/${patientId}/laudos/${laudo.id}/editar`)}
                                                                >
                                                                    <Pencil className="mr-2 h-4 w-4" />
                                                                    {laudo.status === 'completed' ? 'Visualizar' : 'Editar'}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => window.print()}
                                                                >
                                                                    <Printer className="mr-2 h-4 w-4" />
                                                                    Imprimir
                                                                </DropdownMenuItem>

                                                                {laudo.status === 'draft' && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            className="text-green-600 focus:text-green-600"
                                                                            onClick={() => setLiberarTarget(laudo)}
                                                                        >
                                                                            <Send className="mr-2 h-4 w-4" />
                                                                            Liberar Laudo
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}

                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive"
                                                                    onClick={() => setDeleteTarget(laudo)}
                                                                    disabled={laudo.status === 'completed'}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Excluir Laudo
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                                    Nenhum laudo encontrado.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>

                                {totalPages > 1 && (
                                    <div className="flex justify-center gap-2 mt-4">
                                        {Array.from({ length: totalPages }, (_, i) => (
                                            <Button
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                variant={currentPage === i + 1 ? 'default' : 'outline'}
                                                size="sm"
                                            >
                                                {i + 1}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Dialog: Liberar laudo */}
            <AlertDialog open={!!liberarTarget} onOpenChange={(o) => !o && setLiberarTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Liberar laudo ao paciente?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Após liberado, o laudo ficará visível para o paciente e <strong>não poderá mais ser editado</strong>.
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isActioning}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLiberarConfirm}
                            disabled={isActioning}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isActioning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmar Liberação
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog: Excluir laudo — confirmação dupla */}
            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(o) => { if (!o) { setDeleteTarget(null); setDeleteConfirmStep(0); } }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {deleteConfirmStep === 0 ? 'Excluir laudo?' : 'Confirmar exclusão definitiva?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteConfirmStep === 0 ? (
                                <>
                                    O laudo <strong>{deleteTarget?.order_number}</strong> será removido.
                                    Esta ação <strong>não pode ser desfeita</strong>.
                                </>
                            ) : (
                                <>
                                    Você tem certeza absoluta? O laudo{' '}
                                    <strong>{deleteTarget?.order_number}</strong> será{' '}
                                    <strong>excluído permanentemente</strong> do sistema, sem possibilidade de recuperação.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isActioning}
                            onClick={() => { setDeleteTarget(null); setDeleteConfirmStep(0); }}
                        >
                            Cancelar
                        </AlertDialogCancel>
                        {deleteConfirmStep === 0 ? (
                            <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={(e) => { e.preventDefault(); setDeleteConfirmStep(1); }}
                            >
                                Continuar
                            </AlertDialogAction>
                        ) : (
                            <AlertDialogAction
                                onClick={handleDeleteConfirm}
                                disabled={isActioning}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                {isActioning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Excluir definitivamente
                            </AlertDialogAction>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Sidebar>
    );
}
