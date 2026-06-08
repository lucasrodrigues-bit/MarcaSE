const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const smsService = {
  /**
   * Envia um SMS via Supabase Edge Function (send-sms)
   * @param {Object} params
   * @param {string} params.phone_number - Ex: +5511999999999
   * @param {string} params.message - Mensagem de texto (1-1000 chars)
   * @param {string} [params.patient_id] - UUID opcional do paciente
   * @param {string} [params.token] - JWT opcional (se não estiver no localStorage)
   */
  async sendSms({ phone_number, message, patient_id, token: tokenOverride }) {
    try {
      // Aceita token por parâmetro OU do localStorage (útil pós-cadastro)
      const token = tokenOverride
        || (typeof window !== "undefined" ? localStorage.getItem("token") : null);

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

  /**
   * Envia SMS de confirmação de cadastro usando a service_role key
   * Ideal para ser chamado de uma Edge Function no backend
   */
  async sendConfirmationSms(phone_number, patientName) {
    const message = `Olá, ${patientName}! Seu cadastro no MarcaSE foi realizado com sucesso. Bem-vindo(a)! 🎉`;
    // Para uso no frontend após cadastro, passe o token retornado pelo register
    return this.sendSms({ phone_number, message });
  },
};
