import { TierNames } from "@/data/subscriptionTiers";
import {
  CACHE_TAGS,
  dbCache,
  getIdTag,
  getUserTag,
  revalidateDbCache,
} from "@/lib/cache";
import { connectToDatabase } from "@/lib/mongoose";
import { ServersModel } from "@/models/Servers";
import { UsersModel } from "@/models/User";
import { getUser } from "./users";
import {
  createUser,
  createServer as createServerPtero,
} from "../actions/ptero";

export function getServer(_id: string) {
  const cacheFn = dbCache(getServerInternal, {
    tags: [getIdTag(_id, CACHE_TAGS.servers)],
  });

  return cacheFn(_id);
}

export function getServers(
  clerkUserId: string,
  { limit }: { limit?: number } = {}
) {
  const cacheFn = dbCache(getServersInternal, {
    tags: [getUserTag(clerkUserId, CACHE_TAGS.servers)],
  });

  return cacheFn(clerkUserId, { limit });
}

async function getServerInternal(_id: string) {
  await connectToDatabase();

  const server = await ServersModel.findOne({
    _id,
  });

  if (!server) return null;

  return {
    _id: server._id.toString(),
    clerkUserId: server.clerkUserId,
    name: server.name,
    url: server.url,
    tier: server.tier,
    stripeSubscriptionItemId: server.stripeSubscriptionItemId,
    stripeSubscriptionId: server.stripeSubscriptionId,
    cancel_at_period_end: server.cancel_at_period_end,
  };
}

async function getServersInternal(
  clerkUserId: string,
  { limit }: { limit?: number }
) {
  await connectToDatabase();

  const results = await ServersModel.find(
    {
      clerkUserId,
    },
    {
      _id: 1,
      name: 1,
      url: 1,
      cancel_at_period_end: 1,
      stripeSubscriptionId: 1,
    }
  )
    .sort({
      createdAt: -1,
    })
    .limit(limit || 0);

  return results.map((server) => ({
    _id: server._id.toString(),
    name: server.name,
    url: server.url,
    cancel_at_period_end: server.cancel_at_period_end,
    stripeSubscriptionId: server.stripeSubscriptionId,
  }));
}

export async function createServerSubscription(
  {
    clerkUserId,
    stripeCustomerId,
    tierName,
  }: { clerkUserId: string; stripeCustomerId: string; tierName: TierNames },
  data: Partial<typeof ServersModel.schema.obj>
) {
  await connectToDatabase();

  const userUpdate = await UsersModel.findOneAndUpdate(
    {
      clerkUserId,
    },
    {
      stripeCustomerId,
    }
  );

  if (userUpdate != null) {
    revalidateDbCache({
      tag: CACHE_TAGS.users,
      userId: clerkUserId,
      _id: userUpdate._id,
    });
  }

  const newServerData = await createServer(tierName, clerkUserId);

  const newServer = await new ServersModel({
    clerkUserId,
    url: newServerData.url,
    tier: data.tier,
    stripeSubscriptionItemId: data.stripeSubscriptionItemId,
    stripeSubscriptionId: data.stripeSubscriptionId,
    cancel_at_period_end: data.cancel_at_period_end,
    pteroIdentifier: newServerData.identifier,
    pteroId: newServerData.id,
  }).save();

  if (newServer != null) {
    revalidateDbCache({
      tag: CACHE_TAGS.servers,
      userId: clerkUserId,
      _id: newServer._id,
    });
  }
}

export async function updateServerSubscription({
  stripeSubscriptionId,
  tier,
  customerId,
  cancel_at_period_end,
}: {
  stripeSubscriptionId: string;
  tier: TierNames;
  customerId: string;
  cancel_at_period_end: Boolean;
}) {
  await connectToDatabase();

  const user = await UsersModel.findOne({
    stripeCustomerId: customerId,
  });

  if (!user) return;

  const serverUpdate = await ServersModel.findOneAndUpdate(
    {
      clerkUserId: user.clerkUserId,
      stripeSubscriptionId,
    },
    {
      tier,
      cancel_at_period_end,
    }
  );

  // TODO DO THIS
  await modifyServer();

  if (serverUpdate != null) {
    revalidateDbCache({
      tag: CACHE_TAGS.servers,
      userId: user.clerkUserId,
      _id: serverUpdate._id,
    });
  }
}

async function createServer(tierName: TierNames, clerkUserId: string) {
  const user = await getUser(clerkUserId);
  let pteroId = user?.pteroId;

  if (!pteroId) {
    pteroId = await createUser(clerkUserId);
  }

  const newServerData = await createServerPtero(pteroId, tierName);
  return newServerData;
}

function modifyServer() {
  // TODO MODIFY THE SERVER ON THE HOST
  return true;
}

function deleteServer() {
  // TODO MODIFY THE SERVER ON THE HOST
  return true;
}

export async function deleteServerSubscription({
  stripeCustomerId,
  stripeSubscriptionId,
}: {
  stripeCustomerId: string;
  stripeSubscriptionId: string;
}) {
  await connectToDatabase();

  const user = await UsersModel.findOne({
    stripeCustomerId,
  });

  if (!user)
    throw new Error(`Cannot find user! Stripe ID: ${stripeCustomerId}`);

  const deletedServer = await ServersModel.findOneAndDelete({
    clerkUserId: user.clerkUserId,
    stripeSubscriptionId,
  });

  // TODO DO THIS
  await deleteServer();

  if (deletedServer != null) {
    revalidateDbCache({
      tag: CACHE_TAGS.servers,
      userId: user.clerkUserId,
      _id: deletedServer._id,
    });
  }
}
