"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Eye, Calendar, Loader2, MoreVertical } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { patientsService } from "@/services/patientsApi.mjs";
import Sidebar from "@/components/Sidebar";
import { FilterBar } from "@/components/ui/filter-bar";

export default function PacientesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({ convenio: "all", vip: "all" });
    const [allPatients, setAllPatients] = useState<any[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const totalPages = Math.ceil(filteredPatients.length / pageSize);
    const currentPatients = filteredPatients.slice((page - 1) * pageSize, page * pageSize);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [patientDetails, setPatientDetails] = useState<any | null>(null);

    const handleSearch = (term: string) => { setSearchTerm(term); setPage(1); };
    const handleFilterChange = (key: string, value: string) => { setFilters(prev => ({ ...prev, [key]: value })); setPage(1); };
    const handleClearFilters = () => { setSearchTerm(""); setFilters({ convenio: "all", vip: "all" }); setPage(1); };

    const fetchAllPacientes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await patientsService.list();
            const mapped = res.map((p: any) => ({
                id: String(p.id ?? ""),
                nome: p.full_name ?? "—",
                telefone: p.phone_mobile ?? p.phone1 ?? "—",
                cidade: p.city ?? "—",
                estado: p.state ?? "—",
                ultimoAtendimento: p.last_visit_at?.split('T')[0] ?? "—",
                proximoAtendimento: p.next_appointment_at?.split('T')[0] ?? "—",
                vip: Boolean(p.vip ?? false),
                convenio: p.convenio ?? "Particular",
            }));
            setAllPatients(mapped);
        } catch (e: any) {
            console.error(e);
            setError(e?.message || "Erro ao buscar pacientes");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const filtered = allPatients.filter((patient) => {
            const matchesSearch =
                patient.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.telefone?.includes(searchTerm);
            const matchesConvenio = filters.convenio === "all" || patient.convenio === filters.convenio;
            const matchesVip =
                filters.vip === "all" ||
                (filters.vip === "vip" && patient.vip) ||
                (filters.vip === "regular" && !patient.vip);
            return matchesSearch && matchesConvenio && matchesVip;
        });
        setFilteredPatients(filtered);
        setPage(1);
    }, [allPatients, searchTerm, filters]);

    useEffect(() => { fetchAllPacientes(); }, []);

    const openDetailsDialog = async (patientId: string) => {
        setDetailsDialogOpen(true);
        setPatientDetails(null);
        try {
            const res = await patientsService.getById(patientId);
            setPatientDetails(Array.isArray(res) ? res[0] : res);
        } catch (e: any) {
            setPatientDetails({ error: e?.message || "Erro ao buscar detalhes" });
        }
    };

    const handleDeletePatient = async (patientId: string) => {
        try {
            await patientsService.delete(patientId);
            setAllPatients((prev) => prev.filter((p) => String(p.id) !== String(patientId)));
        } catch (e: any) {
            alert(`Erro ao deletar paciente: ${e?.message || "Erro desconhecido"}`);
        }
        setDeleteDialogOpen(false);
        setPatientToDelete(null);
    };

    const getVisiblePageNumbers = (total: number, current: number) => {
        const pages: number[] = [];
        const maxVisible = 5;
        const half = Math.floor(maxVisible / 2);
        let start = Math.max(1, current - half);
        let end = Math.min(total, current + half);
        if (end - start + 1 < maxVisible) {
            if (end === total) start = Math.max(1, total - maxVisible + 1);
            if (start === 1) end = Math.min(total, maxVisible);
        }
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };
    const visiblePageNumbers = getVisiblePageNumbers(totalPages, page);

    const ActionMenu = ({ patientId }: { patientId: string }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menu</span>
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openDetailsDialog(patientId)}>
                    <Eye className="w-4 h-4 mr-2" /> Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/manager/pacientes/${patientId}/editar`} className="flex items-center w-full">
                        <Edit className="w-4 h-4 mr-2" /> Editar
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Calendar className="w-4 h-4 mr-2" /> Marcar consulta
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => { setPatientToDelete(patientId); setDeleteDialogOpen(true); }}>
                    <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <Sidebar>
            <div className="space-y-6 px-2 sm:px-4 md:px-6 pb-20">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">Pacientes</h1>
                        <p className="text-sm text-muted-foreground">Gerencie as informações de seus pacientes</p>
                    </div>
                </div>

                <FilterBar
                    searchTerm={searchTerm}
                    onSearch={handleSearch}
                    activeFilters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                    searchPlaceholder="Buscar por nome ou telefone..."
                    filters={[
                        { key: "convenio", label: "Convênio", options: ["Particular", "SUS", "Unimed"] },
                        { key: "vip", label: "VIP", options: [{ label: "VIP", value: "vip" }, { label: "Regular", value: "regular" }] },
                    ]}
                >
                    <div className="hidden lg:block">
                        <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                            <SelectTrigger className="w-[70px]"><SelectValue placeholder="10" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </FilterBar>

                {/* Tabela Desktop */}
                <div className="bg-card rounded-lg border shadow-md overflow-hidden hidden md:block">
                    {loading ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                            Carregando pacientes...
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-destructive">{error}</div>
                    ) : filteredPatients.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            {allPatients.length === 0 ? "Nenhum paciente cadastrado." : "Nenhum paciente encontrado com os filtros aplicados."}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[650px]">
                                <thead className="bg-muted border-b">
                                    <tr>
                                        <th className="text-left p-2 md:p-4 font-medium text-muted-foreground">Nome</th>
                                        <th className="text-left p-2 md:p-4 font-medium text-muted-foreground hidden sm:table-cell">Telefone</th>
                                        <th className="text-left p-2 md:p-4 font-medium text-muted-foreground hidden md:table-cell">Cidade / Estado</th>
                                        <th className="text-left p-2 md:p-4 font-medium text-muted-foreground hidden sm:table-cell">Convênio</th>
                                        <th className="text-left p-2 md:p-4 font-medium text-muted-foreground hidden lg:table-cell">Último atendimento</th>
                                        <th className="text-left p-2 md:p-4 font-medium text-muted-foreground hidden lg:table-cell">Próximo atendimento</th>
                                        <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y">
                                    {currentPatients.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-muted transition">
                                            <td className="px-4 py-3 font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                                        <span className="text-primary font-medium text-sm">{patient.nome?.charAt(0) || "?"}</span>
                                                    </div>
                                                    <span>
                                                        {patient.nome}
                                                        {patient.vip && <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full text-purple-400 bg-purple-400/15">VIP</span>}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{patient.telefone}</td>
                                            <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{`${patient.cidade} / ${patient.estado}`}</td>
                                            <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{patient.convenio}</td>
                                            <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{patient.ultimoAtendimento}</td>
                                            <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{patient.proximoAtendimento}</td>
                                            <td className="px-4 py-3 text-right">
                                                <ActionMenu patientId={String(patient.id)} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Cards Mobile */}
                <div className="bg-card rounded-lg border shadow-md p-4 block md:hidden">
                    {loading ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                            Carregando pacientes...
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-destructive">{error}</div>
                    ) : filteredPatients.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            {allPatients.length === 0 ? "Nenhum paciente cadastrado." : "Nenhum paciente encontrado com os filtros aplicados."}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {currentPatients.map((patient) => (
                                <div key={patient.id} className="bg-muted rounded-lg p-4 flex justify-between items-center border">
                                    <div>
                                        <div className="font-semibold flex items-center gap-2">
                                            {patient.nome}
                                            {patient.vip && <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full text-purple-400 bg-purple-400/15 uppercase">VIP</span>}
                                        </div>
                                        <div className="text-xs text-muted-foreground mb-1">{patient.telefone}</div>
                                        <div className="text-sm text-muted-foreground">{patient.convenio}</div>
                                        <div className="text-xs text-muted-foreground">{patient.cidade} / {patient.estado}</div>
                                    </div>
                                    <ActionMenu patientId={String(patient.id)} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Paginação */}
                {totalPages > 1 && !loading && (
                    <div className="flex flex-wrap justify-center items-center gap-2 mt-4 p-4 bg-card rounded-lg border shadow-md">
                        <button
                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            disabled={page === 1}
                            className="flex items-center px-4 py-2 rounded-md font-medium transition-colors text-sm bg-muted text-muted-foreground hover:bg-muted/90 disabled:opacity-50 disabled:cursor-not-allowed border"
                        >{"< Anterior"}</button>
                        {visiblePageNumbers.map((number) => (
                            <button
                                key={number}
                                onClick={() => setPage(number)}
                                className={`px-4 py-2 rounded-md font-medium transition-colors text-sm border ${page === number ? "bg-primary text-primary-foreground shadow-md border-primary" : "bg-muted text-muted-foreground hover:bg-muted/90"}`}
                            >{number}</button>
                        ))}
                        <button
                            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={page === totalPages}
                            className="flex items-center px-4 py-2 rounded-md font-medium transition-colors text-sm bg-muted text-muted-foreground hover:bg-muted/90 disabled:opacity-50 disabled:cursor-not-allowed border"
                        >{"Próximo >"}</button>
                    </div>
                )}

                {/* Dialog Exclusão */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>Tem certeza que deseja excluir este paciente?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => patientToDelete && handleDeletePatient(patientToDelete)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Dialog Detalhes */}
                <AlertDialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                    <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Detalhes do Paciente</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogDescription>
                            {patientDetails ? (!patientDetails.error ? (
                                <div className="grid gap-4 py-4 text-left">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div><p className="font-semibold text-xs text-muted-foreground">NOME</p><p>{patientDetails.full_name}</p></div>
                                        <div><p className="font-semibold text-xs text-muted-foreground">EMAIL</p><p className="break-all">{patientDetails.email}</p></div>
                                        <div><p className="font-semibold text-xs text-muted-foreground">TELEFONE</p><p>{patientDetails.phone_mobile}</p></div>
                                        <div><p className="font-semibold text-xs text-muted-foreground">DATA NASC.</p><p>{patientDetails.birth_date}</p></div>
                                    </div>
                                    <div className="border-t pt-4">
                                        <p className="font-semibold text-primary mb-2">Endereço</p>
                                        <p>{patientDetails.street}, {patientDetails.number}</p>
                                        <p>{patientDetails.cidade}/{patientDetails.estado}</p>
                                    </div>
                                </div>
                            ) : <p className="text-destructive">{patientDetails.error}</p>) : (
                                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                            )}
                        </AlertDialogDescription>
                        <AlertDialogFooter><AlertDialogCancel>Fechar</AlertDialogCancel></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Sidebar>
    );
}
