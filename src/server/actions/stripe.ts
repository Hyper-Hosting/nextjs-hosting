"use server";

import { subscriptionTiers, TierNames } from "@/data/subscriptionTiers";
import { auth, currentUser, User } from "@clerk/nextjs/server";
import { getUserSubscription } from "../db/subscriptions";
import { Stripe } from "stripe";
import { env as serverEnv } from "@/data/env/server";
import { env as clientEnv } from "@/data/env/client";
import { redirect } from "next/navigation";
import { getUser } from "../db/users";
import { getServer } from "../db/servers";

const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY);

export async function createCancelSession(_id: string) {
  const server = await getServer(_id);

  if (server == null) return { error: true };

  const user = await getUser(server.clerkUserId);

  if (user?.stripeCustomerId == null || server.stripeSubscriptionId == null) {
    return new Response(null, { status: 500 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${clientEnv.NEXT_PUBLIC_SERVER_URL}/dashboard/servers`,
    flow_data: {
      type: "subscription_cancel",
      subscription_cancel: {
        subscription: server.stripeSubscriptionId,
      },
    },
  });

  redirect(portalSession.url);
}

export async function createCustomerPortalSession() {
  const { userId } = auth();
  if (userId == null) return { error: true };

  const userInfo = await getUser(userId);
  if (userInfo?.stripeCustomerId == null) {
    return { error: true };
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: userInfo.stripeCustomerId,
    return_url: `${clientEnv.NEXT_PUBLIC_SERVER_URL}/dashboard/servers`,
  });

  redirect(portalSession.url);
}

export async function createCheckoutSession(tier: TierNames) {
  const user = await currentUser();
  if (user == null) return { error: true };

  const userInfo = await getUser(user.id);
  const stripeCustomerId = userInfo?.stripeCustomerId;

  if (stripeCustomerId == null) {
    const url = await getCheckoutSession(tier, user);
    if (url == null) return { error: true };
    redirect(url);
  } else {
    const url = await getCheckoutSession(tier, user, stripeCustomerId);
    if (url == null) return { error: true };
    redirect(url);
  }
}

async function getCheckoutSession(
  tier: TierNames,
  user: User,
  stripeCustomerId?: string
) {
  let identification = "customer_email";
  let idValue = user.primaryEmailAddress?.emailAddress;

  if (stripeCustomerId) {
    identification = "customer";
    idValue = stripeCustomerId;
  }

  const session = await stripe.checkout.sessions.create({
    [identification]: idValue,
    subscription_data: {
      metadata: {
        clerkUserId: user.id,
      },
    },
    line_items: [
      {
        price: subscriptionTiers[tier].stripePriceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${clientEnv.NEXT_PUBLIC_SERVER_URL}/dashboard/servers`,
    cancel_url: `${clientEnv.NEXT_PUBLIC_SERVER_URL}/dashboard/servers`,
  });

  return session.url;
}

async function getSubscriptionUpgradeSession(
  tier: TierNames,
  subscription: {
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    stripeSubscriptionItemId: string | null;
  }
) {
  if (
    subscription.stripeCustomerId == null ||
    subscription.stripeSubscriptionId == null ||
    subscription.stripeSubscriptionItemId == null
  ) {
    throw new Error();
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${clientEnv.NEXT_PUBLIC_SERVER_URL}/dashboard/subscription`,
    flow_data: {
      type: "subscription_update_confirm",
      subscription_update_confirm: {
        subscription: subscription.stripeSubscriptionId,
        items: [
          {
            id: subscription.stripeSubscriptionItemId,
            price: subscriptionTiers[tier].stripePriceId,
            quantity: 1,
          },
        ],
      },
    },
  });

  return portalSession.url;
}
