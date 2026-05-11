import { api } from "./api.mjs";

const PREFER_RETURN = { Prefer: "return=representation" };

export const exceptionsService = {
    list: () => api.get("/rest/v1/doctor_exceptions"),
    listByDoctorId: (doctorId) => api.get(`/rest/v1/doctor_exceptions?doctor_id=eq.${doctorId}&order=date.desc`),
    create: (data) => api.post("/rest/v1/doctor_exceptions", data, { headers: PREFER_RETURN }),
    delete: (id) => api.delete(`/rest/v1/doctor_exceptions?id=eq.${id}`),
};
