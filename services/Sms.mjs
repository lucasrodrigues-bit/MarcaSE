const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const smsService = {
  /**
   * Envia um SMS de lembrete via Twilio
   * @param {Object} params
   * @param {string} params.phone_number - Ex: +5511999999999
   * @param {string} params.message - Mensagem de texto
   * @param {string} [params.patient_id] - ID opcional do paciente
   */
  async sendSms({ phone_number, message, patient_id }) {
    try {
      // 🔹 Busca o token salvo pelo login
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("❌ Nenhum token JWT encontrado no localStorage (chave: 'token').");
        return { success: false, error: "Token JWT não encontrado." };
      }

      const body = JSON.stringify({
        phone_number,
        message,
        patient_id,
      });

      console.log("[smsService] Enviando SMS para:", phone_number);

      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔑 autenticação Supabase
        },
        body,
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("❌ Falha no envio do SMS:", result);
        return { success: false, error: result };
      }

      console.log("✅ SMS enviado com sucesso:", result);
      return result;
    } catch (err) {
      console.error("❌ Erro inesperado ao enviar SMS:", err);
      return { success: false, error: err.message };
    }
  },
};
