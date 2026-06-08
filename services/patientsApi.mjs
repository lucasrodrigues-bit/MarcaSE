import { api } from "./api.mjs";

export const patientsService = {
    list: () => api.get("/rest/v1/patients"),

    getById: (id) => {
        console.log("getById chamado", id);
        return api.get(`/rest/v1/patients?id=eq.${id}`);
    },

    create: (data) => api.post("/rest/v1/patients", data),
    update: (id, data) => api.patch(`/rest/v1/patients?id=eq.${id}`, data),

    delete: async (id) => {
        // Remove dependentes antes de remover o paciente para evitar violação de FK
        await api.delete(`/rest/v1/reports?patient_id=eq.${id}`);
        await api.delete(`/rest/v1/appointments?patient_id=eq.${id}`);
        return api.delete(`/rest/v1/patients?id=eq.${id}`);
    },
};