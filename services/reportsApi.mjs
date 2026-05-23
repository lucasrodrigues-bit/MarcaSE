import { api } from "./api.mjs";

const REPORTS_API_URL = "/rest/v1/reports";

export const reportsApi = {
  getAllReports: async (filters = {}) => {
    const params = ["order=created_at.desc"];
    if (filters.patient_id) params.push(`patient_id=eq.${filters.patient_id}`);
    if (filters.status) params.push(`status=eq.${filters.status}`);
    if (filters.created_by) params.push(`created_by=eq.${filters.created_by}`);
    try {
      return await api.get(`${REPORTS_API_URL}?${params.join("&")}`);
    } catch (error) {
      console.error("Failed to fetch all reports:", error);
      throw error;
    }
  },

  getReports: async (patientId) => {
    try {
      const data = await api.get(`${REPORTS_API_URL}?patient_id=eq.${patientId}`);
      return data;
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      throw error;
    }
  },
  getReportById: async (reportId) => {
    try {
      const data = await api.get(`${REPORTS_API_URL}?id=eq.${reportId}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch report ${reportId}:`, error);
      throw error;
    }
  },
  createReport: async (reportData) => {
    try {
      const data = await api.post(REPORTS_API_URL, reportData, {
        headers: { Prefer: 'return=representation' },
      });
      return data;
    } catch (error) {
      console.error("Failed to create report:", error);
      throw error;
    }
  },
  updateReport: async (reportId, reportData) => {
    try {
      const data = await api.patch(`${REPORTS_API_URL}?id=eq.${reportId}`, reportData);
      return data;
    } catch (error) {
      console.error(`Failed to update report ${reportId}:`, error);
      throw error;
    }
  },
  sendToPatient: async (reportId, patientId) => {
    try {
      const data = await api.patch(`${REPORTS_API_URL}?id=eq.${reportId}`, {
        patient_id: patientId,
        status: 'completed',
      });
      return data;
    } catch (error) {
      console.error(`Failed to send report ${reportId} to patient:`, error);
      throw error;
    }
  },
};
