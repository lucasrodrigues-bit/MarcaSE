import Sidebar from "@/components/Sidebar";
import ScheduleForm from "@/components/schedule/schedule-form";

export default async function SecretaryAppointments({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  const { patientId } = await searchParams;
  return (
    <Sidebar>
      <ScheduleForm initialPatientId={patientId} />
    </Sidebar>
  );
}

