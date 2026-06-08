import { api } from "./api.mjs";

const PREFER_RETURN = { Prefer: "return=representation" };

export const AvailabilityService = {
    list: () => api.get("/rest/v1/doctor_availability"),
    listById: (doctorId) => api.get(`/rest/v1/doctor_availability?doctor_id=eq.${doctorId}`),
    create: (data) => api.post("/rest/v1/doctor_availability", data, { headers: PREFER_RETURN }),
    update: (id, data) => api.patch(`/rest/v1/doctor_availability?id=eq.${id}`, data, { headers: PREFER_RETURN }),
    delete: (id) => api.delete(`/rest/v1/doctor_availability?id=eq.${id}`),
};
