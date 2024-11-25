import { subscriptionTiersInOrder } from "@/data/subscriptionTiers";
import { PricingCard } from "../../_components/PricingCard";

export default function NewServerPage() {
  return (
    <>
      <h1 className="mb-6 text-3xl font-semibold">New Server Subscription</h1>
      <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid gap-4 max-w-screen-xl mx-auto">
        {subscriptionTiersInOrder.map((t) => (
          <PricingCard key={t.name} {...t} />
        ))}
      </div>
    </>
  );
}
