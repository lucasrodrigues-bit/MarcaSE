"use client";

import Sidebar from "@/components/Sidebar";
import UserCreationForm from "@/components/UserCreationForm";

export default function NovoUsuarioSecretariaPage() {
  return (
    <Sidebar>
      <UserCreationForm
        allowedRoles={["paciente", "medico"]}
        successHref="/secretary/pacientes"
        cancelHref="/secretary/pacientes"
      />
    </Sidebar>
  );
}
