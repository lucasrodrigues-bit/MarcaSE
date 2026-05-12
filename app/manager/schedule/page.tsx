import Sidebar from "@/components/Sidebar";
import ScheduleForm from "@/components/schedule/schedule-form";

export default async function ManagerSchedulePage({
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
