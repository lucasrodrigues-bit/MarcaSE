"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Filter, FileText, CheckCircle, Clock } from "lucide-react";
import { reportsApi } from "@/services/reportsApi.mjs";
import { api } from "@/services/api.mjs";
import Sidebar from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ManagerLaudosPage() {
  const [laudos, setLaudos] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPatientId, setSelectedPatientId] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [laudosData, patientsData] = await Promise.all([
        reportsApi.getAllReports(),
        api.get("/rest/v1/patients?select=id,full_name&order=full_name.asc"),
      ]);
      setLaudos(Array.isArray(laudosData) ? laudosData : []);
      setPatients(Array.isArray(patientsData) ? patientsData : []);
    } catch (e: any) {
      setError(e?.message || "Erro ao buscar dados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [selectedPatientId, statusFilter, searchTerm]);

  const patientMap: Record<string, string> = Object.fromEntries(
    patients.map((p) => [p.id, p.full_name])
  );

  const filtered = laudos.filter((l) => {
    const matchesPatient =
      selectedPatientId === "todos" || l.patient_id === selectedPatientId;
    const matchesStatus =
      statusFilter === "todos" || l.status === statusFilter;
    const patientName = patientMap[l.patient_id] ?? "";
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      patientName.toLowerCase().includes(q) ||
      l.order_number?.toLowerCase().includes(q) ||
      l.exam?.toLowerCase().includes(q) ||
      l.diagnosis?.toLowerCase().includes(q);
    return matchesPatient && matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  const total = laudos.length;
  const disponiveis = laudos.filter((l) => l.status === "completed").length;
  const pendentes = laudos.filter((l) => l.status === "draft").length;

  const StatusBadge = ({ status }: { status: string }) =>
    status === "completed" ? (
      <Badge className="bg-green-500/15 text-green-600 border border-green-500/30 hover:bg-green-500/20">
        Disponível
      </Badge>
    ) : (
      <Badge className="bg-yellow-500/15 text-yellow-600 border border-yellow-500/30 hover:bg-yellow-500/20">
        Pendente
      </Badge>
    );

  const getVisiblePages = (total: number, current: number) => {
    const pages: number[] = [];
    const half = 2;
    let start = Math.max(1, current - half);
    let end = Math.min(total, current + half);
    if (end - start < 4) {
      if (start === 1) end = Math.min(total, 5);
      else start = Math.max(1, end - 4);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <Sidebar>
      <div className="space-y-6 px-2 sm:px-4 md:px-6 pb-20">
        <div>
          <h1 className="text-2xl font-bold">Laudos do Sistema</h1>
          <p className="text-sm text-muted-foreground">
            Visão geral de todos os laudos médicos cadastrados
          </p>
        </div>

        {/* Cards de Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center gap-2 space-y-0">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Laudos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{loading ? "—" : total}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center gap-2 space-y-0">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {loading ? "—" : disponiveis}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center gap-2 space-y-0">
              <Clock className="w-4 h-4 text-yellow-500" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">
                {loading ? "—" : pendentes}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 items-center p-3 border rounded-lg bg-card shadow-sm">
          <div className="flex items-center gap-3 flex-1 w-full px-2">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            <Input
              placeholder="Buscar por paciente, nº pedido ou exame..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent px-0"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center w-full md:w-auto border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4">
            <Select
              value={selectedPatientId}
              onValueChange={setSelectedPatientId}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos os pacientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os pacientes</SelectItem>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="completed">Disponíveis</SelectItem>
                <SelectItem value="draft">Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-card rounded-lg border shadow-md overflow-hidden">
          {loading ? (
            <div className="p-10 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
              <p className="text-muted-foreground">Carregando laudos...</p>
            </div>
          ) : error ? (
            <div className="p-10 text-center text-destructive">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              {laudos.length === 0
                ? "Nenhum laudo cadastrado no sistema."
                : "Nenhum laudo encontrado com os filtros aplicados."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-muted border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Nº Pedido
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Paciente
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Exame
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">
                      Diagnóstico
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {current.map((l) => (
                    <tr
                      key={l.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4 font-mono text-sm text-muted-foreground">
                        {l.order_number || "—"}
                      </td>
                      <td className="p-4 font-medium">
                        {patientMap[l.patient_id] || "—"}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {l.exam || "—"}
                      </td>
                      <td className="p-4 text-muted-foreground hidden lg:table-cell">
                        {l.diagnosis || "—"}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={l.status} />
                      </td>
                      <td className="p-4 text-muted-foreground text-sm">
                        {l.created_at
                          ? new Date(l.created_at).toLocaleDateString("pt-BR")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginação */}
        {totalPages > 1 && !loading && (
          <div className="flex flex-wrap justify-center items-center gap-2 mt-4 p-4 bg-card rounded-lg border shadow-md">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-md font-medium text-sm bg-muted border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/80"
            >
              {"< Anterior"}
            </button>
            {getVisiblePages(totalPages, page).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`px-4 py-2 rounded-md font-medium text-sm border ${
                  page === n
                    ? "bg-primary text-primary-foreground border-primary shadow"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-md font-medium text-sm bg-muted border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/80"
            >
              {"Próximo >"}
            </button>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
