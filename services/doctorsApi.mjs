import { api } from "./api.mjs";

export const doctorsService = {
    list: async () => {
        const [doctors, profilesData] = await Promise.all([
            api.get("/rest/v1/doctors"),
            api.get("/rest/v1/profiles?select=id,avatar_url"),
        ]);

        if (!Array.isArray(doctors)) return doctors ?? [];

        const profilesById = new Map();
        if (Array.isArray(profilesData)) {
            for (const p of profilesData) { if (p?.id) profilesById.set(p.id, p); }
        }

        return doctors.map(d => ({
            ...d,
            avatar_url: profilesById.get(d.user_id)?.avatar_url ?? null,
        }));
    },
    getById: (id) => api.get(`/rest/v1/doctors?id=eq.${id}`).then(data => data[0]),
    async create(data) {
        return await api.post("/functions/v1/create-doctor", data);
    },
    update: (id, data) => api.patch(`/rest/v1/doctors?id=eq.${id}`, data),
    delete: (id) => api.delete(`/rest/v1/doctors?id=eq.${id}`),
};
