"use client";

import Sidebar from "@/components/Sidebar";
import UserCreationForm from "@/components/UserCreationForm";

export default function NovoUsuarioPage() {
  return (
    <Sidebar>
      <UserCreationForm
        allowedRoles={["paciente", "medico", "secretaria", "gestor", "admin"]}
        successHref="/manager/usuario"
        cancelHref="/manager/usuario"
      />
    </Sidebar>
  );
}
