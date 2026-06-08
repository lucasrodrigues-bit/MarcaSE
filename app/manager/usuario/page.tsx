"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Eye, Edit, Loader2, Search, MoreVertical } from "lucide-react";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { api, login } from "@/services/api.mjs";
import { usersService } from "@/services/usersApi.mjs";
import Sidebar from "@/components/Sidebar";
import { UserAvatar } from "@/components/ui/user-avatar";

interface FlatUser {
    id: string;
    user_id: string;
    full_name?: string;
    email: string;
    phone?: string | null;
    role: string;
    avatar_url?: string | null;
}

interface UserInfoResponse {
    user: any;
    profile: any;
    roles: string[];
    permissions: Record<string, boolean>;
}

export default function UsersPage() {
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        try {
            const userInfoString = localStorage.getItem("user_info");
            if (userInfoString) {
                const userInfo = JSON.parse(userInfoString);
                setUserRole(userInfo.user_metadata?.role ?? null);
            }
        } catch {}
    }, []);

    const isAdmin = userRole === "admin";

    const [users, setUsers] = useState<FlatUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [userDetails, setUserDetails] = useState<UserInfoResponse | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState<string>("all");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const rolesData: any[] = await usersService.list_roles();
            const rolesArray = Array.isArray(rolesData) ? rolesData : [];

            const profilesData: any[] = await api.get(`/rest/v1/profiles?select=id,full_name,email,phone,avatar_url`);
            const profilesById = new Map<string, any>();
            if (Array.isArray(profilesData)) {
                for (const p of profilesData) { if (p?.id) profilesById.set(p.id, p); }
            }

    const mapped: FlatUser[] = rolesArray
    .filter((roleItem) => profilesById.has(roleItem.user_id))
    .map((roleItem) => {                
    const uid = roleItem.user_id;
                const profile = profilesById.get(uid);
                return {
                    id: uid,
                    user_id: uid,
                    full_name: profile?.full_name ?? "—",
                    email: profile?.email ?? "—",
                    phone: profile?.phone ?? "—",
                    role: roleItem.role ?? "—",
                    avatar_url: profile?.avatar_url ?? null,
                };
            });

            setUsers(mapped);
            setCurrentPage(1);
        } catch (err: any) {
            console.error("Erro ao buscar usuários:", err);
            setError("Não foi possível carregar os usuários.");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            try { await login(); } catch (e) { console.warn("login falhou:", e); }
            await fetchUsers();
        };
        init();
    }, [fetchUsers]);

    const openDetailsDialog = async (flatUser: FlatUser) => {
        setDetailsDialogOpen(true);
        setUserDetails(null);
        try {
            const data = await usersService.full_data(flatUser.user_id);
            setUserDetails(data);
        } catch (err: any) {
            setUserDetails({
                user: { id: flatUser.user_id, email: flatUser.email },
                profile: { full_name: flatUser.full_name, phone: flatUser.phone },
                roles: [flatUser.role],
                permissions: {},
            });
        }
    };

    const filteredUsers = users.filter((u) => {
        const roleMatch = selectedRole === "all" || u.role === selectedRole;
        const searchLower = searchTerm.toLowerCase();
        const searchMatch = !searchTerm ||
            u.full_name?.toLowerCase().includes(searchLower) ||
            u.email?.toLowerCase().includes(searchLower) ||
            u.phone?.includes(searchLower);
        return roleMatch && searchMatch;
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const currentItems = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
    const visiblePageNumbers = getVisiblePageNumbers(totalPages, currentPage);

    const ActionMenu = ({ user }: { user: FlatUser }) => {
        if (!isAdmin) return null;
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openDetailsDialog(user)}>
                        <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/manager/usuario/${user.id}/editar`} className="flex items-center w-full">
                            <Edit className="mr-2 h-4 w-4" /> Editar
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    return (
        <Sidebar>
            <div className="space-y-6 px-2 sm:px-4 md:px-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">Usuários Cadastrados</h1>
                        <p className="text-sm text-muted-foreground">Gerencie usuários do sistema.</p>
                    </div>
                    <Link href="/manager/usuario/novo" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto">
                            <Plus className="w-4 h-4 mr-2" /> Novo Usuário
                        </Button>
                    </Link>
                </div>

                {/* Filtros */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-card p-4 rounded-lg border">
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome, e-mail ou telefone..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="pl-10 w-full bg-muted border-border focus:bg-card transition-colors"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <Select onValueChange={(v) => { setSelectedRole(v); setCurrentPage(1); }} value={selectedRole}>
                            <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Papel" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="gestor">Gestor</SelectItem>
                                <SelectItem value="medico">Médico</SelectItem>
                                <SelectItem value="secretaria">Secretária</SelectItem>
                                <SelectItem value="user">Usuário</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }} defaultValue={String(itemsPerPage)}>
                            <SelectTrigger className="w-full sm:w-[80px]"><SelectValue placeholder="10" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Tabela Desktop */}
                <div className="bg-card rounded-lg border shadow-md overflow-hidden hidden md:block">
                    {loading ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                            Carregando usuários...
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-destructive">{error}</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">Nenhum usuário encontrado.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead className="bg-muted border-b">
                                    <tr>
                                        <th className="text-left p-2 md:p-4 font-medium text-muted-foreground">Nome</th>
                                        <th className="text-left p-2 md:p-4 font-medium text-muted-foreground hidden sm:table-cell">E-mail</th>
                                        <th className="text-left p-2 md:p-4 font-medium text-muted-foreground hidden md:table-cell">Telefone</th>
                                        <th className="text-left p-2 md:p-4 font-medium text-muted-foreground hidden lg:table-cell">Cargo</th>
                                        <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y">
                                    {currentItems.map((u) => (
                                        <tr key={u.id} className="hover:bg-muted transition">
                                            <td className="px-4 py-3 font-medium">
                                                <div className="flex items-center gap-3">
                                                    <UserAvatar name={u.full_name || u.email} avatarUrl={u.avatar_url} />
                                                    {u.full_name}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell break-all">{u.email}</td>
                                            <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{u.phone}</td>
                                            <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell capitalize">{u.role}</td>
                                            <td className="px-4 py-3 text-right">
                                                <ActionMenu user={u} />
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
                            Carregando usuários...
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-destructive">{error}</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">Nenhum usuário encontrado.</div>
                    ) : (
                        <div className="space-y-4">
                            {currentItems.map((u) => (
                                <div key={u.id} className="bg-muted rounded-lg p-4 flex justify-between items-center border">
                                    <div className="flex items-center gap-3">
                                        <UserAvatar name={u.full_name || u.email} avatarUrl={u.avatar_url} />
                                        <div>
                                            <div className="font-semibold">{u.full_name || "—"}</div>
                                            <div className="text-xs text-muted-foreground mb-1">{u.email}</div>
                                            <div className="text-sm text-muted-foreground capitalize">{u.role}</div>
                                        </div>
                                    </div>
                                    <ActionMenu user={u} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Paginação */}
                {totalPages > 1 && !loading && (
                    <div className="flex flex-wrap justify-center items-center gap-2 mt-4 p-4 bg-card rounded-lg border shadow-md">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="flex items-center px-4 py-2 rounded-md font-medium transition-colors text-sm bg-muted text-muted-foreground hover:bg-muted/90 disabled:opacity-50 disabled:cursor-not-allowed border"
                        >{"< Anterior"}</button>
                        {visiblePageNumbers.map((number) => (
                            <button
                                key={number}
                                onClick={() => setCurrentPage(number)}
                                className={`px-4 py-2 rounded-md font-medium transition-colors text-sm border ${currentPage === number ? "bg-primary text-primary-foreground shadow-md border-primary" : "bg-muted text-muted-foreground hover:bg-muted/90"}`}
                            >{number}</button>
                        ))}
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="flex items-center px-4 py-2 rounded-md font-medium transition-colors text-sm bg-muted text-muted-foreground hover:bg-muted/90 disabled:opacity-50 disabled:cursor-not-allowed border"
                        >{"Próximo >"}</button>
                    </div>
                )}

                {/* Modal Detalhes */}
                <AlertDialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl">
                                {userDetails?.profile?.full_name || "Detalhes do Usuário"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {!userDetails ? (
                                    <div className="p-4 text-center text-muted-foreground">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-primary" />
                                        Buscando dados completos...
                                    </div>
                                ) : (
                                    <div className="space-y-3 pt-2 text-left text-muted-foreground">
                                        <div><strong>ID:</strong> {userDetails.user.id}</div>
                                        <div><strong>E-mail:</strong> {userDetails.user.email}</div>
                                        <div><strong>Nome completo:</strong> {userDetails.profile.full_name}</div>
                                        <div><strong>Telefone:</strong> {userDetails.profile.phone}</div>
                                        <div><strong>Roles:</strong> {userDetails.roles?.join(", ")}</div>
                                        <div className="pt-2">
                                            <strong className="block mb-1">Permissões:</strong>
                                            <ul className="list-disc list-inside space-y-0.5 text-sm">
                                                {Object.entries(userDetails.permissions || {}).map(([k, v]) => (
                                                    <li key={k}>
                                                        {k}: <span className={`font-semibold ${v ? "text-primary" : "text-destructive"}`}>{v ? "Sim" : "Não"}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Fechar</AlertDialogCancel>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Sidebar>
    );
}