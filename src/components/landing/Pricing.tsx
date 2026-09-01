import { PaddlePricingTable } from "@/components/pricing/PaddlePricingTable";

interface PricingProps {
  country?: string;
  userEmail?: string;
  hasSession?: boolean;
}

export function Pricing({ country, userEmail }: PricingProps) {
  return (
    <section id="pricing" className="bg-background py-16 md:py-24 border-t border-zinc-100 dark:border-zinc-800">
      <PaddlePricingTable country={country} userEmail={userEmail} />
    </section>
  );
}
