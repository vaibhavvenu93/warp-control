import TalentDashboard from "@/components/talent/talent-dashboard";
import { buildTalentDemo } from "@/services/talent-control-plane";

export default async function TalentPage() {
  const snapshot =
    await buildTalentDemo();

  return (
    <TalentDashboard
      snapshot={snapshot}
    />
  );
}