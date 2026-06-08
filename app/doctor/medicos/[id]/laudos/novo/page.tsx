"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { reportsApi } from "@/services/reportsApi.mjs";
import Sidebar from "@/components/Sidebar";

export default function NovoLaudoPage() {
    const router = useRouter();
    const params = useParams();
    const patientId = params.id as string;
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!patientId) return;

        reportsApi.createReport({
            patient_id: patientId,
            status: "draft",
            exam: "",
            diagnosis: "",
            conclusion: "",
            cid_code: "",
            content_html: "",
            content_json: {},
            requested_by: "",
            hide_date: false,
            hide_signature: false,
        })
            .then((data: any) => {
                const created = Array.isArray(data) ? data[0] : data;
                if (created?.id) {
                    router.replace(`/doctor/medicos/${patientId}/laudos/${created.id}/editar`);
                } else {
                    setError("Não foi possível criar o laudo. Tente novamente.");
                }
            })
            .catch(() => {
                setError("Erro ao criar laudo. Verifique sua conexão e tente novamente.");
            });
    }, [patientId]);

    if (error) {
        return (
            <Sidebar>
                <div className="flex flex-col justify-center items-center h-full gap-4">
                    <p className="text-destructive">{error}</p>
                </div>
            </Sidebar>
        );
    }

    return (
        <Sidebar>
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground">Criando novo laudo...</span>
            </div>
        </Sidebar>
    );
}