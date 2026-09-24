import CommunicationsDashboard from "@/components/communications/communications-dashboard";
import { buildCommunicationsDemo } from "@/services/communications-control-plane";

export default async function CommunicationsPage() {
  const controlPlane =
    await buildCommunicationsDemo();

  const snapshot =
    await controlPlane.getSnapshot();

  return (
    <CommunicationsDashboard
      snapshot={snapshot}
    />
  );
}