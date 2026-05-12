import { api } from "./api.mjs";

export const patientsService = {
    list: async () => {
        const [patients, profilesData] = await Promise.all([
            api.get("/rest/v1/patients"),
            api.get("/rest/v1/profiles?select=id,avatar_url"),
        ]);

        if (!Array.isArray(patients)) return patients ?? [];

        const profilesById = new Map();
        if (Array.isArray(profilesData)) {
            for (const p of profilesData) { if (p?.id) profilesById.set(p.id, p); }
        }

        return patients.map(p => ({
            ...p,
            avatar_url: profilesById.get(p.id)?.avatar_url ?? null,
        }));
    },

    getById: (id) => {
        console.log("getById chamado", id);
        return api.get(`/rest/v1/patients?id=eq.${id}`);
    },

    create: (data) => api.post("/rest/v1/patients", data),
    update: (id, data) => api.patch(`/rest/v1/patients?id=eq.${id}`, data),
    delete: (id) => api.delete(`/rest/v1/patients?id=eq.${id}`),
};
