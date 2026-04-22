export async function login(email, senha) {
    console.log("🔐 Iniciando login...");
    const res = await fetch(`${BASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            apikey: API_KEY,
            Prefer: "return=representation",
        },
        body: JSON.stringify({
            email: email,
            password: senha,
        }),
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error("❌ Erro no login:", res.status, msg);
        throw new Error(`Erro ao autenticar: ${res.status} - ${msg}`);
    }

    const data = await res.json();
    console.log("✅ Login bem-sucedido:", data);

        if (typeof window !== "undefined" && data.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user_info", JSON.stringify(data.user));
}


    return data;
}

/**
 * Função de logout.
 */
async function logout() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        await fetch(`${BASE_URL}/auth/v1/logout`, {
            method: "POST",
            headers: {
                apikey: API_KEY,
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error("Falha ao invalidar token no servidor:", error);
    } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("user_info");
    }
}
