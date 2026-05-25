"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Edit, Loader2, MoreVertical } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { patientsService } from "@/services/patientsApi.mjs";
import { api } from "@/services/api.mjs";
import { PatientDetailsModal } from "@/components/ui/patient-details-modal";
import Sidebar from "@/components/Sidebar";
import { FilterBar } from "@/components/ui/filter-bar";
import { UserAvatar } from "@/components/ui/user-avatar";

interface Paciente {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
  estado: string;
  ultimoAtendimento?: string;
  email?: string;
  birth_date?: string;
  cpf?: string;
  blood_type?: string;
  weight_kg?: number;
  height_m?: number;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  cep?: string;
  convenio?: string;
  vip?: boolean;
  avatar_url?: string | null;
}

const formatPhone = (v: string) => {
  const d = (v ?? "").replace(/\D/g, "").substring(0, 11);
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return d;
};

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [filteredPacientes, setFilteredPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ convenio: "all", vip: "all" });
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const handleSearch = (term: string) => { setSearchTerm(term); setPage(1); };
  const handleFilterChange = (key: string, value: string) => { setFilters(prev => ({ ...prev, [key]: value })); setPage(1); };
  const handleClearFilters = () => { setSearchTerm(""); setFilters({ convenio: "all", vip: "all" }); setPage(1); };

  const fetchPacientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [items, profilesData] = await Promise.all([
        patientsService.list(),
        api.get("/rest/v1/profiles?select=id,avatar_url"),
      ]);

      const profilesById = new Map<string, any>();
      if (Array.isArray(profilesData)) {
        for (const p of profilesData) { if (p?.id) profilesById.set(p.id, p); }
      }

      const mapped: Paciente[] = (Array.isArray(items) ? items : []).map((p: any) => ({
        id: String(p.id ?? ""),
        nome: p.full_name ?? "—",
        telefone: formatPhone(p.phone_mobile ?? ""),
        cidade: p.city ?? "—",
        estado: p.state ?? "—",
        ultimoAtendimento: p.last_visit_at?.split("T")[0] ?? "—",
        email: p.email ?? "—",
        birth_date: p.birth_date ?? "—",
        cpf: p.cpf ?? "—",
        blood_type: p.blood_type ?? "—",
        weight_kg: p.weight_kg ?? 0,
        height_m: p.height_m ?? 0,
        street: p.street ?? "—",
        number: p.number ?? "—",
        complement: p.complement ?? "—",
        neighborhood: p.neighborhood ?? "—",
        cep: p.cep ?? "—",
        convenio: p.convenio ?? p.insurance_plan ?? "Particular",
        vip: Boolean(p.vip ?? p.is_vip ?? false),
        avatar_url: profilesById.get(String(p.id))?.avatar_url ?? null,
      }));

      setPacientes(mapped);
    } catch (e: any) {
      console.error("Erro ao carregar pacientes:", e);
      setError(e?.message || "Erro ao carregar pacientes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPacientes(); }, [fetchPacientes]);

  useEffect(() => {
    const filtered = pacientes.filter((p) => {
      const matchesSearch =
        p.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.telefone?.includes(searchTerm);
      const matchesConvenio = filters.convenio === "all" || p.convenio === filters.convenio;
      const matchesVip =
        filters.vip === "all" ||
        (filters.vip === "vip" && p.vip) ||
        (filters.vip === "regular" && !p.vip);
      return matchesSearch && matchesConvenio && matchesVip;
    });
    setFilteredPacientes(filtered);
    setPage(1);
  }, [pacientes, searchTerm, filters]);

  const totalPages = Math.ceil(filteredPacientes.length / pageSize);
  const currentItems = filteredPacientes.slice((page - 1) * pageSize, page * pageSize);

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

  const ActionMenu = ({ patient }: { patient: Paciente }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => { setSelectedPatient(patient); setIsModalOpen(true); }}>
          <Eye className="w-4 h-4 mr-2" /> Ver detalhes
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/doctor/medicos/${patient.id}/laudos`} className="flex items-center w-full">
            <Edit className="w-4 h-4 mr-2" /> Laudos
          </Link>
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
            <p className="text-sm text-muted-foreground">Lista de pacientes vinculados</p>
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
          ) : filteredPacientes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {pacientes.length === 0 ? "Nenhum paciente cadastrado." : "Nenhum paciente encontrado com os filtros aplicados."}
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
                    <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y">
                  {currentItems.map((p) => (
                    <tr key={p.id} className="hover:bg-muted transition">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={p.nome} avatarUrl={p.avatar_url} />
                          <span>
                            {p.nome}
                            {p.vip && <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full text-purple-400 bg-purple-400/15">VIP</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.telefone}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{`${p.cidade} / ${p.estado}`}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.convenio}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{p.ultimoAtendimento}</td>
                      <td className="px-4 py-3 text-right">
                        <ActionMenu patient={p} />
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
          ) : filteredPacientes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {pacientes.length === 0 ? "Nenhum paciente cadastrado." : "Nenhum paciente encontrado com os filtros aplicados."}
            </div>
          ) : (
            <div className="space-y-4">
              {currentItems.map((p) => (
                <div key={p.id} className="bg-muted rounded-lg p-4 flex justify-between items-center border">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={p.nome} avatarUrl={p.avatar_url} />
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {p.nome}
                        {p.vip && <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full text-purple-400 bg-purple-400/15 uppercase">VIP</span>}
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">{p.telefone}</div>
                      <div className="text-sm text-muted-foreground">{p.convenio}</div>
                      <div className="text-xs text-muted-foreground">{p.cidade} / {p.estado}</div>
                    </div>
                  </div>
                  <ActionMenu patient={p} />
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
      </div>

      <PatientDetailsModal
        patient={selectedPatient}
        isOpen={isModalOpen}
        onClose={() => { setSelectedPatient(null); setIsModalOpen(false); }}
      />
    </Sidebar>
  );
}
