import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { env } from "@/data/env/server";
import {
  createUserSubscription,
  getUserSubscription,
} from "@/server/db/subscriptions";
import { createUser, deleteUser } from "@/server/db/users";
import { Stripe } from "stripe";
import { deleteServerSubscription, getServers } from "@/server/db/servers";
import { ServersModel } from "@/models/Servers";
import { connectToDatabase } from "@/lib/mongoose";
import { CACHE_TAGS, revalidateDbCache } from "@/lib/cache";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export async function POST(req: Request) {
  const headerPayload = headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  switch (event.type) {
    case "user.created": {
      // User created
      await createUser(event.data.id);
      break;
    }
    case "user.deleted": {
      // User deleted
      if (event.data.id != null) {
        await connectToDatabase();
        const userServers = await getServers(event.data.id);

        await ServersModel.deleteMany({
          clerkUserId: event.data.id,
        });

        revalidateDbCache({
          tag: CACHE_TAGS.servers,
          userId: event.data.id,
        });

        for (const server of userServers) {
          await stripe.subscriptions.cancel(server.stripeSubscriptionId);
        }

        await deleteUser(event.data.id);
      }
    }
  }

  return new Response("", { status: 200 });
}
