const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const smsService = {
  /**
   * Envia um SMS de lembrete via Twilio
   * @param {Object} params
   * @param {string} params.phone_number - Ex: +5511999999999
   * @param {string} params.message - Mensagem de texto (1-1000 chars)
   * @param {string} [params.patient_id] - UUID opcional do paciente
   */
  async sendSms({ phone_number, message, patient_id }) {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        console.error("❌ [smsService] Nenhum token JWT encontrado.");
        return { success: false, error: "Token JWT não encontrado." };
      }

      const body = JSON.stringify({ phone_number, message, patient_id });

      console.log("📤 [smsService] Request body:", { phone_number, message, patient_id });

      const response = await fetch(`${BASE_URL}/functions/v1/send-sms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: API_KEY,
        },
        body,
      });

      const result = await response.json().catch(() => null);

      console.log("📥 [smsService] Response status:", response.status, "| Body:", result);

      if (!response.ok) {
        console.error("❌ [smsService] Falha no envio:", result);
        return { success: false, error: result };
      }

      console.log("✅ [smsService] SMS enviado com sucesso:", result);
      return result;
    } catch (err) {
      console.error("❌ [smsService] Erro inesperado:", err);
      return { success: false, error: err.message };
    }
  },
};
