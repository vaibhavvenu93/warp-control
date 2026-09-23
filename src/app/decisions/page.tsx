import {
  DecisionsDashboard,
} from "@/components/decisions/decisions-dashboard";

import {
  buildRevenueDemo,
} from "@/services/control-plane";

export default async function DecisionsPage() {
  const snapshot =
    await buildRevenueDemo();

  return (
    <DecisionsDashboard
      snapshot={snapshot}
    />
  );
}