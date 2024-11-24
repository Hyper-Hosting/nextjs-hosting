import { subscriptionTiers } from "@/data/subscriptionTiers";
import {
  CACHE_TAGS,
  dbCache,
  getUserTag,
  revalidateDbCache,
} from "@/lib/cache";
import { connectToDatabase } from "@/lib/mongoose";
import { UserSubscriptionsModel } from "@/models/UserSubscriptions";

export async function createUserSubscription(
  data: (typeof UserSubscriptionsModel)["schema"]["obj"]
) {
  await connectToDatabase();

  const newSubscription = await new UserSubscriptionsModel(data).save();

  if (newSubscription != null) {
    revalidateDbCache({
      tag: CACHE_TAGS.subscription,
      _id: newSubscription._id,
      userId: newSubscription.clerkUserId,
    });
  }

  return newSubscription;
}

export function getUserSubscription(userId: string) {
  const cacheFn = dbCache(getUserSubscriptionInternal, {
    tags: [getUserTag(userId, CACHE_TAGS.subscription)],
  });

  return cacheFn(userId);
}

export async function updateUserSubscription(
  where: Partial<typeof UserSubscriptionsModel.schema.obj>,
  data: Partial<typeof UserSubscriptionsModel.schema.obj>
) {
  await connectToDatabase();

  await UserSubscriptionsModel.findOneAndUpdate(where, data);
  const updateSubscription = await UserSubscriptionsModel.findOne(where);

  if (updateSubscription != null) {
    revalidateDbCache({
      tag: CACHE_TAGS.subscription,
      userId: updateSubscription.clerkUserId,
      _id: updateSubscription.id,
    });
  }
}

export async function getUserSubscriptionTier(userId: string) {
  const subscription = await getUserSubscription(userId);

  if (subscription == null) throw new Error("User has no subscription");

  return subscriptionTiers[subscription.tier];
}

async function getUserSubscriptionInternal(userId: string) {
  await connectToDatabase();
  return await UserSubscriptionsModel.findOne({
    clerkUserId: userId,
  });
}
