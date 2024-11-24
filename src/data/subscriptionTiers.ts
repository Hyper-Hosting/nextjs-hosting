import { env } from "./env/server";

export type TierNames = keyof typeof subscriptionTiers;

export const subscriptionTiers = {
  Limited: {
    name: "Limited",
    priceInCents: 250,
    diskSpace: 500,
    memory: 256,
    backups: 0,
    stripePriceId: env.STRIPE_LIMITED_PLAN_PRICE_ID,
  },
  Basic: {
    name: "Basic",
    priceInCents: 500,
    diskSpace: 1000,
    memory: 512,
    backups: 1,
    stripePriceId: env.STRIPE_BASIC_PLAN_PRICE_ID,
  },
  Standard: {
    name: "Standard",
    priceInCents: 1000,
    diskSpace: 2000,
    memory: 1000,
    backups: 3,
    stripePriceId: env.STRIPE_STANDARD_PLAN_PRICE_ID,
  },
  Premium: {
    name: "Premium",
    priceInCents: 2000,
    diskSpace: 4000,
    memory: 2000,
    backups: 5,
    stripePriceId: env.STRIPE_PREMIUM_PLAN_PRICE_ID,
  },
} as const;

export const subscriptionTiersInOrder = [
  subscriptionTiers.Limited,
  subscriptionTiers.Basic,
  subscriptionTiers.Standard,
  subscriptionTiers.Premium,
] as const;

export function getTierByName(name: TierNames) {
  return Object.values(subscriptionTiers).find((tier) => tier.name === name);
}

export function getTierByPriceId(stripePriceId: string) {
  return Object.values(subscriptionTiers).find(
    (tier) => tier.stripePriceId === stripePriceId
  );
}
