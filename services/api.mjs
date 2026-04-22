const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function request(endpoint, options = {}) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers = {
        "Content-Type": "application/json",
        apikey: API_KEY,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => response.text());
        console.error("Erro na requisição:", response.status, errorBody);
        throw new Error(`Erro na API: ${errorBody.message || JSON.stringify(errorBody)}`);
    }
        if (response.status === 204) {
                return null;
            }

            const text = await response.text();
            try {
                return JSON.parse(text);
            } catch {
                return text || null;
    }


    
}

export const api = {
    getSession: () => request("/auth/v1/user"),

    get: (endpoint, options) => request(endpoint, { method: "GET", ...options }),
    post: (endpoint, data, options) => request(endpoint, { method: "POST", body: JSON.stringify(data), ...options }),
    patch: (endpoint, data, options) => request(endpoint, { method: "PATCH", body: JSON.stringify(data), ...options }),
    delete: (endpoint, options) => request(endpoint, { method: "DELETE", ...options }),
    logout: logout,
    storage: {
        async upload(bucket, path, file) {
            const token = localStorage.getItem("token");
            const response = await fetch(`${BASE_URL}/storage/v1/object/${bucket}/${path}`, {
                method: 'POST',
                headers: {
                    'Content-Type': file.type,
                    'apikey': API_KEY,
                    'Authorization': `Bearer ${token}`,
                    'x-upsert': 'true' 
                },
                body: file,
            });

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(`Erro no upload: ${errorBody.message}`);
            }
            return response.json();
        }
    },
};