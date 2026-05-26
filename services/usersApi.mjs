import { api } from "./api.mjs";

export const usersService = {
    // Função getMe corrigida para chamar a si mesma pelo nome
    async getMe() {
        console.log("getMe chamado");
        const sessionData = await api.getSession();
        if (!sessionData?.id) {
            console.error("Sessão não encontrada ou usuário sem ID.", sessionData);
            throw new Error("Usuário não autenticado.");
        }
        // Chamando a outra função do serviço pelo nome explícito
        return usersService.full_data(sessionData.id);
    },

    async list_roles() {
        return await api.get(`/rest/v1/user_roles?select=id,user_id,role,created_at`);
    },

    async create_user(data) {
        const { role } = data;
        if (role === "medico") return await api.post(`/functions/v1/create-doctor`, data);
        if (role === "paciente") return await api.post(`/functions/v1/create-patient`, data);
        return await api.post(`/functions/v1/create-user-with-password`, data);
    },

    async registerPatient(data) {
        return await api.post("/functions/v1/register-patient-with-password", data);
    },
    // --- FIM DA NOVA FUNÇÃO ---

    async getMeSimple() {
        return await api.post(`/functions/v1/user-info`);
    },

    async full_data(user_id) {
        if (!user_id) throw new Error("user_id é obrigatório");

        const [profile] = await api.get(`/rest/v1/profiles?id=eq.${user_id}`);
        const [role] = await api.get(`/rest/v1/user_roles?user_id=eq.${user_id}`);
        const permissions = {
            isAdmin: role?.role === "admin",
            isManager: role?.role === "gestor",
            isDoctor: role?.role === "medico",
            isSecretary: role?.role === "secretaria",
            isAdminOrManager: role?.role === "admin" || role?.role === "gestor" ? true : false,
        };

        return {
            user: {
                id: user_id,
                email: profile?.email ?? "—",
                email_confirmed_at: null,
                created_at: profile?.created_at ?? "—",
                last_sign_in_at: null,
            },
            profile: {
                id: profile?.id ?? user_id,
                full_name: profile?.full_name ?? "—",
                email: profile?.email ?? "—",
                phone: profile?.phone ?? "—",
                avatar_url: profile?.avatar_url ?? null,
                disabled: profile?.disabled ?? false,
                created_at: profile?.created_at ?? null,
                updated_at: profile?.updated_at ?? null,
            },
            roles: [role?.role ?? "—"],
            permissions,
        };
    },

    async update_user(userId, { full_name, email, phone, role, department }) {
        await api.patch(`/rest/v1/profiles?id=eq.${userId}`, { full_name, email, phone });
        await api.patch(`/rest/v1/user_roles?user_id=eq.${userId}`, { role });
        if (role === "secretaria" && department !== undefined) {
            await api.patch(`/rest/v1/secretaries?user_id=eq.${userId}`, { department });
        }
        if (role === "gestor" && department !== undefined) {
            await api.patch(`/rest/v1/managers?user_id=eq.${userId}`, { department });
        }
    },

    async delete_user(userId) {
        // tenta limpar tabelas operacionais antes de remover perfil (ignora se não existir)
        try { await api.delete(`/rest/v1/secretaries?user_id=eq.${userId}`); } catch (_) {}
        try { await api.delete(`/rest/v1/managers?user_id=eq.${userId}`); } catch (_) {}
        await api.delete(`/rest/v1/user_roles?user_id=eq.${userId}`);
        return await api.delete(`/rest/v1/profiles?id=eq.${userId}`);
    },

    async resetPassword(email) {
        if (!email) throw new Error("Email é obrigatório para resetar a senha.");

        try {
            const redirectUrl = typeof window !== "undefined"
                ? `${window.location.origin}/reset-password`
                : undefined;

            const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/request-password-reset`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                },
                body: JSON.stringify({ email, ...(redirectUrl && { redirect_url: redirectUrl }) }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                console.error("Erro no resetPassword:", res.status, data);
                throw new Error(`Erro ${res.status}: ${data.detail || data.title || "Falha ao resetar senha."}`);
            }

            console.log("✅ Reset de senha:", data);
            return data;
        } catch (err) {
            console.error("❌ Erro na chamada resetPassword:", err);
            throw err instanceof Error ? err : new Error("Erro inesperado na recuperação de senha.");
        }
    },
};
