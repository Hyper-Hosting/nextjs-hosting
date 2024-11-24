import {
  CACHE_TAGS,
  dbCache,
  getUserTag,
  revalidateDbCache,
} from "@/lib/cache";
import { connectToDatabase } from "@/lib/mongoose";
import { ServersModel } from "@/models/Servers";
import { UsersModel } from "@/models/User";

export async function deleteUser(clerkUserId: string) {
  await connectToDatabase();

  await UsersModel.deleteOne({
    clerkUserId,
  });

  revalidateDbCache({
    tag: CACHE_TAGS.users,
    userId: clerkUserId,
  });
}

export async function createUser(clerkUserId: string) {
  await connectToDatabase();

  const prevUser = await UsersModel.findOne({
    clerkUserId,
  });

  if (prevUser) return prevUser;

  const newUser = await new UsersModel({
    clerkUserId,
  }).save();

  if (newUser != null) {
    revalidateDbCache({
      tag: CACHE_TAGS.users,
      _id: newUser._id,
      userId: clerkUserId,
    });
  }

  return newUser;
}

export function getUser(clerUserId: string) {
  const cacheFn = dbCache(getUserInternal, {
    tags: [getUserTag(clerUserId, CACHE_TAGS.users)],
  });

  return cacheFn(clerUserId);
}

async function getUserInternal(clerkUserId: string) {
  await connectToDatabase();

  return await UsersModel.findOne({
    clerkUserId,
  });
}
