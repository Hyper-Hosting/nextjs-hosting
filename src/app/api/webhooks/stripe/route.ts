import { env } from "@/data/env/server";
import { getTierByPriceId } from "@/data/subscriptionTiers";
import {
  createServerSubscription,
  deleteServerSubscription,
  updateServerSubscription,
} from "@/server/db/servers";
//import { updateUserSubscription } from "@/server/db/subscriptions";
import { NextRequest } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  const event = await stripe.webhooks.constructEvent(
    await request.text(),
    request.headers.get("stripe-signature") as string,
    env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case "customer.subscription.deleted": {
      await handleDelete(event.data.object);
      break;
    }
    case "customer.subscription.updated": {
      await handleUpdate(event.data.object);
      break;
    }
    case "customer.subscription.created": {
      await handleCreate(event.data.object);
      break;
    }
  }

  return new Response(null, { status: 200 });
}

async function handleCreate(subscription: Stripe.Subscription) {
  const tier = getTierByPriceId(subscription.items.data[0].price.id);
  const clerkUserId = subscription.metadata.clerkUserId;
  if (clerkUserId == null || tier == null) {
    return new Response(null, { status: 500 });
  }

  const customer = subscription.customer;
  const customerId = typeof customer === "string" ? customer : customer.id;

  return await createServerSubscription(
    { clerkUserId, stripeCustomerId: customerId, tierName: tier.name },
    {
      tier: tier.name,
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionItemId: subscription.items.data[0].id,
      cancel_at_period_end: subscription.cancel_at_period_end,
    }
  );
}

async function handleUpdate(subscription: Stripe.Subscription) {
  if (subscription.status == "canceled") return;

  const tier = getTierByPriceId(subscription.items.data[0].price.id);
  const customer = subscription.customer;
  const customerId = typeof customer === "string" ? customer : customer.id;
  if (tier == null) {
    return new Response(null, { status: 500 });
  }

  return await updateServerSubscription({
    stripeSubscriptionId: subscription.id,
    tier: tier.name,
    customerId,
    cancel_at_period_end: subscription.cancel_at_period_end,
  });
}

async function handleDelete(subscription: Stripe.Subscription) {
  const customer = subscription.customer;
  const customerId = typeof customer === "string" ? customer : customer.id;
  const stripeSubscriptionId = subscription.id;

  return await deleteServerSubscription({
    stripeCustomerId: customerId,
    stripeSubscriptionId,
  });
}
